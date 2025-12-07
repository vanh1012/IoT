// menu.cpp
#include "menu.h"

// ===== Custom chars & cache chống nhấp nháy =====
static byte cursorChar[8] = {
  B00100, B00110, B00111, B00110,
  B00100, B00000, B00000, B00000
};
static byte thermoChar[8] = {
  B00100, B01010, B01010, B01010,
  B01010, B01110, B01110, B00100
};
static byte soilDropChar[8] = {
  B00100, B00100, B01010, B01010,
  B10001, B10001, B01110, B00000
};
static byte humidityChar[8] = {
  B00100, B01010, B10001, B10001,
  B10001, B01010, B00100, B00000
};
static byte pumpChar[8] = {
  B00000, B00110, B01111, B11110,
  B11110, B01111, B00110, B00000
};
static byte lightChar[8] = {
  B00100, B01110, B01110, B01110,
  B11111, B00100, B00000, B00100
};

static char prevLine0[17];
static char prevLine1[17];
static int  prevFirstIndex = -1;
static int  prevSecondIndex = -1;
static int  prevSelectedIndexForCursor = -1;
static unsigned long lastMenuUpdateMillis = 0;

void initMenuRenderState() {
  lcd.createChar(0, cursorChar);
  lcd.createChar(1, thermoChar);
  lcd.createChar(2, soilDropChar);
  lcd.createChar(3, humidityChar);
  lcd.createChar(4, pumpChar);
  lcd.createChar(5, lightChar);

  prevLine0[0] = '\0';
  prevLine1[0] = '\0';
  prevFirstIndex = -1;
  prevSecondIndex = -1;
  prevSelectedIndexForCursor = -1;
  lastMenuUpdateMillis = 0;
  lcd.clear();
}

// xây string cho từng mục
static void buildMenuTextForIndex(int menuIndex, char* buf, size_t bufSize) {
  if (menuIndex == 0) {
    snprintf(buf, bufSize, "Nhiet:%2.0f(%2d)", currentTemp, tempThresholdC);
  } else if (menuIndex == 1) {
    snprintf(buf, bufSize, "Dat:%3d(%3d)", soilPercent, soilThresholdPercent);
  } else if (menuIndex == 2) {
    snprintf(buf, bufSize, "KK:%3.0f(%3d)", currentHumidity, humidThresholdPercent);
  } else {
    snprintf(buf, bufSize, "%s", menuItems[menuIndex]);
  }
}

// đọc POT → selectedIndex
void updateMenuFromPot() {
  int potVal = analogRead(MENU_POT_PIN);
  int newIndex = map(potVal, 0, 4095, 0, MENU_COUNT - 1);
  newIndex = constrain(newIndex, 0, MENU_COUNT - 1);
  if (newIndex != selectedIndex) {
    selectedIndex = newIndex;
  }
}

// vẽ menu nhưng không clear toàn màn hình để tránh nhấp nháy
void updateMenuDisplay() {
  unsigned long now = millis();
  if (now - lastMenuUpdateMillis < 150) return;
  lastMenuUpdateMillis = now;

  int first;
  if (selectedIndex <= 1) first = 0;
  else if (selectedIndex >= MENU_COUNT - 1) first = MENU_COUNT - 2;
  else first = selectedIndex - 1;
  int second = first + 1;

  char line0[17];
  char line1[17];
  buildMenuTextForIndex(first,  line0, sizeof(line0));
  buildMenuTextForIndex(second, line1, sizeof(line1));
  line0[14] = '\0';
  line1[14] = '\0';

  bool cursorChanged = (prevSelectedIndexForCursor != selectedIndex);
  bool need0 = cursorChanged || first  != prevFirstIndex  || strcmp(line0, prevLine0) != 0;
  bool need1 = cursorChanged || second != prevSecondIndex || strcmp(line1, prevLine1) != 0;

  if (need0) {
    lcd.setCursor(0, 0);
    if (selectedIndex == first) lcd.write(byte(0));
    else lcd.print(' ');

    lcd.setCursor(1, 0);
    lcd.print("              ");
    lcd.setCursor(1, 0);
    lcd.print(line0);

    lcd.setCursor(15, 0);
    if      (first == 3) lcd.write(byte(4));
    else if (first == 4) lcd.write(byte(5));
    else                 lcd.print(' ');

    strcpy(prevLine0, line0);
    prevFirstIndex = first;
  }

  if (need1) {
    lcd.setCursor(0, 1);
    if (selectedIndex == second) lcd.write(byte(0));
    else lcd.print(' ');

    lcd.setCursor(1, 1);
    lcd.print("              ");
    lcd.setCursor(1, 1);
    lcd.print(line1);

    lcd.setCursor(15, 1);
    if      (second == 3) lcd.write(byte(4));
    else if (second == 4) lcd.write(byte(5));
    else                  lcd.print(' ');

    strcpy(prevLine1, line1);
    prevSecondIndex = second;
  }

  prevSelectedIndexForCursor = selectedIndex;
}

