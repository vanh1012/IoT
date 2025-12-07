#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <string.h>

// ================== PHAN CUNG ==================
// LCD I2C: Address 0x27, 16x2
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ESP32 pins theo diagram Wokwi
const int MENU_POT_PIN    = 34;  // Biến trở chọn menu + chỉnh ngưỡng
const int SOIL_PIN        = 35;  // Tạm dùng POT2 mô phỏng độ ẩm đất (ADC)
const int BUTTON_PIN      = 2;   // Nút nhấn chọn / back (có R10k kéo xuống GND)
const int DHT_PIN         = 32;  // DHT22 DATA

const int RELAY_PUMP_PIN  = 4;   // Relay 1 - máy bơm + LED2 (cyan)
const int RELAY_LIGHT_PIN = 16;  // Relay 2 - đèn + LED3 (magenta)
const int STATUS_LED_PIN  = 15;  // LED GPIO15 cho phép nhấp nháy

// DHT
#define DHTTYPE DHT22
DHT dht(DHT_PIN, DHTTYPE);

// ================== CUSTOM CHAR ==================
// 0: con trỏ menu (mũi tên)
// 1: nhiệt kế
// 2: giọt nước (độ ẩm đất)
// 3: %RH (độ ẩm không khí)
// 4: icon bơm
// 5: icon đèn

byte cursorChar[8] = {
  B00100,
  B00110,
  B00111,
  B00110,
  B00100,
  B00000,
  B00000,
  B00000
};

byte thermoChar[8] = {
  B00100,
  B01010,
  B01010,
  B01010,
  B01010,
  B01110,
  B01110,
  B00100
};

byte soilDropChar[8] = {
  B00100,
  B00100,
  B01010,
  B01010,
  B10001,
  B10001,
  B01110,
  B00000
};

byte humidityChar[8] = {
  B00100,
  B01010,
  B10001,
  B10001,
  B10001,
  B01010,
  B00100,
  B00000
};

byte pumpChar[8] = {
  B00000,
  B00110,
  B01111,
  B11110,
  B11110,
  B01111,
  B00110,
  B00000
};

byte lightChar[8] = {
  B00100,
  B01110,
  B01110,
  B01110,
  B11111,
  B00100,
  B00000,
  B00100
};

void createCustomChars() {
  lcd.createChar(0, cursorChar);
  lcd.createChar(1, thermoChar);
  lcd.createChar(2, soilDropChar);
  lcd.createChar(3, humidityChar);
  lcd.createChar(4, pumpChar);
  lcd.createChar(5, lightChar);
}

// ================== MENU & MODE ==================
const int MENU_COUNT = 5;
const char* menuItems[MENU_COUNT] = {
  "Nhiet do",
  "Do am dat",
  "Do am khong",
  "May bom",
  "May den"
};

enum Mode {
  MODE_MENU,
  MODE_TEMP_CONFIG,   // Chỉnh ngưỡng nhiệt độ
  MODE_SOIL_CONFIG,   // Chỉnh ngưỡng độ ẩm đất
  MODE_HUMID_CONFIG,  // Chỉnh ngưỡng độ ẩm không khí
  MODE_PUMP_STATUS,
  MODE_LIGHT_STATUS
};

Mode currentMode = MODE_MENU;
int  selectedIndex = 0;

int lastButtonState = LOW;

// ================== NGƯỠNG & TRẠNG THÁI ==================
int minTempThresholdC = 20;
int maxTempThresholdC = 40;
int tempThresholdC    = 30;   // ngưỡng nhiệt độ hiện tại

int minSoilThresholdPercent = 0;
int maxSoilThresholdPercent = 100;
int soilThresholdPercent    = 50;  // ngưỡng % độ ẩm đất

int minHumThresholdPercent = 0;
int maxHumThresholdPercent = 100;
int humidThresholdPercent  = 60;   // ngưỡng % độ ẩm không khí

// Trạng thái cảm biến hiện tại
float currentTemp     = 0.0;
float currentHumidity = 0.0;
int   soilRaw         = 0;
int   soilPercent     = 0;

// Biến "vượt ngưỡng" – để gửi lên web sau này
bool tempOverThreshold  = false;
bool soilOverThreshold  = false;
bool humidOverThreshold = false;

// Bitmask tổng hợp – để web đọc cho tiện
uint8_t alertFlags = 0;
const uint8_t ALERT_TEMP  = 0x01;
const uint8_t ALERT_SOIL  = 0x02;
const uint8_t ALERT_HUMID = 0x04;

// Trạng thái relay (điều khiển tay & web)
bool pumpOn  = false;
bool lightOn = false;

