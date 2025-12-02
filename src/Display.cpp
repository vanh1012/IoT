#include "./headers/Display.h"
#include "./headers/Config.h"

unsigned long lastLcdUpdateTime = 0;
const unsigned long lcdUpdateInterval = 500;
int lastNormalScreen = -1;
int lastConfigScreen = -1;
Mode lastMode = MODE_NORMAL;

void initDisplay()
{
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("Smart Irrigation");
    lcd.setCursor(0, 1);
    lcd.print("Starting...");
}

void showNormalScreen(bool forceClear)
{
    if (forceClear)
        lcd.clear();

    switch (normalScreen)
    {
    case 0:
        lcd.setCursor(0, 0);
        lcd.print("Soil:");
        lcd.print((int)soilMoisture);
        lcd.print("%   ");
        lcd.setCursor(0, 1);
        lcd.print("Thr:");
        lcd.print(cfgMoistureThreshold);
        lcd.print("%   ");
        break;
    case 1:
        lcd.setCursor(0, 0);
        lcd.print("Air Hum:    ");
        lcd.setCursor(0, 1);
        lcd.print((int)airHumidity);
        lcd.print("%   ");
        break;
    case 2:
        lcd.setCursor(0, 0);
        lcd.print("Temp:");
        lcd.print(airTemperature, 1);
        lcd.print((char)223);
        lcd.print("C   ");
        lcd.setCursor(0, 1);
        lcd.print("Mode: NORMAL    ");
        break;
    case 3:
        lcd.setCursor(0, 0);
        lcd.print("Water:");
        lcd.print(cfgWaterLiters);
        lcd.print("L   ");
        lcd.setCursor(0, 1);
        lcd.print("Time:");
        lcd.print(cfgMinutesPerHour);
        lcd.print("m/1h ");
        break;
    }
}

void showConfigScreen(bool forceClear)
{
    if (forceClear)
        lcd.clear();
    switch (configScreen)
    {
    case 0:
        lcd.setCursor(0, 0);
        lcd.print("CFG: Lit water  ");
        lcd.setCursor(0, 1);
        lcd.print("Set: ");
        lcd.print(editingValue);
        lcd.print(" L   ");
        break;
    case 1:
        lcd.setCursor(0, 0);
        lcd.print("CFG: Min/Hour   ");
        lcd.setCursor(0, 1);
        lcd.print("Set: ");
        lcd.print(editingValue);
        lcd.print(" m   ");
        break;
    case 2:
        lcd.setCursor(0, 0);
        lcd.print("CFG: Soil Thr   ");
        lcd.setCursor(0, 1);
        lcd.print("Set: ");
        lcd.print(editingValue);
        lcd.print(" %   ");
        break;
    }
}

void updateDisplay()
{
    if (millis() - lastLcdUpdateTime < lcdUpdateInterval)
        return;
    lastLcdUpdateTime = millis();

    bool modeChanged = (currentMode != lastMode);

    if (currentMode == MODE_NORMAL)
    {
        bool screenChanged = (normalScreen != lastNormalScreen) || modeChanged;
        showNormalScreen(screenChanged);
        lastNormalScreen = normalScreen;
    }
    else
    {
        bool screenChanged = (configScreen != lastConfigScreen) || modeChanged;
        showConfigScreen(screenChanged);
        lastConfigScreen = configScreen;
    }
    lastMode = currentMode;
}