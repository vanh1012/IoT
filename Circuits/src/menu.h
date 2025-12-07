// menu.h
#pragma once
#include "globals.h"
#include "sensors.h"
#include "actuators.h"

void initMenuRenderState();
void updateMenuFromPot();
void updateMenuDisplay();

void handleTempConfig();
void handleSoilConfig();
void handleHumidConfig();
void handlePumpStatusScreen();
void handleLightStatusScreen();

void enterMenuMode();