// LED15 nhấp nháy
unsigned long lastBlinkMillis = 0;
bool statusLedState = false;

// ================== TRẠNG THÁI RENDER MENU (CHỐNG NHÁY) ==================
char prevLine0[17];
char prevLine1[17];
int  prevFirstIndex = -1;
int  prevSecondIndex = -1;
int  prevSelectedIndexForCursor = -1;
unsigned long lastMenuUpdateMillis = 0;

void initMenuRenderState() {
  prevLine0[0] = '\0';
  prevLine1[0] = '\0';
  prevFirstIndex = -1;
  prevSecondIndex = -1;
  prevSelectedIndexForCursor = -1;
  lastMenuUpdateMillis = 0;
  lcd.clear();
}

// ================== BUTTON HELPER ==================
bool buttonPressedOnce() {
  int state = digitalRead(BUTTON_PIN);
  bool pressed = false;

  // Nút đấu kiểu: bình thường LOW, nhấn -> HIGH
  if (lastButtonState == LOW && state == HIGH) {
    pressed = true;
    delay(20); // debounce đơn giản
  }
  lastButtonState = state;
  return pressed;
}

// ================== DOC CAM BIEN ==================
void readSensors() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t)) currentTemp = t;
  if (!isnan(h)) currentHumidity = h;

  soilRaw = analogRead(SOIL_PIN); // 0-4095
  // Quy ước: 0 = rất ướt, 4095 = rất khô
  soilPercent = map(soilRaw, 4095, 0, 0, 100);
  if (soilPercent < 0) soilPercent = 0;
  if (soilPercent > 100) soilPercent = 100;
}

// Cập nhật biến vượt ngưỡng (CHỈ LƯU BIẾN, KHÔNG ĐIỀU KHIỂN BƠM)
void updateThresholdStates() {
  tempOverThreshold  = (!isnan(currentTemp)     && currentTemp     > tempThresholdC);
  soilOverThreshold  = (soilPercent             > soilThresholdPercent);
  humidOverThreshold = (!isnan(currentHumidity) && currentHumidity > humidThresholdPercent);

  alertFlags = 0;
  if (tempOverThreshold)  alertFlags |= ALERT_TEMP;
  if (soilOverThreshold)  alertFlags |= ALERT_SOIL;
  if (humidOverThreshold) alertFlags |= ALERT_HUMID;
}

// ================== ĐIỀU KHIỂN BƠM & ĐÈN ==================
void applyPumpState() {
  // Nếu relay active HIGH:
  digitalWrite(RELAY_PUMP_PIN, pumpOn ? HIGH : LOW);
  // Nếu relay thực tế active LOW thì đổi lại:
  // digitalWrite(RELAY_PUMP_PIN, pumpOn ? LOW : HIGH);
}

void applyLightState() {
  // Nếu relay active HIGH:
  digitalWrite(RELAY_LIGHT_PIN, lightOn ? HIGH : LOW);
  // Nếu relay active LOW:
  // digitalWrite(RELAY_LIGHT_PIN, lightOn ? LOW : HIGH);
}

void updateStatusLed() {
  unsigned long now = millis();
  if (now - lastBlinkMillis >= 500) {  // nhấp nháy mỗi 0.5s
    lastBlinkMillis = now;
    statusLedState = !statusLedState;
    digitalWrite(STATUS_LED_PIN, statusLedState ? HIGH : LOW);
  }
}

// ========== WEB CONTROL API: HAM DE WEB GOI ==========
void turnPumpOn() {
  pumpOn = true;
  applyPumpState();
}

void turnPumpOff() {
  pumpOn = false;
  applyPumpState();
}

void turnLightOn() {
  lightOn = true;
  applyLightState();
}

void turnLightOff() {
  lightOn = false;
  applyLightState();
}

// ================== MENU ==================
void buildMenuTextForIndex(int menuIndex, char* buf, size_t bufSize) {
  if (menuIndex == 0) {
    // Nhiet:24(30)
    snprintf(buf, bufSize, "Nhiet:%2.0f(%2d)", currentTemp, tempThresholdC);
  } else if (menuIndex == 1) {
    // Dat:45(50)
    snprintf(buf, bufSize, "Dat:%3d(%3d)", soilPercent, soilThresholdPercent);
  } else if (menuIndex == 2) {
    // KK:60(70)
    snprintf(buf, bufSize, "KK:%3.0f(%3d)", currentHumidity, humidThresholdPercent);
  } else {
    // Mục 3,4: dùng label nguyên bản
    snprintf(buf, bufSize, "%s", menuItems[menuIndex]);
  }
}

