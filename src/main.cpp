#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "DHT.h"
#include <WiFi.h>
#include <PubSubClient.h>
// =================== WIFI  ==================
const char *ssid = "Wokwi-GUEST";
const char* password = "";

// ================== SET SERVER ================
const char *mqttServer = "broker.hivemq.com";
int port = 1883;

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

// IoT23CLC09/Group5/#
// ================= Publish topics ==================
const char *soilData = "IoT23CLC09/Group5/data/soil";
const char *airData = "IoT23CLC09/Group5/data/air";
const char *tempData = "IoT23CLC09/Group5/data/temperature";
const char *lightStatus = "IoT23CLC09/Group5/status/light";
const char *pumpStatus = "IoT23CLC09/Group5/status/pump";

// ================== Subscribe Topics ==================
const char *settingsCmd = "IoT23CLC09/Group5/cmd/settings";
// ================== PIN DEFINE ==================
#define LED_PIN        15
#define BUZZER_PIN     5
#define BUTTON_PIN     2
#define SOIL_POT_PIN   34   // pot1 -> Soil moisture (0..100%)
#define CONFIG_POT_PIN 35   // pot2 -> Config adjust
#define DHT_PIN        32
#define DHT_TYPE       DHT22

// LCD I2C
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHT_PIN, DHT_TYPE);

// ================== STATES & MODE ==================
enum Mode {
  MODE_NORMAL,
  MODE_CONFIG
};

Mode currentMode = MODE_NORMAL;
Mode lastMode    = MODE_NORMAL;

// Screens
int normalScreen = 0;
const int NORMAL_SCREEN_COUNT = 4;
int lastNormalScreen = -1;      // để biết lúc nào đổi screen

int configScreen = 0;
const int CONFIG_SCREEN_COUNT = 3;
int lastConfigScreen = -1;

// ================== SENSOR / CONFIG VARS ==================
float soilMoisture = 0;      // 0..100 (from pot1)
float airHumidity = 0;       // from DHT22
float airTemperature = 0;    // from DHT22

// Configurable parameters
int cfgWaterLiters       = 10;  // Lít nước / lần tưới
int cfgMinutesPerHour    = 10;  // Phút tưới trong 1 giờ
int cfgMoistureThreshold = 40;  // Ngưỡng % đất dưới mức này mới tưới
int cfgSoilMin           = 40;
int cfgSoilMax           = 80;
int cfgTempMin           = 18; // Thêm biến cho Nhiệt độ Min
int cfgTempMax           = 28; // Thêm biến cho Nhiệt độ Max
// Value being adjusted in config mode (preview)
int editingValue = 0;

// ================== TIMING (millis-based) ==================
// Button debounce & click detection
bool buttonState       = LOW;
bool lastButtonReading = LOW;
unsigned long lastDebounceTime   = 0;
const unsigned long debounceDelay = 50;

int buttonPressCount = 0;
unsigned long firstPressTime = 0;
const unsigned long doubleClickWindow = 500; // ms

// Blink for config
bool blinkOn = true;
unsigned long lastBlinkTime = 0;
const unsigned long blinkInterval = 300; // ms

// Buzzer pattern (normal mode: 1s ON, 4s OFF)
bool buzzerOn = false;
unsigned long lastBuzzerTime = 0;
const unsigned long buzzerOnDuration  = 1000; // 1s
const unsigned long buzzerCyclePeriod = 5000; // 5s total

// DHT update timing
unsigned long lastDhtReadTime = 0;
const unsigned long dhtReadInterval = 2000; // 2s

// LCD refresh timing
unsigned long lastLcdUpdateTime = 0;
const unsigned long lcdUpdateInterval = 500; // 0.5s

// ================== FORWARD DECLARATIONS ==================
void handleButton();
void processClickLogic();
void handleSingleClick();
void handleDoubleClick();

void updateSensors();
void updateBuzzer();
void updateBlink();
void updateLCD();

void showNormalScreen(bool forceClear);
void showConfigScreen(bool forceClear);
int  mapPotToRange(int potValue, int minVal, int maxVal);

void wifiConnect();
void mqttConnect();
void callback(char* topic, byte* payload, unsigned int length);
// ================== SETUP ==================
void setup() {
  Serial.begin(115200);

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);  // có pull-down ngoài

  pinMode(SOIL_POT_PIN, INPUT);
  pinMode(CONFIG_POT_PIN, INPUT);

  dht.begin();

  lcd.init();
  lcd.backlight();

  digitalWrite(LED_PIN, HIGH);       // Normal mode: LED sáng sẵn
  digitalWrite(BUZZER_PIN, LOW);

  lcd.setCursor(0, 0);
  lcd.print("Smart Irrigation");
  lcd.setCursor(0, 1);
  lcd.print("Starting...");
  delay(1000);
  wifiConnect();
  mqttClient.setServer(mqttServer, port);
  mqttClient.setCallback(callback);
  mqttClient.setKeepAlive(60);
}

