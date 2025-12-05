"use client"

import { useState } from "react"
import { Card } from "./ui/card"
import { Lightbulb, Power, Clock } from "lucide-react"

export function LightControlPanel({ onToggle }) {
    const [isOn, setIsOn] = useState(false)
    const [remainingTime, setRemainingTime] = useState(0)
    const [customMinutes, setCustomMinutes] = useState("")

    const presetDurations = [15, 30, 60, 120, 240]

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`
        }
        return `${secs}s`
    }

    const handleQuickToggle = (minutes) => {
        setIsOn(true)
        setRemainingTime(minutes ? minutes * 60 : 0)
        setCustomMinutes("")
        onToggle(minutes)
    }

    const handleCustomMinutes = () => {
        const minutes = Number.parseInt(customMinutes)
        if (minutes > 0 && minutes <= 1440) {
            handleQuickToggle(minutes)
        }
    }

    const handleOff = () => {
        setIsOn(false)
        setRemainingTime(0)
        onToggle(null)
    }

    return (
        <Card className="bg-white shadow-lg border-0 p-6 md:p-8">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Lightbulb className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Ánh Sáng</h2>
                            <p className="text-sm text-gray-500">Điều khiển chiếu sáng</p>
                        </div>
                    </div>
                    <div
                        className={`text-right p-4 rounded-lg ${isOn ? "bg-green-100 border-2 border-green-500" : "bg-gray-100 border-2 border-gray-300"
                            }`}
                    >
                        <div className={`text-3xl font-bold ${isOn ? "text-green-600" : "text-gray-400"}`}>
                            {isOn ? "BẬT" : "TẮT"}
                        </div>
                    </div>
                </div>

                {isOn && (
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm font-semibold opacity-90">Thời gian còn lại</span>
                        </div>
                        <div className="text-5xl font-bold font-mono">{formatTime(remainingTime)}</div>
                    </div>
                )}

                <button
                    onClick={isOn ? handleOff : () => handleQuickToggle(null)}
                    className={`w-full py-6 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${isOn
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl"
                        : "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl"
                        }`}
                >
                    <Power className="w-6 h-6" />
                    {isOn ? "TẮT ÁNH SÁNG NGAY" : "BẬT ÁNH SÁNG"}
                </button>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn Thời Gian Chạy</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {presetDurations.map((minutes) => (
                        <button
                            key={minutes}
                            onClick={() => handleQuickToggle(minutes)}
                            className={`py-3 px-2 rounded-lg font-semibold transition-all duration-200 ${isOn && remainingTime > 0 && remainingTime === minutes * 60
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                }`}
                        >
                            {minutes === 60 ? "1h" : minutes === 120 ? "2h" : minutes === 240 ? "4h" : `${minutes}m`}
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
                        max="1440"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(e.target.value)}
                        placeholder="Nhập số phút (1-1440)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleCustomMinutes}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Bật
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Tối đa 1440 phút (24 giờ)</p>
            </div>
        </Card>
    )
}