void updateMenuDisplay() {
  unsigned long now = millis();
  if (now - lastMenuUpdateMillis < 150) return;  // update ~6-7 lần/giây
  lastMenuUpdateMillis = now;

  // Xác định 2 index hiện trên 2 dòng
  int first;
  if (selectedIndex <= 1) {
    first = 0;
  } else if (selectedIndex >= MENU_COUNT - 1) {
    first = MENU_COUNT - 2;
  } else {
    first = selectedIndex - 1;
  }
  int second = first + 1;

  char line0[17];
  char line1[17];
  buildMenuTextForIndex(first,  line0, sizeof(line0));
  buildMenuTextForIndex(second, line1, sizeof(line1));

  line0[14] = '\0';
  line1[14] = '\0';

  bool cursorChanged = (prevSelectedIndexForCursor != selectedIndex);
  bool need0 = cursorChanged || first  != prevFirstIndex  || strcmp(line0, prevLine0) != 0;
  bool need1 = cursorChanged || second != prevSecondIndex || strcmp(line1, prevLine1) != 0;

  if (need0) {
    lcd.setCursor(0, 0);
    if (selectedIndex == first) lcd.write(byte(0));
    else lcd.print(' ');

    lcd.setCursor(1, 0);
    lcd.print("              ");
    lcd.setCursor(1, 0);
    lcd.print(line0);

    lcd.setCursor(15, 0);
    if      (first == 3) lcd.write(byte(4)); // bơm
    else if (first == 4) lcd.write(byte(5)); // đèn
    else                 lcd.print(' ');

    strcpy(prevLine0, line0);
    prevFirstIndex = first;
  }

  if (need1) {
    lcd.setCursor(0, 1);
    if (selectedIndex == second) lcd.write(byte(0));
    else lcd.print(' ');

    lcd.setCursor(1, 1);
    lcd.print("              ");
    lcd.setCursor(1, 1);
    lcd.print(line1);

    lcd.setCursor(15, 1);
    if      (second == 3) lcd.write(byte(4));
    else if (second == 4) lcd.write(byte(5));
    else                  lcd.print(' ');

    strcpy(prevLine1, line1);
    prevSecondIndex = second;
  }

  prevSelectedIndexForCursor = selectedIndex;
}

void updateMenuFromPot() {
  int potVal = analogRead(MENU_POT_PIN); // 0-4095
  int newIndex = map(potVal, 0, 4095, 0, MENU_COUNT - 1);
  if (newIndex < 0) newIndex = 0;
  if (newIndex >= MENU_COUNT) newIndex = MENU_COUNT - 1;
  if (newIndex != selectedIndex) {
    selectedIndex = newIndex;
  }
}

// ================== MAN HINH CONFIG ==================
bool tempConfigDrawn  = false;
bool soilConfigDrawn  = false;
bool humidConfigDrawn = false;
bool pumpStatusDrawn  = false;
bool lightStatusDrawn = false;

void drawTempConfigStatic() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.write(byte(1)); // icon nhiệt
  lcd.print(" Nhiet:");
  lcd.print(currentTemp, 1);
  lcd.print((char)223);
  lcd.print("C");
}

void updateTempConfigDynamic() {
  lcd.setCursor(0, 1);
  lcd.print("Nguong:");
  lcd.print(tempThresholdC);
  lcd.print((char)223);
  lcd.print("C   ");
}

void drawSoilConfigStatic() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.write(byte(2)); // icon dat
  lcd.print(" Dat:");
  lcd.print(soilPercent);
  lcd.print("%   ");
}

void updateSoilConfigDynamic() {
  lcd.setCursor(0, 1);
  lcd.print("Nguong:");
  lcd.print(soilThresholdPercent);
  lcd.print("%   ");
}

void drawHumidConfigStatic() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.write(byte(3)); // icon do am kk
  lcd.print(" KK:");
  lcd.print(currentHumidity, 1);
  lcd.print("%   ");
}

void updateHumidConfigDynamic() {
  lcd.setCursor(0, 1);
  lcd.print("Nguong:");
  lcd.print(humidThresholdPercent);
  lcd.print("%   ");
}

void showPumpStatusScreen() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.write(byte(4)); // icon bơm
  lcd.print(" May bom (tay)");

  lcd.setCursor(0, 1);
  lcd.print("Trang thai: ");
  lcd.print(pumpOn ? "BAT " : "TAT ");
}

void showLightStatusScreen() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.write(byte(5)); // icon den
  lcd.print(" May den (tay)");

  lcd.setCursor(0, 1);
  lcd.print("Trang thai: ");
  lcd.print(lightOn ? "BAT " : "TAT ");
}

