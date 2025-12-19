

import { Card } from "./ui/card";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { TrendingUp, Clock } from "lucide-react";
import useChartData from "../hooks/useDataChart";

export function DataAnalytics() {
    const { data, loading } = useChartData();
    const formatTime = (ts) =>
        new Date(ts).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });

    const formatDateTime = (ts) =>
        new Date(ts).toLocaleString("vi-VN"); "use client";
    // Data mới nhất (index 0 vì backend trả mới → cũ)
    const latest = data?.[0];

    // Chuẩn hoá data cho chart (cũ -> mới)
    const chartData = [...data]
        .reverse()
        .map((item) => ({
            time: formatTime(item.timestamp),
            soilMoisture: item.soilMoisture,
            airTemperature: item.airTemperature,
            airHumidity: item.airHumidity,
        }));

    if (loading) {
        return <div className="text-gray-500">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Phân Tích Dữ Liệu
                        </h2>
                        <p className="text-sm text-gray-500">
                            Xu hướng cảm biến trong 24 giờ gần nhất
                        </p>
                    </div>
                </div>

                {/* Thời gian cập nhật mới nhất */}
                {latest && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span>
                            Cập nhật mới nhất:{" "}
                            <b>{formatDateTime(latest.timestamp)}</b>
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Soil Moisture */}
                <Card className="bg-white shadow-lg border-0 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Độ Ẩm Đất
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient
                                    id="colorMoisture"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="soilMoisture"
                                stroke="#10b981"
                                fill="url(#colorMoisture)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                {/* Temperature */}
                <Card className="bg-white shadow-lg border-0 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Nhiệt Độ (°C)
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient
                                    id="colorTemp"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="airTemperature"
                                stroke="#f59e0b"
                                fill="url(#colorTemp)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                {/* Humidity */}
                <Card className="bg-white shadow-lg border-0 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Độ Ẩm Không Khí
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient
                                    id="colorHumidity"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="airHumidity"
                                stroke="#06b6d4"
                                fill="url(#colorHumidity)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
}
