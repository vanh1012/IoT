"use client"

import { useSensor } from "../hooks/useSensor"
import { Button } from "./ui/button";
import { Card } from "./ui/card"
import { Droplets, Thermometer, Wind, Clock, Loader } from "lucide-react"

export function SensorData() {
    const { data, fetchLatestData, loading } = useSensor();
    return (
        <>
            <div className="flex justify-end mb-4">
                <Button
                    onClick={fetchLatestData}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="gap-2 cursor-pointer"
                >
                    {loading && <Loader className="w-4 h-4 animate-spin" />}
                    Cập nhật
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    {data.soilMoisture}
                                    <span className="text-lg">%</span>
                                </p>
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
                                    {data.airTemperature}
                                    <span className="text-lg">°C</span>
                                </p>
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
                                    {data.airHumidity}
                                    <span className="text-lg">%</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Last Update */}
                {/* <Card className="bg-white shadow-lg border-0 p-6">
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
            </Card> */}
            </div>
        </>

    )
}
