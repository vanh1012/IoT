// sensors.cpp
#include "sensors.h"

static int lastButtonState = LOW;

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

void readSensors() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t)) currentTemp = t;
  if (!isnan(h)) currentHumidity = h;

  soilRaw = analogRead(SOIL_PIN);
  soilPercent = map(soilRaw, 4095, 0, 0, 100);
  if (soilPercent < 0) soilPercent = 0;
  if (soilPercent > 100) soilPercent = 100;
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