// ================== MAIN LOOP ==================
void loop() {
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.print("Reconnecting to WiFi");
    wifiConnect();
  }

  if (!mqttClient.connected())
  {
    mqttConnect();
  }
  mqttClient.loop();

  unsigned long now = millis();

  handleButton();
  processClickLogic();

  updateSensors();
  updateBuzzer();
  updateBlink();

  if (now - lastLcdUpdateTime >= lcdUpdateInterval) {
    lastLcdUpdateTime = now;
    updateLCD();
  }
}

// ================== BUTTON HANDLING ==================
void handleButton() {
  int reading = digitalRead(BUTTON_PIN);
  unsigned long now = millis();

  if (reading != lastButtonReading) {
    lastDebounceTime = now;
  }

  if ((now - lastDebounceTime) > debounceDelay) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == HIGH) {
        if (buttonPressCount == 0) {
          firstPressTime = now;
        }
        buttonPressCount++;
      }
    }
  }
  lastButtonReading = reading;
}

void processClickLogic() {
  if (buttonPressCount == 0) return;

  unsigned long now = millis();
  if (now - firstPressTime > doubleClickWindow) {
    if (buttonPressCount == 1) {
      handleSingleClick();
    } else {
      handleDoubleClick();
    }
    buttonPressCount = 0;
  }
}

void handleSingleClick() {
  if (currentMode == MODE_NORMAL) {
    // Single click: chuyển screen normal
    normalScreen = (normalScreen + 1) % NORMAL_SCREEN_COUNT;
  } else {
    // MODE_CONFIG: single click để "chốt" và nhảy screen config
    switch (configScreen) {
      case 0:
        cfgWaterLiters = editingValue;
        break;
      case 1:
        cfgMinutesPerHour = editingValue;
        break;
      case 2:
        cfgMoistureThreshold = editingValue;
        break;
    }
    configScreen = (configScreen + 1) % CONFIG_SCREEN_COUNT;

    switch (configScreen) {
      case 0:
        editingValue = cfgWaterLiters;
        break;
      case 1:
        editingValue = cfgMinutesPerHour;
        break;
      case 2:
        editingValue = cfgMoistureThreshold;
        break;
    }
  }
}

void handleDoubleClick() {
  if (currentMode == MODE_NORMAL) {
    currentMode = MODE_CONFIG;
    configScreen = 0;
    editingValue = cfgWaterLiters;
    Serial.println(">> Enter CONFIG mode");
  } else {
    currentMode = MODE_NORMAL;
    digitalWrite(LED_PIN, HIGH);
    lcd.backlight();
    Serial.println(">> Back to NORMAL mode");
  }
}

// ================== SENSORS ==================
void updateSensors() {
  unsigned long now = millis();

  int rawSoil = analogRead(SOIL_POT_PIN);
  soilMoisture = map(rawSoil, 0, 4095, 0, 100);
  
  if (now - lastDhtReadTime >= dhtReadInterval) {
    lastDhtReadTime = now;
    mqttClient.publish(soilData, String(soilMoisture).c_str());
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (!isnan(h)){
      airHumidity = h;
      mqttClient.publish(airData, String(airHumidity).c_str());
      // Serial.println("Da gui Air Humidity"); 
    }
    if (!isnan(t)) {
      airTemperature = t;
      mqttClient.publish(tempData, String(airTemperature).c_str());
      // Serial.println("Da gui Temperature"); 
    }
  }

  if (currentMode == MODE_CONFIG) {
    int rawCfg = analogRead(CONFIG_POT_PIN);
    switch (configScreen) {
      case 0:
        editingValue = mapPotToRange(rawCfg, 0, 100);
        break;
      case 1:
        editingValue = mapPotToRange(rawCfg, 1, 59);
        break;
      case 2:
        editingValue = mapPotToRange(rawCfg, 0, 100);
        break;
    }
  }
}

int mapPotToRange(int potValue, int minVal, int maxVal) {
  long val = map(potValue, 0, 4095, minVal, maxVal);
  if (val < minVal) val = minVal;
  if (val > maxVal) val = maxVal;
  return (int)val;
}

// ================== BUZZER ==================
void updateBuzzer() {
  if (currentMode != MODE_NORMAL) {
    buzzerOn = false;
    digitalWrite(BUZZER_PIN, LOW);
    return;
  }

  unsigned long now = millis();

  if (!buzzerOn) {
    if (now - lastBuzzerTime >= buzzerCyclePeriod) {
      buzzerOn = true;
      lastBuzzerTime = now;
      digitalWrite(BUZZER_PIN, HIGH);
    }
  } else {
    if (now - lastBuzzerTime >= buzzerOnDuration) {
      buzzerOn = false;
      lastBuzzerTime = now;
      digitalWrite(BUZZER_PIN, LOW);
    }
  }
}

