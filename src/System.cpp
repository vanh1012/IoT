#include "./headers/System.h"
#include "./headers/Config.h"

// Buzzer vars
bool buzzerOn = false;
unsigned long lastBuzzerTime = 0;
const unsigned long buzzerOnDuration = 1000;
const unsigned long buzzerCyclePeriod = 5000;

// Blink vars
bool blinkOn = true;
unsigned long lastBlinkTime = 0;
const unsigned long blinkInterval = 300;

void initSystem()
{
    pinMode(LED_PIN, OUTPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(LED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, LOW);
}

void updateBuzzer()
{
    if (currentMode != MODE_NORMAL)
    {
        buzzerOn = false;
        digitalWrite(BUZZER_PIN, LOW);
        return;
    }

    unsigned long now = millis();
    if (!buzzerOn)
    {
        if (now - lastBuzzerTime >= buzzerCyclePeriod)
        {
            buzzerOn = true;
            lastBuzzerTime = now;
            digitalWrite(BUZZER_PIN, HIGH);
        }
    }
    else
    {
        if (now - lastBuzzerTime >= buzzerOnDuration)
        {
            buzzerOn = false;
            lastBuzzerTime = now;
            digitalWrite(BUZZER_PIN, LOW);
        }
    }
}

void updateBlink()
{
    if (currentMode == MODE_CONFIG)
    {
        if (millis() - lastBlinkTime >= blinkInterval)
        {
            lastBlinkTime = millis();
            blinkOn = !blinkOn;
            digitalWrite(LED_PIN, blinkOn ? HIGH : LOW);
            if (blinkOn)
                lcd.backlight();
            else
                lcd.noBacklight();
        }
    }
    else
    {
        digitalWrite(LED_PIN, HIGH);
        // lcd.backlight() handled in input double click or display init
    }
}

void updateSystem()
{
    updateBuzzer();
    updateBlink();
}