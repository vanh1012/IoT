#include <string.h>
#include "menu.h"

// ===== CUSTOM CHAR =====
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

// ===== CACHE MENU (CHỐNG NHÁY) =====
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

// ========== HIỂN THỊ MENU CHÍNH ==========
static void buildMenuTextForIndex(int menuIndex, char* buf, size_t bufSize) {
  if (menuIndex == 0) {
    // Ví dụ: Nhiet:24 20-35
    snprintf(buf, bufSize, "Nhiet:%2.0f %2d-%2d",
             currentTemp, tempThresholdLowC, tempThresholdHighC);
  } else if (menuIndex == 1) {
    // Dat: 45 30-60
    snprintf(buf, bufSize, "Dat:%3d %2d-%2d",
             soilPercent, soilThresholdLowPercent, soilThresholdHighPercent);
  } else if (menuIndex == 2) {
    // KK: 60 40-70
    snprintf(buf, bufSize, "KK:%3.0f %2d-%2d",
             currentHumidity, humidThresholdLowPercent, humidThresholdHighPercent);
  } else {
    snprintf(buf, bufSize, "%s", menuItems[menuIndex]);
  }
}

void updateMenuFromPot() {
  int potVal = analogRead(MENU_POT_PIN);
  int newIndex = map(potVal, 0, 4095, 0, MENU_COUNT - 1);
  newIndex = constrain(newIndex, 0, MENU_COUNT - 1);
  if (newIndex != selectedIndex) {
    selectedIndex = newIndex;
  }
}

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

  // Dòng 0
  if (need0) {
    lcd.setCursor(0, 0);
    if (selectedIndex == first) lcd.write(byte(0));
    else lcd.print(' ');

    lcd.setCursor(1, 0);
    lcd.print("              ");
    lcd.setCursor(1, 0);
    lcd.print(line0);

    lcd.setCursor(15, 0);
    if      (first == 3) lcd.write(byte(4)); // bơm
    else if (first == 4) lcd.write(byte(5)); // đèn
    else                 lcd.print(' ');

    strcpy(prevLine0, line0);
    prevFirstIndex = first;
  }

  // Dòng 1
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

// ========== HỖ TRỢ BÁO LỖI NGƯỠNG ==========
static void showThresholdError() {
  for (int i = 0; i < 3; i++) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("LOI NGUONG");
    lcd.setCursor(0, 1);
    lcd.print("Duoi >= Tren");
    delay(1000);

    lcd.clear();
    delay(1000);
  }
}

// ========== CONFIG NHIỆT ĐỘ (2 BƯỚC) ==========
static int  tempConfigPhase = 0;     // 0: ngưỡng dưới, 1: ngưỡng trên
static bool tempConfigInit  = false;
static int  tempLowCandidate = 20;
static int  tempHighCandidate = 35;

void startTempConfig() {
  tempConfigPhase = 0;
  tempConfigInit  = false;
}

void handleTempConfig() {
  if (!tempConfigInit) {
    lcd.clear();
    if (tempConfigPhase == 0) {
      tempLowCandidate = tempThresholdLowC;
      lcd.setCursor(0, 0);
      lcd.write(byte(1));
      lcd.print(" Nhiet do:");
      lcd.print(currentTemp, 1);
      lcd.print((char)223);
      lcd.print("C");

      lcd.setCursor(0, 1);
      lcd.print("Set NGUONG DUOI");
    } else {
      tempHighCandidate = tempThresholdHighC;
      lcd.setCursor(0, 0);
      lcd.write(byte(1));
      lcd.print(" Nhiet do:");
      lcd.print(currentTemp, 1);
      lcd.print((char)223);
      lcd.print("C");

      lcd.setCursor(0, 1);
      lcd.print("Set NGUONG TREN");
    }
    tempConfigInit = true;
  }

  int potVal = analogRead(MENU_POT_PIN);
  int mapped = map(potVal, 0, 4095, minTempThresholdC, maxTempThresholdC);

  lcd.setCursor(0, 1);
  if (tempConfigPhase == 0) {
    tempLowCandidate = mapped;
    lcd.print("Duoi: ");
    lcd.print(tempLowCandidate);
    lcd.print((char)223);
    lcd.print("C    ");
  } else {
    tempHighCandidate = mapped;
    lcd.print("Tren: ");
    lcd.print(tempHighCandidate);
    lcd.print((char)223);
    lcd.print("C    ");
  }

  if (buttonPressedOnce()) {
    if (tempConfigPhase == 0) {
      // xong bước ngưỡng dưới -> qua ngưỡng trên
      tempConfigPhase = 1;
      tempConfigInit  = false;
    } else {
      // kiểm tra hợp lệ: dưới < trên
      if (tempLowCandidate < tempHighCandidate) {
        tempThresholdLowC  = tempLowCandidate;
        tempThresholdHighC = tempHighCandidate;
        enterMenuMode();
      } else {
        // lỗi -> nhấp nháy 3 lần rồi làm lại từ đầu
        showThresholdError();
        tempConfigPhase = 0;
        tempConfigInit  = false;
      }
    }
  }
}

// ========== CONFIG ĐỘ ẨM ĐẤT ==========
static int  soilConfigPhase = 0;       // 0: ngưỡng dưới, 1: ngưỡng trên
static bool soilConfigInit  = false;
static int  soilLowCandidate  = 30;
static int  soilHighCandidate = 60;

void startSoilConfig() {
  soilConfigPhase = 0;
  soilConfigInit  = false;
}

