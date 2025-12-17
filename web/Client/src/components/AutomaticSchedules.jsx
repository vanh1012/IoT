"use client"

import { useState } from "react"
import { Card } from "./ui/card"
import { Calendar, Plus, Trash2 } from "lucide-react"
import useSchedule from "../hooks/useSchedule"
import { useAuth } from "../context/AuthContext"
import { useEffect } from "react"


export function AutomaticSchedules({ }) {
    const { user } = useAuth();
    const { schedules, createSchedule, getSchedules, deleteSchedule } = useSchedule(user);
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        device: "pump",
        time: "12:00",
        duration: 10,
    })
    const handleAddSchedule = () => {
        console.log(formData);
        createSchedule({ action: formData.device, time: formData.time, duration: formData.duration })
        setFormData({ device: "pump", time: "12:00", duration: 10 })
        setShowForm(false)
    }
    useEffect(() => { console.log(schedules) }, [schedules]);
    return (
        <Card className="bg-white shadow-lg border-0 p-6 md:p-8">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Lịch Biểu Tự Động</h2>
                            <p className="text-sm text-gray-500">Đặt thời gian tự động cho các thiết bị</p>
                        </div>
                    </div>
                </div>
            </div>
            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Thêm Lịch Biểu
                </button>
            )}
            {showForm && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Thiết Bị</label>
                            <select
                                value={formData.device}
                                onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="pump">Máy Bơm</option>
                                <option value="light">Đèn</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Thời Gian</label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Thời Lượng (phút)</label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddSchedule}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Thêm
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Schedule List */}
            <div className="space-y-3 mb-6">
                {schedules.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>Chưa có lịch biểu nào</p>
                    </div>
                ) : (
                    schedules.map((schedule) => (
                        <div
                            key={schedule._id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{schedule.action == "pump" ? "Máy bơm" : "Đèn"}</p>
                                    <p className="text-sm text-gray-500">
                                        {schedule.time} • {schedule.duration} phút
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteSchedule({ id: schedule._id })}
                                className="p-2 cursor-pointer text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>



        </Card>
    )
}
