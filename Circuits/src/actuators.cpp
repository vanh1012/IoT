// actuators.cpp
#include "actuators.h"

void applyPumpState() {
  // Nếu relay active HIGH:
  digitalWrite(RELAY_PUMP_PIN, pumpOn ? HIGH : LOW);
  // Nếu relay active LOW: đảo lại ở đây
}

void applyLightState() {
  digitalWrite(RELAY_LIGHT_PIN, lightOn ? HIGH : LOW);
}

void turnPumpOn() {
  pumpOn = true;
  applyPumpState();
}

void turnPumpOff() {
  pumpOn = false;
  applyPumpState();
}

void turnLightOn() {
  lightOn = true;
  applyLightState();
}

void turnLightOff() {
  lightOn = false;
  applyLightState();
}
