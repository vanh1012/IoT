// actuators.h
#pragma once
#include "globals.h"

void applyPumpState();
void applyLightState();

// API cho web điều khiển
void turnPumpOn();
void turnPumpOff();
void turnLightOn();
void turnLightOff();
