#include "./headers/Sensors.h"
#include "./headers/Config.h"
#include "./headers/Network.h" 

unsigned long lastDhtReadTime = 0;
const unsigned long dhtReadInterval = 2000;

int mapPotToRange(int potValue, int minVal, int maxVal)
{
    long val = map(potValue, 0, 4095, minVal, maxVal);
    if (val < minVal)
        val = minVal;
    if (val > maxVal)
        val = maxVal;
    return (int)val;
}

void initSensors()
{
    dht.begin();
    pinMode(SOIL_POT_PIN, INPUT);
    pinMode(CONFIG_POT_PIN, INPUT);
}

void updateSensors()
{
    unsigned long now = millis();

    // Đọc độ ẩm đất
    int rawSoil = analogRead(SOIL_POT_PIN);
    soilMoisture = map(rawSoil, 0, 4095, 0, 100);

    // Đọc DHT & Gửi MQTT
    if (now - lastDhtReadTime >= dhtReadInterval)
    {
        lastDhtReadTime = now;
        float h = dht.readHumidity();
        float t = dht.readTemperature();

        if (!isnan(h))
            airHumidity = h;
        if (!isnan(t))
            airTemperature = t;

        mqttPublishData(); // Gửi dữ liệu ngay khi đọc xong
    }

    // Đọc Pot Config (Nếu đang ở Mode Config)
    if (currentMode == MODE_CONFIG)
    {
        int rawCfg = analogRead(CONFIG_POT_PIN);
        switch (configScreen)
        {
        case 0:
            editingValue = mapPotToRange(rawCfg, 0, 100);
            break; // Water Liters
        case 1:
            editingValue = mapPotToRange(rawCfg, 1, 59);
            break; // Minutes/Hour
        case 2:
            editingValue = mapPotToRange(rawCfg, 0, 100);
            break; // Threshold
        }
    }
}