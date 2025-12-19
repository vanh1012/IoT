#include "actuators.h"
#include "connect.h"

const char *ssid = "Wokwi-GUEST";
const char *password = "";

// MQTT Info
const char *mqttServer = "broker.hivemq.com";
int port = 1883;
PubSubClient mqttClient;

WiFiClient wifiClient;
char jsonBuffer[512];
static void callback(char *topic, byte *payload, unsigned int length)
{
    Serial.print("📩 MQTT Topic: ");
    Serial.println(topic);

    // Convert payload to string
    memcpy(jsonBuffer, payload, length);
    jsonBuffer[length] = '\0';
    Serial.println(jsonBuffer);

    // điều khiển máy bơm, đèn cây, ngưỡng
    if (strcmp(topic, settingsCmd) == 0)
    {
        StaticJsonDocument<200> doc;
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
            {
                turnPumpOn();
            }
            else 
            {
                turnPumpOff();
            }
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
    if (strcmp(topic, thresHoldValueTopic) == 0)
    {

        unsigned int copyLength = (length < sizeof(jsonBuffer) - 1)
                                      ? length
                                      : (sizeof(jsonBuffer) - 1);
        memcpy(jsonBuffer, payload, copyLength);
        jsonBuffer[copyLength] = '\0';

        ArduinoJson::StaticJsonDocument<300> doc;

        auto err = deserializeJson(doc, jsonBuffer);
        if (err)
        {
            Serial.println("❌ JSON Parse Error in Threshold Topic!");
            return;
        }

        tempThresholdLowC = doc["tempThresholdLowC"] | tempThresholdLowC;
        tempThresholdHighC = doc["tempThresholdHighC"] | tempThresholdHighC;
        soilThresholdLowPercent = doc["soilThresholdLowPercent"] | soilThresholdLowPercent;
        soilThresholdHighPercent = doc["soilThresholdHighPercent"] | soilThresholdHighPercent;
        humidThresholdLowPercent = doc["humidThresholdLowPercent"] | humidThresholdLowPercent;
        humidThresholdHighPercent = doc["humidThresholdHighPercent"] | humidThresholdHighPercent;

        Serial.println("📌 Updated thresholds from MQTT!");
        mqttClient.publish(thresHolTopic, jsonBuffer, true);
        mqttClient.publish("IoT23CLC09/Group5/thresAck", "Ok"); // báo cho server đã đồng hộ thành công ngưỡng từ db
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
            mqttClient.subscribe(settingsCmd); // nhận lệnh điều khiển máy bơm 
            mqttClient.subscribe(thresHoldValueTopic); // nhận biến ngưỡng từ server
            mqttClient.publish("IoT23CLC09/Group5/thresSyncReq", "1"); // gửi yêu cầu sync ngưỡng khi mới khởi động 
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

void mqttPublishData(const char *topic)
{
    JsonDocument doc;
    if(strcmp(topic,sensorTopic) == 0)
    {
        doc["soil"] = soilPercent;
        doc["air"]  = currentHumidity;
        doc["temp"] = currentTemp;
    
        char jsonBuffer[128];
        serializeJson(doc, jsonBuffer);
        mqttClient.publish(sensorTopic, jsonBuffer);
    }
    if(strcmp(topic, "logDevicePump") == 0)
    {
        doc["type"] = "PUMP_STATUS";
        doc["pumpStatus"] = pumpOn ? "ON" : "OFF";
    
        char jsonBuffer[128];
        serializeJson(doc, jsonBuffer);
        mqttClient.publish(logTopic, jsonBuffer);
    }
    if(strcmp(topic, "logDeviceLight") == 0)
    {
        doc["type"] = "LIGHT_STATUS";
        doc["lightStatus"] = lightOn ? "ON" : "OFF";
    
        char jsonBuffer[128];
        serializeJson(doc, jsonBuffer);
        mqttClient.publish(logTopic, jsonBuffer);
    }

    if(strcmp(topic, "logThreshold") == 0)
    {   doc["type"] = "THRESHOLD_UPDATE";
        doc["tempThresholdLowC"] = tempThresholdLowC;
        doc["tempThresholdHighC"] = tempThresholdHighC;
        doc["soilThresholdLowPercent"] = soilThresholdLowPercent;
        doc["soilThresholdHighPercent"] = soilThresholdHighPercent;
        doc["humidThresholdLowPercent"] = humidThresholdLowPercent;
        doc["humidThresholdHighPercent"] = humidThresholdHighPercent;
    
        char jsonBuffer[256];
        serializeJson(doc, jsonBuffer);
        mqttClient.publish(logTopic, jsonBuffer);
    }
}

