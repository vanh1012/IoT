"use client"

import { Card } from "./ui/card"
import { Droplets, Thermometer, Wind, Clock } from "lucide-react"

export function SensorData({ sensorData }) {
    const getMoistureStatus = (moisture) => {
        if (moisture < 40) return { label: "Khô", color: "text-red-600", bg: "bg-red-50" }
        if (moisture > 80) return { label: "Ẩm", color: "text-blue-600", bg: "bg-blue-50" }
        return { label: "Tối Ưu", color: "text-green-600", bg: "bg-green-50" }
    }

    const getTempStatus = (temp) => {
        if (temp < 18) return { label: "Lạnh", color: "text-blue-600", bg: "bg-blue-50" }
        if (temp > 28) return { label: "Nóng", color: "text-red-600", bg: "bg-red-50" }
        return { label: "Tối Ưu", color: "text-green-600", bg: "bg-green-50" }
    }

    const moistureStatus = getMoistureStatus(sensorData.soilMoisture)
    const tempStatus = getTempStatus(sensorData.temperature)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Soil Moisture */}
            <Card className="bg-white shadow-lg border-0 p-6">
                <div className="flex items-start gap-3">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                        <Droplets className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-600">Độ Ẩm Đất</h3>
                        <div className="mt-2">
                            <p className="text-3xl font-bold text-gray-900">
                                {sensorData.soilMoisture.toFixed(1)}
                                <span className="text-lg">%</span>
                            </p>
                            <span className={`text-xs font-semibold ${moistureStatus.color}`}>{moistureStatus.label}</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Temperature */}
            <Card className="bg-white shadow-lg border-0 p-6">
                <div className="flex items-start gap-3">
                    <div className="p-3 bg-orange-100 rounded-lg">
                        <Thermometer className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-600">Nhiệt Độ</h3>
                        <div className="mt-2">
                            <p className="text-3xl font-bold text-gray-900">
                                {sensorData.temperature.toFixed(1)}
                                <span className="text-lg">°C</span>
                            </p>
                            <span className={`text-xs font-semibold ${tempStatus.color}`}>{tempStatus.label}</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Humidity */}
            <Card className="bg-white shadow-lg border-0 p-6">
                <div className="flex items-start gap-3">
                    <div className="p-3 bg-cyan-100 rounded-lg">
                        <Wind className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-600">Độ Ẩm Không Khí</h3>
                        <div className="mt-2">
                            <p className="text-3xl font-bold text-gray-900">
                                {sensorData.humidity.toFixed(1)}
                                <span className="text-lg">%</span>
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Last Update */}
            <Card className="bg-white shadow-lg border-0 p-6">
                <div className="flex items-start gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-600">Cập Nhật Lần Cuối</h3>
                        <div className="mt-2">
                            <p className="text-sm font-mono text-gray-900">{sensorData.lastUpdate}</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
