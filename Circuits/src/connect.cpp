#include "globals.h"
#include "actuators.h"

const char *ssid = "Wokwi-GUEST";
const char *password = "";

// MQTT Info
const char *mqttServer = "broker.hivemq.com";
int port = 1883;
PubSubClient mqttClient;
// Topic IoT23CLC09/Group5/#

// Publish Topic
const char *topicData = "IoT23CLC09/Group5/data";
const char *logData = "IoT23CLC09/Group5/log";
// Subscribe Topc 
const char *settingsCmd = "IoT23CLC09/Group5/cmd";

WiFiClient wifiClient;

void callback(char *topic, byte *payload, unsigned int length)
{
    Serial.print("📩 MQTT Topic: ");
    Serial.println(topic);

    // Convert payload to string
    char jsonBuffer[150];
    memcpy(jsonBuffer, payload, length);
    jsonBuffer[length] = '\0';
    Serial.println(jsonBuffer);

    JsonDocument doc; 

    DeserializationError error = deserializeJson(doc, jsonBuffer);
    if (error)
    {
        Serial.println("❌ JSON Parse Error!");
        return;
    }

    if (doc["pump"].is<bool>())
    {
        pumpOn = doc["pump"].as<bool>();
        if (pumpOn)
            turnPumpOn();
        else 
            turnPumpOff();
        Serial.print("Pump:");
        Serial.println(pumpOn ? "ON" : "OFF");
    }

    if (doc["light"].is<bool>()) 
    {
        lightOn = doc["light"].as<bool>();
        if (lightOn)
            turnLightOn();
        else
            turnLightOff();
        Serial.print("Light:");
        Serial.println(lightOn ? "ON" : "OFF");
    }
}

void wifiConnect()
{
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Connecting");

    WiFi.begin(ssid, password);
    int dotCount = 0;
    while (WiFi.status() != WL_CONNECTED)
    {
        lcd.setCursor(0, 1);
        lcd.print("Connecting");
        for (int i = 0; i < dotCount; i++)
            lcd.print(".");
        for (int i = dotCount; i < 3; i++)
            lcd.print(" ");
        dotCount = (dotCount + 1) % 4;
        delay(500);
    }
    lcd.clear();
    lcd.print("WiFi Connected!");
    delay(500);
}

void mqttConnect()
{
    lcd.clear();
    lcd.print("MQTT Connecting");
    while (!mqttClient.connected())
    {
        String clientId = "ESP32-" + String(random(0xffff), HEX);
        if (mqttClient.connect(clientId.c_str()))
        {
            lcd.clear();
            lcd.print("MQTT OK!");
            delay(1000);
            mqttClient.subscribe(settingsCmd);
        }
        else
        {
            delay(2000);
        }
    }
}

void setupNetwork()
{
    wifiConnect();
    mqttClient.setClient(wifiClient);
    mqttClient.setServer(mqttServer, port);
    mqttClient.setCallback(callback);
    mqttClient.setKeepAlive(60);
}

void checkNetworkConnection()
{
    if (WiFi.status() != WL_CONNECTED)
        wifiConnect();
    if (!mqttClient.connected())
        mqttConnect();
    mqttClient.loop();
}

void mqttPublishData()
{
    JsonDocument doc;
    doc["soil"] = soilPercent;
    doc["air"] = currentHumidity;
    doc["temp"] = currentTemp;

    char jsonBuffer[128];
    serializeJson(doc, jsonBuffer);
    mqttClient.publish(topicData, jsonBuffer);
}

