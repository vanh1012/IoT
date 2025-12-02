#include "./headers/Network.h"
#include "./headers/Config.h"

// WiFi Info
const char *ssid = "Wokwi-GUEST";
const char *password = "";

// MQTT Info
const char *mqttServer = "broker.hivemq.com";
int port = 1883;

// Topics
const char *soilData = "IoT23CLC09/Group5/data/soil";
const char *airData = "IoT23CLC09/Group5/data/air";
const char *tempData = "IoT23CLC09/Group5/data/temperature";
const char *settingsCmd = "IoT23CLC09/Group5/cmd/settings";

WiFiClient wifiClient;

void callback(char *topic, byte *payload, unsigned int length)
{
    // Xử lý tin nhắn nhận được (nếu cần)
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
    mqttClient.publish(soilData, String(soilMoisture).c_str());
    if (!isnan(airHumidity))
        mqttClient.publish(airData, String(airHumidity).c_str());
    if (!isnan(airTemperature))
        mqttClient.publish(tempData, String(airTemperature).c_str());
}