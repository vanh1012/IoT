#include "sensors.h"

static int lastButtonState = LOW;

bool buttonPressedOnce() {
  int state = digitalRead(BUTTON_PIN);
  bool pressed = false;
  if (lastButtonState == LOW && state == HIGH) {
    pressed = true;
    delay(20); // debounce
  }
  lastButtonState = state;
  return pressed;
}

void readSensors() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t)) currentTemp = t;
  if (!isnan(h)) currentHumidity = h;

  soilRaw = analogRead(SOIL_PIN);   // 0-4095
  // 0 = rất ướt, 4095 = rất khô -> % ẩm
  soilPercent = map(soilRaw, 4095, 0, 0, 100);
  soilPercent = constrain(soilPercent, 0, 100);
}

void updateThresholdStates() {
  // Vượt ngưỡng = NẰM NGOÀI [LOW, HIGH]
  tempOverThreshold =
    (!isnan(currentTemp) &&
     (currentTemp < tempThresholdLowC || currentTemp > tempThresholdHighC));

  soilOverThreshold =
    (soilPercent < soilThresholdLowPercent || soilPercent > soilThresholdHighPercent);

  humidOverThreshold =
    (!isnan(currentHumidity) &&
     (currentHumidity < humidThresholdLowPercent ||
      currentHumidity > humidThresholdHighPercent));

  alertFlags = 0;
  if (tempOverThreshold)  alertFlags |= ALERT_TEMP;
  if (soilOverThreshold)  alertFlags |= ALERT_SOIL;
  if (humidOverThreshold) alertFlags |= ALERT_HUMID;
}
