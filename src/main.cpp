#include "./headers/Config.h"
#include "./headers/Network.h"
#include "./headers/Sensors.h"
#include "./headers/HandleButton.h"
#include "./headers/Display.h"
#include "./headers/System.h"

// ================== DEFINING GLOBAL VARS ==================
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHT_PIN, DHT_TYPE);
PubSubClient mqttClient;

Mode currentMode = MODE_NORMAL;
int normalScreen = 0;
int configScreen = 0;

float soilMoisture = 0;
float airHumidity = 0;
float airTemperature = 0;

int cfgWaterLiters = 10;
int cfgMinutesPerHour = 10;
int cfgMoistureThreshold = 40;
int editingValue = 0;

// ================== MAIN SETUP ==================
void setup()
{
  Serial.begin(115200);

  initSystem();  // Led, Buzzer
  initInput();   // Buttons
  initDisplay(); // LCD
  initSensors(); // DHT, Pots

  delay(1000);    // Chờ LCD hiển thị Starting
  setupNetwork(); // Wifi, MQTT
}

// ================== MAIN LOOP ==================
void loop()
{
  checkNetworkConnection();
  handleInput();
  updateSensors();
  updateSystem();
  updateDisplay();
}