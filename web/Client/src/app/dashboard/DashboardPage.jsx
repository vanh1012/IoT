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

export default function DashboardPage() {

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
                    <SensorData />
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
                            <LightControlPanel />
                            <PumpControlPanel />
                        </div>

                        <EnvironmentThresholds
                        />
                    </TabsContent>

                    <TabsContent value="schedules">
                        <AutomaticSchedules />
                    </TabsContent>

                    <TabsContent value="analytics">
                        <DataAnalytics />
                    </TabsContent>

                    <TabsContent value="logs">
                        <ActivityLogs />
                    </TabsContent>
                </Tabs>

                <AIChatbox />
            </div>
        </div>
    );
}
