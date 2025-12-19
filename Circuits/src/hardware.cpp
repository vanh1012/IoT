#include "hardware.h"

static unsigned long lastBlinkMillis = 0;
static unsigned long lastBeepMillis = 0;
static bool statusLedState = false;
static bool buzzerState = false;
void setupHardware() {
  pinMode(MENU_POT_PIN, INPUT);
  pinMode(SOIL_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT);  // có R kéo xuống ngoài
  pinMode(RELAY_PUMP_PIN, OUTPUT);
  pinMode(RELAY_LIGHT_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  pumpOn  = false;
  lightOn = false;
  digitalWrite(RELAY_PUMP_PIN, LOW);
  digitalWrite(RELAY_LIGHT_PIN, LOW);
  digitalWrite(STATUS_LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  dht.begin();
  lcd.init();
  lcd.backlight();
}

void updateStatusLed() {
  unsigned long now = millis();
  if (now - lastBlinkMillis >= 500) {
    lastBlinkMillis = now;
    statusLedState = !statusLedState;
    digitalWrite(STATUS_LED_PIN, statusLedState ? HIGH : LOW);
  }
}

void updateBuzzer() {
  if (!pumpOn) {
    digitalWrite(BUZZER_PIN, LOW);
    buzzerState = false;
    return;
  }

  // pump ON → buzzer beep 1s / 1s
  unsigned long now = millis();
  if (now - lastBeepMillis >= 1000) {
    lastBeepMillis = now;
    buzzerState = !buzzerState;
    digitalWrite(BUZZER_PIN, buzzerState ? HIGH : LOW);
  }
}