void handleSoilConfig() {
  if (!soilConfigInit) {
    lcd.clear();
    if (soilConfigPhase == 0) {
      soilLowCandidate = soilThresholdLowPercent;
      lcd.setCursor(0, 0);
      lcd.write(byte(2));
      lcd.print(" Dat:");
      lcd.print(soilPercent);
      lcd.print("%   ");

      lcd.setCursor(0, 1);
      lcd.print("Set NGUONG DUOI");
    } else {
      soilHighCandidate = soilThresholdHighPercent;
      lcd.setCursor(0, 0);
      lcd.write(byte(2));
      lcd.print(" Dat:");
      lcd.print(soilPercent);
      lcd.print("%   ");

      lcd.setCursor(0, 1);
      lcd.print("Set NGUONG TREN");
    }
    soilConfigInit = true;
  }

  int potVal = analogRead(MENU_POT_PIN);
  int mapped = map(potVal, 0, 4095,
                   minSoilThresholdPercent, maxSoilThresholdPercent);

  lcd.setCursor(0, 1);
  if (soilConfigPhase == 0) {
    soilLowCandidate = mapped;
    lcd.print("Duoi: ");
    lcd.print(soilLowCandidate);
    lcd.print("%   ");
  } else {
    soilHighCandidate = mapped;
    lcd.print("Tren: ");
    lcd.print(soilHighCandidate);
    lcd.print("%   ");
  }

  if (buttonPressedOnce()) {
    if (soilConfigPhase == 0) {
      soilConfigPhase = 1;
      soilConfigInit  = false;
    } else {
      if (soilLowCandidate < soilHighCandidate) {
        soilThresholdLowPercent  = soilLowCandidate;
        soilThresholdHighPercent = soilHighCandidate;
        enterMenuMode();
      } else {
        showThresholdError();
        soilConfigPhase = 0;
        soilConfigInit  = false;
      }
    }
  }
}

// ========== CONFIG ĐỘ ẨM KHÔNG KHÍ ==========
static int  humidConfigPhase = 0;       // 0: ngưỡng dưới, 1: ngưỡng trên
static bool humidConfigInit  = false;
static int  humidLowCandidate  = 40;
static int  humidHighCandidate = 70;

void startHumidConfig() {
  humidConfigPhase = 0;
  humidConfigInit  = false;
}

void handleHumidConfig() {
  if (!humidConfigInit) {
    lcd.clear();
    if (humidConfigPhase == 0) {
      humidLowCandidate = humidThresholdLowPercent;
      lcd.setCursor(0, 0);
      lcd.write(byte(3));
      lcd.print(" KK:");
      lcd.print(currentHumidity, 1);
      lcd.print("%   ");

      lcd.setCursor(0, 1);
      lcd.print("Set NGUONG DUOI");
    } else {
      humidHighCandidate = humidThresholdHighPercent;
      lcd.setCursor(0, 0);
      lcd.write(byte(3));
      lcd.print(" KK:");
      lcd.print(currentHumidity, 1);
      lcd.print("%   ");

      lcd.setCursor(0, 1);
      lcd.print("Set NGUONG TREN");
    }
    humidConfigInit = true;
  }

  int potVal = analogRead(MENU_POT_PIN);
  int mapped = map(potVal, 0, 4095,
                   minHumThresholdPercent, maxHumThresholdPercent);

  lcd.setCursor(0, 1);
  if (humidConfigPhase == 0) {
    humidLowCandidate = mapped;
    lcd.print("Duoi: ");
    lcd.print(humidLowCandidate);
    lcd.print("%   ");
  } else {
    humidHighCandidate = mapped;
    lcd.print("Tren: ");
    lcd.print(humidHighCandidate);
    lcd.print("%   ");
  }

  if (buttonPressedOnce()) {
    if (humidConfigPhase == 0) {
      humidConfigPhase = 1;
      humidConfigInit  = false;
    } else {
      if (humidLowCandidate < humidHighCandidate) {
        humidThresholdLowPercent  = humidLowCandidate;
        humidThresholdHighPercent = humidHighCandidate;
        enterMenuMode();
      } else {
        showThresholdError();
        humidConfigPhase = 0;
        humidConfigInit  = false;
      }
    }
  }
}

// ========== PUMP & LIGHT STATUS ==========
static bool pumpScreenInit  = false;
static bool lightScreenInit = false;

void startPumpStatusScreen() {
  pumpScreenInit = false;
}

void startLightStatusScreen() {
  lightScreenInit = false;
}

void handlePumpStatusScreen() {
  if (!pumpScreenInit) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.write(byte(4));
    lcd.print(" May bom (tay)");
    lcd.setCursor(0, 1);
    lcd.print("Trang thai: ");
    lcd.print(pumpOn ? "BAT " : "TAT ");
    pumpScreenInit = true;
  }

  if (buttonPressedOnce()) {
    if (pumpOn) turnPumpOff();
    else        turnPumpOn();
    enterMenuMode();
  }
}

void handleLightStatusScreen() {
  if (!lightScreenInit) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.write(byte(5));
    lcd.print(" May den (tay)");
    lcd.setCursor(0, 1);
    lcd.print("Trang thai: ");
    lcd.print(lightOn ? "BAT " : "TAT ");
    lightScreenInit = true;
  }

  if (buttonPressedOnce()) {
    if (lightOn) turnLightOff();
    else         turnLightOn();
    enterMenuMode();
  }
}

void enterMenuMode() {
  currentMode = MODE_MENU;
  initMenuRenderState();
}
