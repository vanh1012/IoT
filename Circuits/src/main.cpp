#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include "globals.h"
#include "hardware.h"
#include "sensors.h"
#include "actuators.h"
#include "menu.h"
// ================== ĐỊNH NGHĨA BIẾN TOÀN CỤC ==================
#include "connect.h"
// ====== ĐỊNH NGHĨA BIẾN TOÀN CỤC (khớp với extern trong globals.h) ======
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(32, DHTTYPE);

// Pin
const int MENU_POT_PIN    = 34;
const int SOIL_PIN        = 35;
const int BUTTON_PIN      = 2;
const int DHT_PIN         = 32;
const int RELAY_PUMP_PIN  = 4;
const int RELAY_LIGHT_PIN = 16;
const int STATUS_LED_PIN  = 15;

// Mode & menu
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

// Ngưỡng cho phép (constant)
const int minTempThresholdC       = 0;
const int maxTempThresholdC       = 70;
const int minSoilThresholdPercent = 0;
const int maxSoilThresholdPercent = 100;
const int minHumThresholdPercent  = 0;
const int maxHumThresholdPercent  = 100;

// Ngưỡng đang cấu hình (low/high)
int tempThresholdLowC  = 20;
int tempThresholdHighC = 35;

int soilThresholdLowPercent  = 30;
int soilThresholdHighPercent = 60;

int humidThresholdLowPercent  = 40;
int humidThresholdHighPercent = 70;

// Sensor values
float currentTemp     = 0.0f;
float currentHumidity = 0.0f;
int   soilRaw         = 0;
int   soilPercent     = 0;

// Out-of-range flags
bool   tempOverThreshold  = false;
bool   soilOverThreshold  = false;
bool   humidOverThreshold = false;
uint8_t alertFlags        = 0;
const uint8_t ALERT_TEMP  = 0x01;
const uint8_t ALERT_SOIL  = 0x02;
const uint8_t ALERT_HUMID = 0x04;

// Relay state
bool pumpOn  = false;
bool lightOn = false;

// ================== SETUP & LOOP ==================
void setup() {
  Serial.begin(115200);
  setupHardware();
  initMenuRenderState();
  setupNetwork();
}

void loop() {
  // 1. Luôn cập nhật sensor + cờ vượt ngưỡng + LED 15
  // 0. Kết nối wifi + mqtt
  checkNetworkConnection();

  // 1. Đọc cảm biến + tính vượt ngưỡng + LED GPIO15
  readSensors();
  updateThresholdStates();
  updateStatusLed();

  // 2. UI state machine
  switch (currentMode) {
    case MODE_MENU:
      updateMenuFromPot();
      updateMenuDisplay();
      if (buttonPressedOnce()) {
        if      (selectedIndex == 0) { startTempConfig();  currentMode = MODE_TEMP_CONFIG; }
        else if (selectedIndex == 1) { startSoilConfig();  currentMode = MODE_SOIL_CONFIG; }
        else if (selectedIndex == 2) { startHumidConfig(); currentMode = MODE_HUMID_CONFIG; }
        else if (selectedIndex == 3) { startPumpStatusScreen();  currentMode = MODE_PUMP_STATUS; }
        else if (selectedIndex == 4) { startLightStatusScreen(); currentMode = MODE_LIGHT_STATUS; }
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
