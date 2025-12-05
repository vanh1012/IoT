"use client"

import { Card } from "./ui/card"
import { Power, Trash2 } from "lucide-react"


export function ControlHistory({ history }) {
    return (
        <Card className="bg-white shadow-lg border-0 p-6 md:p-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Lịch Sử Điều Khiển</h2>
                <p className="text-gray-600 text-sm">Các lần bật/tắt đèn gần đây</p>
            </div>

            <div className="space-y-3">
                {history.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Chưa có hoạt động nào</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`p-2 rounded-lg ${item.action === "ON" ? "bg-green-100" : "bg-red-100"}`}>
                                    <Power className={`w-5 h-5 ${item.action === "ON" ? "text-green-600" : "text-red-600"}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">{item.action === "ON" ? "Bật Đèn" : "Tắt Đèn"}</span>
                                        {item.duration && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{item.duration}m</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{item.timestamp}</p>
                                </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </Card>
    )
}
