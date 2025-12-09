"use client"

import { useState } from "react"
import { Card } from "./ui/card"
import { Droplet, Power } from "lucide-react"

export function PumpControlPanel({ onToggle }) {
    const [isOn, setIsOn] = useState(false)

    const handleToggle = () => {
        const newState = !isOn
        setIsOn(newState)
        onToggle(newState) // báo trạng thái true/false cho parent
    }

    return (
        <Card className="bg-white shadow-lg border-0 p-6 md:p-8">
            {/* HEADER */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Droplet className="w-6 h-6 text-blue-600" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Máy Bơm Nước</h2>
                            <p className="text-sm text-gray-500">Điều khiển bật/tắt máy bơm</p>
                        </div>
                    </div>

                    <div
                        className={`text-right p-4 rounded-lg ${isOn ? "bg-green-100 border-2 border-green-500" : "bg-gray-100 border-2 border-gray-300"
                            }`}
                    >
                        <div
                            className={`text-3xl font-bold ${isOn ? "text-green-600" : "text-gray-400"
                                }`}
                        >
                            {isOn ? "BẬT" : "TẮT"}
                        </div>
                    </div>
                </div>
            </div>

            {/* NÚT BẬT/TẮT */}
            <button
                onClick={handleToggle}
                className={`w-full py-6 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all ${isOn
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                        : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                    }`}
            >
                <Power className="w-6 h-6" />
                {isOn ? "TẮT MÁY BƠM" : "BẬT MÁY BƠM"}
            </button>
        </Card>
    )
}
