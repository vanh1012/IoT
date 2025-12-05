"use client"

import { useState } from "react"
import { Card } from "./ui/card"
import { Droplet, Power, Clock } from "lucide-react"

export function PumpControlPanel({ pumpStatus, onToggle }) {
    const [customMinutes, setCustomMinutes] = useState("")

    const presetDurations = [5, 10, 15, 30]

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${minutes}m ${secs}s`
    }

    const handleQuickToggle = (minutes) => {
        onToggle(minutes)
        setCustomMinutes("")
    }

    const handleCustomMinutes = () => {
        const minutes = Number.parseInt(customMinutes)
        if (minutes > 0 && minutes <= 120) {
            handleQuickToggle(minutes)
        }
    }

    return (
        <Card className="bg-white shadow-lg border-0 p-6 md:p-8">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Droplet className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Máy Bơm Nước</h2>
                            <p className="text-sm text-gray-500">Điều khiển tưới nước</p>
                        </div>
                    </div>
                    <div
                        className={`text-right p-4 rounded-lg ${pumpStatus.isOn ? "bg-green-100 border-2 border-green-500" : "bg-gray-100 border-2 border-gray-300"
                            }`}
                    >
                        <div className={`text-3xl font-bold ${pumpStatus.isOn ? "text-green-600" : "text-gray-400"}`}>
                            {pumpStatus.isOn ? "BẬT" : "TẮT"}
                        </div>
                    </div>
                </div>

                {pumpStatus.isOn && (
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg p-6 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm font-semibold opacity-90">Thời gian còn lại</span>
                        </div>
                        <div className="text-5xl font-bold font-mono">{formatTime(pumpStatus.remainingTime)}</div>
                    </div>
                )}

                <button
                    onClick={() => handleQuickToggle(null)}
                    className={`w-full py-6 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${pumpStatus.isOn
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl"
                        : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
                        }`}
                >
                    <Power className="w-6 h-6" />
                    {pumpStatus.isOn ? "TẮT MÁY BƠM NGAY" : "BẬT MÁY BƠM"}
                </button>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn Thời Gian Tưới</h3>
                <div className="grid grid-cols-4 gap-3">
                    {presetDurations.map((minutes) => (
                        <button
                            key={minutes}
                            onClick={() => handleQuickToggle(minutes)}
                            className={`py-3 px-2 rounded-lg font-semibold transition-all duration-200 ${pumpStatus.isOn && pumpStatus.totalDuration === minutes * 60
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                }`}
                        >
                            {minutes}m
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Nhập Thời Gian Tùy Chỉnh (phút)</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        min="1"
                        max="120"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(e.target.value)}
                        placeholder="Nhập số phút (1-120)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleCustomMinutes}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Bật
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Tối đa 120 phút (2 giờ)</p>
            </div>
        </Card>
    )
}
