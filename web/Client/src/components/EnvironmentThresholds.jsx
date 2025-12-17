"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { AlertCircle } from "lucide-react";

export function EnvironmentThresholds() {
  const { user, updateThreshold } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  // Sync local draft with user data
  useEffect(() => {
    if (user) {
      setDraft({ ...user });
    }
  }, [user]);

  if (!user || !draft) return null;
  console.log(user);
  // Update min / max safely (ONLY local state)
  const updatePair = (keyMin, keyMax, newValue, isMin) => {
    setDraft((prev) => {
      let min = prev[keyMin];
      let max = prev[keyMax];

      if (isMin) {
        min = Math.min(newValue, max - 1);
      } else {
        max = Math.max(newValue, min + 1);
      }

      return {
        ...prev,
        [keyMin]: min,
        [keyMax]: max,
      };
    });
  };

  const handleSave = async () => {
    await updateThreshold({
      tempThresholdHighC: draft.tempThresholdHighC,
      tempThresholdLowC: draft.tempThresholdLowC,
      soilThresholdLowPercent: draft.soilThresholdLowPercent,
      soilThresholdHighPercent: draft.soilThresholdHighPercent,
      humidThresholdLowPercent: draft.humidThresholdLowPercent,
      humidThresholdHighPercent: draft.humidThresholdHighPercent,
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft({ ...user });
    setIsEditing(false);
  };

  return (
    <Card className="bg-white shadow-lg border-0 p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-orange-100 rounded-lg">
          <AlertCircle className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Ngưỡng Môi Trường
          </h2>
          <p className="text-sm text-gray-500">
            Đặt các thông số thích hợp cho cây trồng
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* -------- SOIL -------- */}
        <Section
          title="Độ Ẩm Đất (%)"
          min={draft.soilThresholdLowPercent}
          max={draft.soilThresholdHighPercent}
          disabled={!isEditing}
          color="emerald"
          onMinChange={(v) =>
            updatePair(
              "soilThresholdLowPercent",
              "soilThresholdHighPercent",
              v,
              true
            )
          }
          onMaxChange={(v) =>
            updatePair(
              "soilThresholdLowPercent",
              "soilThresholdHighPercent",
              v,
              false
            )
          }
        />

        {/* -------- TEMP -------- */}
        <Section
          title="Nhiệt Độ (°C)"
          min={draft.tempThresholdLowC}
          max={draft.tempThresholdHighC}
          disabled={!isEditing}
          color="orange"
          maxValue={60}
          onMinChange={(v) =>
            updatePair("tempThresholdLowC", "tempThresholdHighC", v, true)
          }
          onMaxChange={(v) =>
            updatePair("tempThresholdLowC", "tempThresholdHighC", v, false)
          }
        />

        {/* -------- HUMID -------- */}
        <Section
          title="Độ Ẩm Không Khí (%)"
          min={draft.humidThresholdLowPercent}
          max={draft.humidThresholdHighPercent}
          disabled={!isEditing}
          color="cyan"
          onMinChange={(v) =>
            updatePair(
              "humidThresholdLowPercent",
              "humidThresholdHighPercent",
              v,
              true
            )
          }
          onMaxChange={(v) =>
            updatePair(
              "humidThresholdLowPercent",
              "humidThresholdHighPercent",
              v,
              false
            )
          }
        />
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end gap-3">
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Cập nhật</Button>
        ) : (
          <>
            <Button variant="outline" onClick={handleCancel}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Lưu cập nhật</Button>
          </>
        )}
      </div>

    </Card>
  );
}

/* ---------- Reusable Section ---------- */
function Section({
  title,
  min,
  max,
  onMinChange,
  onMaxChange,
  disabled,
  color,
  maxValue = 100,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      <Slider
        label="Tối Thiểu"
        value={min}
        max={maxValue}
        disabled={disabled}
        color={color}
        onChange={onMinChange}
      />

      <Slider
        label="Tối Đa"
        value={max}
        max={maxValue}
        disabled={disabled}
        color={color}
        onChange={onMaxChange}
      />
    </div>
  );
}

function Slider({ label, value, max, onChange, disabled, color }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-lg font-bold text-gray-900">{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 bg-gray-300 rounded-lg cursor-pointer accent-${color}-600 disabled:opacity-50`}
      />
    </div>
  );
}
