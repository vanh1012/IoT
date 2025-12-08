// sensors.cpp
#include "sensors.h"
#include "connect.h"

static int lastButtonState = LOW;
unsigned long lastDhtReadTime = 0;
const unsigned long dhtReadInterval = 2000;

bool buttonPressedOnce() {
  int state = digitalRead(BUTTON_PIN);
  bool pressed = false;
  if (lastButtonState == LOW && state == HIGH) {
    pressed = true;
    delay(20);
  }
  lastButtonState = state;
  return pressed;
}

void readSensors()
{
  unsigned long currentMillis = millis();

  // Kiểm tra nếu đủ 2s đọc lại
  if (currentMillis - lastDhtReadTime >= dhtReadInterval)
  {
    lastDhtReadTime = currentMillis;

    float t = dht.readTemperature();
    float h = dht.readHumidity();

    if (!isnan(t))
      currentTemp = t;
    if (!isnan(h))
      currentHumidity = h;

    soilRaw = analogRead(SOIL_PIN);
    soilPercent = map(soilRaw, 4095, 0, 0, 100);

    if (soilPercent < 0)
      soilPercent = 0;
    if (soilPercent > 100)
      soilPercent = 100;
    mqttPublishData();
    }

}

void updateThresholdStates() {
  tempOverThreshold  = (!isnan(currentTemp)     && currentTemp     > tempThresholdC);
  soilOverThreshold  = (soilPercent             > soilThresholdPercent);
  humidOverThreshold = (!isnan(currentHumidity) && currentHumidity > humidThresholdPercent);

  alertFlags = 0;
  if (tempOverThreshold)  alertFlags |= ALERT_TEMP;
  if (soilOverThreshold)  alertFlags |= ALERT_SOIL;
  if (humidOverThreshold) alertFlags |= ALERT_HUMID;
}
