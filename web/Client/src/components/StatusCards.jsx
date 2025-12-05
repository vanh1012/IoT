"use client"

import { Card } from "./ui/card"
import { Zap, Timer, AlertCircle } from "lucide-react"

export function StatusCards({ lightStatus }) {
    const percentage =
        lightStatus.totalDuration > 0 ? Math.round((lightStatus.remainingTime / lightStatus.totalDuration) * 100) : 0

    return (
        <div className="space-y-4">
            {/* Status Card */}
            <Card className="bg-white shadow-lg border-0 p-6">
                <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg ${lightStatus.isOn ? "bg-green-100" : "bg-gray-100"}`}>
                        <Zap className={`w-6 h-6 ${lightStatus.isOn ? "text-green-600" : "text-gray-400"}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-600">Trạng Thái</h3>
                        <p className="text-2xl font-bold text-gray-900">{lightStatus.isOn ? "✓ Hoạt động" : "○ Tắt"}</p>
                    </div>
                </div>
            </Card>

            {/* Duration Card */}
            {lightStatus.isOn && (
                <Card className="bg-white shadow-lg border-0 p-6">
                    <div className="flex items-start gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Timer className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-600">Tiến Độ Chạy</h3>
                            <div className="mt-2">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Power Info Card */}
            <Card className="bg-blue-50 border border-blue-200 p-6">
                <div className="flex items-start gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-blue-900 mb-1">Mẹo Sử Dụng</h3>
                        <p className="text-sm text-blue-700">
                            Nhấp vào một khoảng thời gian để bật đèn tự động tắt sau đó. Nhấp &quot;TẮT ĐÈN NGAY&quot; để tắt ngay lập
                            tức.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