// ================== HELPER: Vao lai MENU ==================
void enterMenuMode() {
  currentMode = MODE_MENU;
  tempConfigDrawn  = false;
  soilConfigDrawn  = false;
  humidConfigDrawn = false;
  pumpStatusDrawn  = false;
  lightStatusDrawn = false;
  initMenuRenderState();
}

// ================== SETUP ==================
void setup() {
  Serial.begin(115200);

  pinMode(MENU_POT_PIN, INPUT);
  pinMode(SOIL_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT);      // có R kéo xuống ngoài
  pinMode(RELAY_PUMP_PIN, OUTPUT);
  pinMode(RELAY_LIGHT_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);

  pumpOn  = false;
  lightOn = false;
  applyPumpState();
  applyLightState();
  digitalWrite(STATUS_LED_PIN, LOW);

  dht.begin();

  lcd.init();
  lcd.backlight();
  createCustomChars();

  currentMode = MODE_MENU;
  selectedIndex = 0;
  lastButtonState = digitalRead(BUTTON_PIN);

  initMenuRenderState();
}

// ================== LOOP ==================
void loop() {
  // Luôn đọc cảm biến, cập nhật trạng thái và LED nhấp nháy
  readSensors();
  updateThresholdStates();   // chỉ set biến tempOverThreshold / soilOverThreshold / humidOverThreshold + alertFlags
  updateStatusLed();

  if (currentMode == MODE_MENU) {
    updateMenuFromPot();
    updateMenuDisplay();     // cập nhật menu nhưng KHÔNG nháy LCD

    if (buttonPressedOnce()) {
      if (selectedIndex == 0) {
        currentMode = MODE_TEMP_CONFIG;
        tempConfigDrawn = false;
      } else if (selectedIndex == 1) {
        currentMode = MODE_SOIL_CONFIG;
        soilConfigDrawn = false;
      } else if (selectedIndex == 2) {
        currentMode = MODE_HUMID_CONFIG;
        humidConfigDrawn = false;
      } else if (selectedIndex == 3) {
        currentMode = MODE_PUMP_STATUS;
        pumpStatusDrawn = false;
      } else if (selectedIndex == 4) {
        currentMode = MODE_LIGHT_STATUS;
        lightStatusDrawn = false;
      }
    }
  }
  else if (currentMode == MODE_TEMP_CONFIG) {
    if (!tempConfigDrawn) {
      drawTempConfigStatic();
      tempConfigDrawn = true;
    }

    int potVal = analogRead(MENU_POT_PIN);
    int newTh  = map(potVal, 0, 4095, minTempThresholdC, maxTempThresholdC);
    if (newTh != tempThresholdC) {
      tempThresholdC = newTh;
      updateTempConfigDynamic();
    }

    if (buttonPressedOnce()) {
      enterMenuMode();
    }
  }
  else if (currentMode == MODE_SOIL_CONFIG) {
    if (!soilConfigDrawn) {
      drawSoilConfigStatic();
      soilConfigDrawn = true;
    }

    int potVal = analogRead(MENU_POT_PIN);
    int newTh  = map(potVal, 0, 4095, minSoilThresholdPercent, maxSoilThresholdPercent);
    if (newTh != soilThresholdPercent) {
      soilThresholdPercent = newTh;
      updateSoilConfigDynamic();
    }

    if (buttonPressedOnce()) {
      enterMenuMode();
    }
  }
  else if (currentMode == MODE_HUMID_CONFIG) {
    if (!humidConfigDrawn) {
      drawHumidConfigStatic();
      humidConfigDrawn = true;
    }

    int potVal = analogRead(MENU_POT_PIN);
    int newTh  = map(potVal, 0, 4095, minHumThresholdPercent, maxHumThresholdPercent);
    if (newTh != humidThresholdPercent) {
      humidThresholdPercent = newTh;
      updateHumidConfigDynamic();
    }

    if (buttonPressedOnce()) {
      enterMenuMode();
    }
  }
  else if (currentMode == MODE_PUMP_STATUS) {
    if (!pumpStatusDrawn) {
      showPumpStatusScreen();
      pumpStatusDrawn = true;
    }

    if (buttonPressedOnce()) {
      // toggle bơm bằng tay rồi quay về menu
      if (pumpOn) turnPumpOff();
      else        turnPumpOn();
      enterMenuMode();
    }
  }
  else if (currentMode == MODE_LIGHT_STATUS) {
    if (!lightStatusDrawn) {
      showLightStatusScreen();
      lightStatusDrawn = true;
    }

    if (buttonPressedOnce()) {
      if (lightOn) turnLightOff();
      else         turnLightOn();
      enterMenuMode();
    }
  }

  delay(20);
}
