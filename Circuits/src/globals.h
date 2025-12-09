#pragma once
#include <Arduino.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

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

// ================== MODE ==================
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

// ================== NGƯỠNG CHO PHÉP (CONSTANT) ==================
extern const int minTempThresholdC;         // 0
extern const int maxTempThresholdC;         // 70

extern const int minSoilThresholdPercent;   // 0
extern const int maxSoilThresholdPercent;   // 100

extern const int minHumThresholdPercent;    // 0
extern const int maxHumThresholdPercent;    // 100

// ================== NGƯỠNG ĐANG CẤU HÌNH (LOW/HIGH) ==================
extern int tempThresholdLowC;
extern int tempThresholdHighC;

extern int soilThresholdLowPercent;
extern int soilThresholdHighPercent;

extern int humidThresholdLowPercent;
extern int humidThresholdHighPercent;

// ================== GIÁ TRỊ CẢM BIẾN ==================
extern float currentTemp;
extern float currentHumidity;
extern int   soilRaw;
extern int   soilPercent;

// ================== TRẠNG THÁI VƯỢT NGƯỠNG ==================
// Ở đây hiểu là GIÁ TRỊ NẰM NGOÀI [LOW, HIGH]
extern bool   tempOverThreshold;
extern bool   soilOverThreshold;
extern bool   humidOverThreshold;

extern uint8_t alertFlags;
extern const uint8_t ALERT_TEMP;
extern const uint8_t ALERT_SOIL;
extern const uint8_t ALERT_HUMID;

// ================== TRẠNG THÁI RELAY ==================
extern bool pumpOn;
extern bool lightOn;

// Publish Topic
extern const char *sensorTopic;
extern const char *logTopic;
extern const char *thresHolTopic;

// Subscribe Topic 
extern const char *settingsCmd;