// ================== BLINK (CONFIG MODE) ==================
void updateBlink() {
  unsigned long now = millis();

  if (currentMode == MODE_CONFIG) {
    if (now - lastBlinkTime >= blinkInterval) {
      lastBlinkTime = now;
      blinkOn = !blinkOn;

      digitalWrite(LED_PIN, blinkOn ? HIGH : LOW);
      if (blinkOn) lcd.backlight();
      else         lcd.noBacklight();
    }
  } else {
    // NORMAL mode: LED sáng liên tục, LCD luôn bật, KHÔNG nhấp nháy
    digitalWrite(LED_PIN, HIGH);
    lcd.backlight();
    blinkOn = true; // reset trạng thái
  }
}

// ================== LCD ==================
void updateLCD() {
  bool modeChanged = (currentMode != lastMode);

  if (currentMode == MODE_NORMAL) {
    bool screenChanged = (normalScreen != lastNormalScreen) || modeChanged;
    showNormalScreen(screenChanged);
    lastNormalScreen = normalScreen;
  } else {
    bool screenChanged = (configScreen != lastConfigScreen) || modeChanged;
    showConfigScreen(screenChanged);
    lastConfigScreen = configScreen;
  }

  lastMode = currentMode;
}

// NORMAL mode: không blink, chỉ clear khi đổi screen/mode
void showNormalScreen(bool forceClear) {
  if (forceClear) {
    lcd.clear();
  }
  switch (normalScreen) {
    case 0: // Soil moisture
      lcd.setCursor(0, 0);
      lcd.print("Soil:");
      lcd.print((int)soilMoisture);
      lcd.print("%   "); // thêm spaces xóa dư

      lcd.setCursor(0, 1);
      lcd.print("Thr:");
      lcd.print(cfgMoistureThreshold);
      lcd.print("%   ");
      break;

    case 1: // Air humidity
      lcd.setCursor(0, 0);
      lcd.print("Air Humidity:   ");

      lcd.setCursor(0, 1);
      lcd.print((int)airHumidity);
      lcd.print("%   ");
      break;

    case 2: // Temperature
      lcd.setCursor(0, 0);
      lcd.print("Temp:");
      lcd.print(airTemperature, 1);
      lcd.print((char)223);
      lcd.print("C   ");

      lcd.setCursor(0, 1);
      lcd.print("Mode: NORMAL    ");
      break;

    case 3: // Water config summary
      lcd.setCursor(0, 0);
      lcd.print("Water:");
      lcd.print(cfgWaterLiters);
      lcd.print("L   ");

      lcd.setCursor(0, 1);
      lcd.print("Time:");
      lcd.print(cfgMinutesPerHour);
      lcd.print("m/1h ");
      break;
  }
}

// CONFIG mode: nội dung ổn định, chỉ backlight + LED nhấp nháy
void showConfigScreen(bool forceClear) {
  if (forceClear) {
    lcd.clear();
  }

  switch (configScreen) {
    case 0:
      lcd.setCursor(0, 0);
      lcd.print("CFG: Lit water  ");
      lcd.setCursor(0, 1);
      lcd.print("Set: ");
      lcd.print(editingValue);
      lcd.print(" L   ");
      break;

    case 1:
      lcd.setCursor(0, 0);
      lcd.print("CFG: Min/Hour   ");
      lcd.setCursor(0, 1);
      lcd.print("Set: ");
      lcd.print(editingValue);
      lcd.print(" m   ");
      break;

    case 2:
      lcd.setCursor(0, 0);
      lcd.print("CFG: Soil Thr   ");
      lcd.setCursor(0, 1);
      lcd.print("Set: ");
      lcd.print(editingValue);
      lcd.print(" %   ");
      break;
  }
}

void wifiConnect()
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connecting");

  int dotCount = 0;

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    lcd.setCursor(0, 1);

    lcd.print("Connecting");
    for (int i = 0; i < dotCount; i++)
    {
      lcd.print(".");
    }
    for (int i = dotCount; i < 3; i++)
    {
      lcd.print(" "); 
    }

    dotCount = (dotCount + 1) % 4;

    delay(500);
  }

  // Khi kết nối xong
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected!");
  delay(500);
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP().toString());

  Serial.println("WiFi connected");
}

void mqttConnect()
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("MQTT Connecting");
  while (!mqttClient.connected())
  {
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);
    Serial.print("Connecting to MQTT broker...");
    if (mqttClient.connect(clientId.c_str()))
    {
      Serial.println("connected");
      lcd.clear();
      lcd.print("MQTT OK!");
      delay(1000);
      mqttClient.subscribe(settingsCmd);
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 2s");
      delay(2000);
    }
  }
}

void callback(char *topic, byte *message, unsigned int length)
{

}