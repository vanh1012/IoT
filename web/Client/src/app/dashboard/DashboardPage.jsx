import React, { useState, useEffect } from "react";

import { LightControlPanel } from "../../components/LightControlPanel";
import { PumpControlPanel } from "../../components/PumpControlPanel";
import { SensorData } from "../../components/SensorData";
import { AutomaticSchedules } from "../../components/AutomaticSchedules";
import { EnvironmentThresholds } from "../../components/EnvironmentThresholds";
import { DataAnalytics } from "../../components/DataAnalytics";
import { ActivityLogs } from "../../components/ActivityLog";
import { Notifications } from "../../components/Notification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tab";
import { AIChatbox } from "../../components/AIChatBot";
import { AIRecommendations } from "../../components/AIRecommendations";

export default function DashboardPage() {
    const [lightStatus, setLightStatus] = useState({
        isOn: false,
        remainingTime: 0,
        totalDuration: 0,
    });

    const [pumpStatus, setPumpStatus] = useState({
        isOn: false,
        remainingTime: 0,
        totalDuration: 0,
    });

    const [sensorData, setSensorData] = useState({
        soilMoisture: 62,
        temperature: 24.5,
        humidity: 68,
        lastUpdate: new Date().toLocaleTimeString("vi-VN"),
    });

    const [thresholds, setThresholds] = useState({
        moistureMin: 40,
        moistureMax: 80,
        temperatureMin: 18,
        temperatureMax: 28,
    });

    const [schedules, setSchedules] = useState([
        {
            id: "1",
            device: "Watering",
            time: "14:00",
            duration: 10,
            enabled: true,
        },
        {
            id: "2",
            device: "Light",
            time: "08:00",
            duration: 120,
            enabled: true,
        },
    ]);

    const [notifications, setNotifications] = useState([
        {
            id: "1",
            type: "warning",
            message: "Độ ẩm đạt ngưỡng - cần tưới nước",
            timestamp: "10:45",
        },
        {
            id: "2",
            type: "success",
            message: "Máy bơm hoạt động bình thường",
            timestamp: "12:15",
        },
    ]);

    const [history, setHistory] = useState([
        {
            id: "1",
            action: "ON",
            device: "Máy bơm",
            duration: 10,
            timestamp: "14:30",
        },
        {
            id: "2",
            action: "THRESHOLD",
            device: "Độ ẩm",
            timestamp: "12:15",
        },
    ]);

    // Timer Light
    useEffect(() => {
        if (!lightStatus.isOn || lightStatus.remainingTime <= 0) return;

        const interval = setInterval(() => {
            setLightStatus((prev) => {
                if (prev.remainingTime <= 1) {
                    return { ...prev, isOn: false, remainingTime: 0 };
                }
                return { ...prev, remainingTime: prev.remainingTime - 1 };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [lightStatus.isOn, lightStatus.remainingTime]);

    // Timer Pump
    useEffect(() => {
        if (!pumpStatus.isOn || pumpStatus.remainingTime <= 0) return;

        const interval = setInterval(() => {
            setPumpStatus((prev) => {
                if (prev.remainingTime <= 1) {
                    return { ...prev, isOn: false, remainingTime: 0 };
                }
                return { ...prev, remainingTime: prev.remainingTime - 1 };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [pumpStatus.isOn, pumpStatus.remainingTime]);

    // Sensor random updates
    useEffect(() => {
        const interval = setInterval(() => {
            setSensorData((prev) => ({
                ...prev,
                soilMoisture: Math.max(20, Math.min(100, prev.soilMoisture + (Math.random() - 0.5) * 10)),
                temperature: Math.max(10, Math.min(35, prev.temperature + (Math.random() - 0.5) * 2)),
                humidity: Math.max(30, Math.min(90, prev.humidity + (Math.random() - 0.5) * 5)),
                lastUpdate: new Date().toLocaleTimeString("vi-VN"),
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleLightToggle = (minutes) => {
        const newStatus = !history[0]?.device.includes("Đèn");

        setHistory((prev) => [
            {
                id: Date.now().toString(),
                action: newStatus ? "ON" : "OFF",
                device: "Đèn",
                ...(minutes && { duration: minutes }),
                timestamp: new Date().toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            },
            ...prev,
        ]);
    };

    const handlePumpToggle = (minutes) => {
        setPumpStatus({
            isOn: !pumpStatus.isOn,
            remainingTime: minutes ? minutes * 60 : 0,
            totalDuration: minutes ? minutes * 60 : 0,
        });

        setHistory((prev) => [
            {
                id: Date.now().toString(),
                action: !pumpStatus.isOn ? "ON" : "OFF",
                device: "Máy bơm",
                ...(minutes && { duration: minutes }),
                timestamp: new Date().toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            },
            ...prev,
        ]);
    };

    const handleThresholdChange = (key, value) => {
        setThresholds((prev) => ({ ...prev, [key]: value }));

        setNotifications((prev) => [
            {
                id: Date.now().toString(),
                type: "info",
                message: `Cập nhật ngưỡng ${key}`,
                timestamp: new Date().toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            },
            ...prev,
        ]);
    };

    const handleAddSchedule = (schedule) => {
        setSchedules((prev) => [...prev, { ...schedule, id: Date.now().toString() }]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-green-900 mb-2">
                        Dashboard Hệ Thống Tưới Cây Thông Minh
                    </h1>
                    <p className="text-gray-600">
                        Giám sát và điều khiển hệ thống tưới cây, đèn, và cảm biến môi trường
                    </p>
                </div>

                <div className="mb-8">
                    <Notifications notifications={notifications} />
                </div>

                <div className="mb-8">
                    <AIRecommendations sensorData={sensorData} thresholds={thresholds} />
                </div>

                <div className="mb-8">
                    <SensorData sensorData={sensorData} />
                </div>

                <Tabs defaultValue="controls" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-8">
                        <TabsTrigger value="controls">Điều Khiển</TabsTrigger>
                        <TabsTrigger value="schedules">Lịch Biểu</TabsTrigger>
                        <TabsTrigger value="analytics">Phân Tích</TabsTrigger>
                        <TabsTrigger value="logs">Nhật Ký</TabsTrigger>
                    </TabsList>

                    <TabsContent value="controls" className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <LightControlPanel onToggle={handleLightToggle} />
                            <PumpControlPanel pumpStatus={pumpStatus} onToggle={handlePumpToggle} />
                        </div>

                        <EnvironmentThresholds
                            thresholds={thresholds}
                            onThresholdChange={handleThresholdChange}
                        />
                    </TabsContent>

                    <TabsContent value="schedules">
                        <AutomaticSchedules schedules={schedules} onAddSchedule={handleAddSchedule} />
                    </TabsContent>

                    <TabsContent value="analytics">
                        <DataAnalytics sensorData={sensorData} />
                    </TabsContent>

                    <TabsContent value="logs">
                        <ActivityLogs history={history} />
                    </TabsContent>
                </Tabs>

                <AIChatbox sensorData={sensorData} thresholds={thresholds} />
            </div>
        </div>
    );
}
