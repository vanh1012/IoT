"use client"

import { Card } from "./ui/card"
import { AlertCircle } from "lucide-react"

export function EnvironmentThresholds({ thresholds, onThresholdChange }) {
    return (
        <Card className="bg-white shadow-lg border-0 p-6 md:p-8">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-orange-100 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Ngưỡng Môi Trường</h2>
                        <p className="text-sm text-gray-500">Đặt các thông số thích hợp cho cây trồng</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Moisture Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Độ Ẩm Đất (%)</h3>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">Tối Thiểu</label>
                            <span className="text-lg font-bold text-gray-900">{thresholds.moistureMin}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={thresholds.moistureMin}
                            onChange={(e) => onThresholdChange("moistureMin", Number.parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">Tối Đa</label>
                            <span className="text-lg font-bold text-gray-900">{thresholds.moistureMax}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={thresholds.moistureMax}
                            onChange={(e) => onThresholdChange("moistureMax", Number.parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                    </div>
                </div>

                {/* Temperature Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Nhiệt Độ (°C)</h3>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">Tối Thiểu</label>
                            <span className="text-lg font-bold text-gray-900">{thresholds.temperatureMin}°C</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="40"
                            value={thresholds.temperatureMin}
                            onChange={(e) => onThresholdChange("temperatureMin", Number.parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">Tối Đa</label>
                            <span className="text-lg font-bold text-gray-900">{thresholds.temperatureMax}°C</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="40"
                            value={thresholds.temperatureMax}
                            onChange={(e) => onThresholdChange("temperatureMax", Number.parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Độ Ẩm Không Khí (%)</h3>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">Tối Thiểu</label>
                            <span className="text-lg font-bold text-gray-900">{thresholds.humidityMin}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={thresholds.humidityMin}
                            onChange={(e) => onThresholdChange("humidityMin", Number.parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">Tối Đa</label>
                            <span className="text-lg font-bold text-gray-900">{thresholds.humidityMax}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={thresholds.humidityMax}
                            onChange={(e) => onThresholdChange("humidityMax", Number.parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                        />
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                    <strong>Mẹo:</strong> Hệ thống sẽ tự động bật máy bơm khi độ ẩm dưới ngưỡng tối thiểu và gửi thông báo khi
                    vượt ngưỡng.
                </p>
            </div>
        </Card>
    )
}