// ==== các màn hình config & status ====
void handleTempConfig() {
  static bool drawn = false;
  if (!drawn) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.write(byte(1));
    lcd.print(" Nhiet:");
    lcd.print(currentTemp, 1);
    lcd.print((char)223);
    lcd.print("C");
    drawn = true;
  }

  int potVal = analogRead(MENU_POT_PIN);
  int newTh  = map(potVal, 0, 4095, minTempThresholdC, maxTempThresholdC);
  if (newTh != tempThresholdC) {
    tempThresholdC = newTh;
    lcd.setCursor(0, 1);
    lcd.print("Nguong:");
    lcd.print(tempThresholdC);
    lcd.print((char)223);
    lcd.print("C   ");
  }

  if (buttonPressedOnce()) {
    drawn = false;
    enterMenuMode();
  }
}

void handleSoilConfig() {
  static bool drawn = false;
  if (!drawn) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.write(byte(2));
    lcd.print(" Dat:");
    lcd.print(soilPercent);
    lcd.print("%   ");
    drawn = true;
  }

  int potVal = analogRead(MENU_POT_PIN);
  int newTh  = map(potVal, 0, 4095,
                   minSoilThresholdPercent, maxSoilThresholdPercent);
  if (newTh != soilThresholdPercent) {
    soilThresholdPercent = newTh;
    lcd.setCursor(0, 1);
    lcd.print("Nguong:");
    lcd.print(soilThresholdPercent);
    lcd.print("%   ");
  }

  if (buttonPressedOnce()) {
    drawn = false;
    enterMenuMode();
  }
}

void handleHumidConfig() {
  static bool drawn = false;
  if (!drawn) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.write(byte(3));
    lcd.print(" KK:");
    lcd.print(currentHumidity, 1);
    lcd.print("%   ");
    drawn = true;
  }

  int potVal = analogRead(MENU_POT_PIN);
  int newTh  = map(potVal, 0, 4095,
                   minHumThresholdPercent, maxHumThresholdPercent);
  if (newTh != humidThresholdPercent) {
    humidThresholdPercent = newTh;
    lcd.setCursor(0, 1);
    lcd.print("Nguong:");
    lcd.print(humidThresholdPercent);
    lcd.print("%   ");
  }

  if (buttonPressedOnce()) {
    drawn = false;
    enterMenuMode();
  }
}

void handlePumpStatusScreen() {
  static bool drawn = false;
  if (!drawn) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.write(byte(4));
    lcd.print(" May bom (tay)");
    lcd.setCursor(0, 1);
    lcd.print("Trang thai: ");
    lcd.print(pumpOn ? "BAT " : "TAT ");
    drawn = true;
  }

  if (buttonPressedOnce()) {
    if (pumpOn) turnPumpOff();
    else        turnPumpOn();
    drawn = false;
    enterMenuMode();
  }
}

void handleLightStatusScreen() {
  static bool drawn = false;
  if (!drawn) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.write(byte(5));
    lcd.print(" May den (tay)");
    lcd.setCursor(0, 1);
    lcd.print("Trang thai: ");
    lcd.print(lightOn ? "BAT " : "TAT ");
    drawn = true;
  }

  if (buttonPressedOnce()) {
    if (lightOn) turnLightOff();
    else         turnLightOn();
    drawn = false;
    enterMenuMode();
  }
}

void enterMenuMode() {
  currentMode = MODE_MENU;
  initMenuRenderState();
}
