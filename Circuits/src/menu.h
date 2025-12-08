#pragma once
#include "globals.h"
#include "sensors.h"
#include "actuators.h"

// Khởi tạo custom chars & reset cache
void initMenuRenderState();

// Menu chính
void updateMenuFromPot();
void updateMenuDisplay();

// Quay lại menu
void enterMenuMode();

// Bắt đầu & xử lý config từng loại
void startTempConfig();
void startSoilConfig();
void startHumidConfig();

void handleTempConfig();
void handleSoilConfig();
void handleHumidConfig();

// Màn hình điều khiển tay bơm/đèn
void startPumpStatusScreen();
void startLightStatusScreen();
void handlePumpStatusScreen();
void handleLightStatusScreen();
