// globals.h
#pragma once
#include <Arduino.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ====== DHT loại ======
#define DHTTYPE DHT22

// ====== Khai báo LCD , DHT, MQTT (định nghĩa ở main.cpp) ======
extern LiquidCrystal_I2C lcd;
extern DHT dht;
extern PubSubClient mqttClient;
// ====== Chân cứng ======
extern const int MENU_POT_PIN;
extern const int SOIL_PIN;
extern const int BUTTON_PIN;
extern const int DHT_PIN;
extern const int RELAY_PUMP_PIN;
extern const int RELAY_LIGHT_PIN;
extern const int STATUS_LED_PIN;

// ====== Menu & mode ======
enum Mode {
  MODE_MENU,
  MODE_TEMP_CONFIG,
  MODE_SOIL_CONFIG,
  MODE_HUMID_CONFIG,
  MODE_PUMP_STATUS,
  MODE_LIGHT_STATUS
};

extern Mode currentMode;
extern int  selectedIndex;

extern const int   MENU_COUNT;
extern const char* menuItems[];

// ====== Ngưỡng & trạng thái ======
extern int minTempThresholdC;
extern int maxTempThresholdC;
extern int tempThresholdC;

extern int minSoilThresholdPercent;
extern int maxSoilThresholdPercent;
extern int soilThresholdPercent;

extern int minHumThresholdPercent;
extern int maxHumThresholdPercent;
extern int humidThresholdPercent;

// Cảm biến hiện tại
extern float currentTemp;
extern float currentHumidity;
extern int   soilRaw;
extern int   soilPercent;

// Vượt ngưỡng
extern bool   tempOverThreshold;
extern bool   soilOverThreshold;
extern bool   humidOverThreshold;
extern uint8_t alertFlags;
extern const uint8_t ALERT_TEMP;
extern const uint8_t ALERT_SOIL;
extern const uint8_t ALERT_HUMID;

// Relay trạng thái
extern bool pumpOn;
extern bool lightOn;
