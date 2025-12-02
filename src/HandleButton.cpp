#include "./headers/HandleButton.h"
#include "./headers/Config.h"

// Variables for logic
bool buttonState = LOW;
bool lastButtonReading = LOW;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;

int buttonPressCount = 0;
unsigned long firstPressTime = 0;
const unsigned long doubleClickWindow = 500;

void initInput()
{
    pinMode(BUTTON_PIN, INPUT);
}

void handleSingleClick()
{
    if (currentMode == MODE_NORMAL)
    {
        normalScreen = (normalScreen + 1) % NORMAL_SCREEN_COUNT;
    }
    else
    {
        // Lưu giá trị khi click ở config mode
        switch (configScreen)
        {
        case 0:
            cfgWaterLiters = editingValue;
            break;
        case 1:
            cfgMinutesPerHour = editingValue;
            break;
        case 2:
            cfgMoistureThreshold = editingValue;
            break;
        }
        configScreen = (configScreen + 1) % CONFIG_SCREEN_COUNT;

        // Cập nhật lại editingValue cho screen mới
        switch (configScreen)
        {
        case 0:
            editingValue = cfgWaterLiters;
            break;
        case 1:
            editingValue = cfgMinutesPerHour;
            break;
        case 2:
            editingValue = cfgMoistureThreshold;
            break;
        }
    }
}

void handleDoubleClick()
{
    if (currentMode == MODE_NORMAL)
    {
        currentMode = MODE_CONFIG;
        configScreen = 0;
        editingValue = cfgWaterLiters;
        Serial.println(">> Enter CONFIG mode");
    }
    else
    {
        currentMode = MODE_NORMAL;
        digitalWrite(LED_PIN, HIGH);
        lcd.backlight();
        Serial.println(">> Back to NORMAL mode");
    }
}

void handleInput()
{
    int reading = digitalRead(BUTTON_PIN);
    unsigned long now = millis();

    if (reading != lastButtonReading)
    {
        lastDebounceTime = now;
    }

    if ((now - lastDebounceTime) > debounceDelay)
    {
        if (reading != buttonState)
        {
            buttonState = reading;
            if (buttonState == HIGH)
            {
                if (buttonPressCount == 0)
                    firstPressTime = now;
                buttonPressCount++;
            }
        }
    }
    lastButtonReading = reading;

    // Process Logic
    if (buttonPressCount > 0 && (now - firstPressTime > doubleClickWindow))
    {
        if (buttonPressCount == 1)
            handleSingleClick();
        else
            handleDoubleClick();
        buttonPressCount = 0;
    }
}