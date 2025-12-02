#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>
#include <LiquidCrystal_I2C.h>
#include "DHT.h"
#include <WiFi.h>
#include <PubSubClient.h>

// ================== PIN DEFINITIONS ==================
#define LED_PIN 15
#define BUZZER_PIN 5
#define BUTTON_PIN 2
#define SOIL_POT_PIN 34
#define CONFIG_POT_PIN 35
#define DHT_PIN 32
#define RELAY_PUMP 4
#define RELAY_LIGHT 16

#define DHT_TYPE DHT22

// ================== GLOBAL OBJECTS (EXTERN) ==================
extern LiquidCrystal_I2C lcd;
extern DHT dht;
extern PubSubClient mqttClient;

// ================== SHARED VARIABLES (EXTERN) ==================
// States & Mode
enum Mode
{
    MODE_NORMAL,
    MODE_CONFIG
};
extern Mode currentMode;
extern int normalScreen;
extern int configScreen;

// Sensor Data
extern float soilMoisture;
extern float airHumidity;
extern float airTemperature;

// Config Data
extern int cfgWaterLiters;
extern int cfgMinutesPerHour;
extern int cfgMoistureThreshold;
extern int editingValue;

// Constants
const int NORMAL_SCREEN_COUNT = 4;
const int CONFIG_SCREEN_COUNT = 3;

#endif