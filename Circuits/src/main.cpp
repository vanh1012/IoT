// main.cpp
#include <Arduino.h>
#include "globals.h"
#include "hardware.h"
#include "sensors.h"
#include "actuators.h"
#include "menu.h"
#include "connect.h"
// ====== ĐỊNH NGHĨA BIẾN TOÀN CỤC (khớp với extern trong globals.h) ======
LiquidCrystal_I2C lcd(0x27, 16, 2);

// pin const
const int MENU_POT_PIN    = 34;
const int SOIL_PIN        = 35;
const int BUTTON_PIN      = 2;
const int DHT_PIN         = 32;
const int RELAY_PUMP_PIN  = 4;
const int RELAY_LIGHT_PIN = 16;
const int STATUS_LED_PIN  = 15;

// DHT dùng DHT_PIN
DHT dht(DHT_PIN, DHTTYPE);

// Menu & mode
Mode currentMode = MODE_MENU;
int  selectedIndex = 0;

const int   MENU_COUNT = 5;
const char* menuItems[MENU_COUNT] = {
  "Nhiet do",
  "Do am dat",
  "Do am khong",
  "May bom",
  "May den"
};

// Ngưỡng
int minTempThresholdC = 20;
int maxTempThresholdC = 40;
int tempThresholdC    = 30;

int minSoilThresholdPercent = 0;
int maxSoilThresholdPercent = 100;
int soilThresholdPercent    = 50;

int minHumThresholdPercent = 0;
int maxHumThresholdPercent = 100;
int humidThresholdPercent  = 60;

// Cảm biến hiện tại
float currentTemp     = 0.0f;
float currentHumidity = 0.0f;
int   soilRaw         = 0;
int   soilPercent     = 0;

// Vượt ngưỡng
bool   tempOverThreshold  = false;
bool   soilOverThreshold  = false;
bool   humidOverThreshold = false;
uint8_t alertFlags        = 0;
const uint8_t ALERT_TEMP  = 0x01;
const uint8_t ALERT_SOIL  = 0x02;
const uint8_t ALERT_HUMID = 0x04;

// Relay trạng thái
bool pumpOn  = false;
bool lightOn = false;

// ====== SETUP & LOOP ======
void setup() {
  Serial.begin(115200);
  setupHardware();
  initMenuRenderState();
  setupNetwork();
}

void loop() {
  // 0. Kết nối wifi + mqtt
  checkNetworkConnection();

  // 1. Đọc cảm biến + tính vượt ngưỡng + LED GPIO15
  readSensors();
  updateThresholdStates();
  updateStatusLed();

  // 2. State machine UI
  switch (currentMode) {
    case MODE_MENU:
      updateMenuFromPot();
      updateMenuDisplay();
      if (buttonPressedOnce()) {
        if      (selectedIndex == 0) currentMode = MODE_TEMP_CONFIG;
        else if (selectedIndex == 1) currentMode = MODE_SOIL_CONFIG;
        else if (selectedIndex == 2) currentMode = MODE_HUMID_CONFIG;
        else if (selectedIndex == 3) currentMode = MODE_PUMP_STATUS;
        else if (selectedIndex == 4) currentMode = MODE_LIGHT_STATUS;
      }
      break;

    case MODE_TEMP_CONFIG:
      handleTempConfig();
      break;

    case MODE_SOIL_CONFIG:
      handleSoilConfig();
      break;

    case MODE_HUMID_CONFIG:
      handleHumidConfig();
      break;

    case MODE_PUMP_STATUS:
      handlePumpStatusScreen();
      break;

    case MODE_LIGHT_STATUS:
      handleLightStatusScreen();
      break;
  }

  delay(20);
}
