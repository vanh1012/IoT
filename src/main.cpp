#include <Arduino.h>

const int potPin = 34; // chân giữa của biến trở nối ở đây

void setup() {
  Serial.begin(115200);
}

void loop() {
  int adcVal = analogRead(potPin); // giá trị gốc 0-4095
  // Quy đổi về thang điểm 0-100
  float percent = adcVal * 100.0 / 4095.0;

  Serial.print("ADC: ");
  Serial.print(adcVal);
  Serial.print("   →   ");
  Serial.print(percent, 1);
  Serial.println("%");

  delay(200);
}
