"use client";

import useLogs from "../hooks/useLogs";
import { Card } from "./ui/card";
import {
    Power,
    Settings,
    AlertCircle,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

export function ActivityLogs() {
    const { logs, loading } = useLogs();

    const getIcon = (action) => {
        switch (action) {
            case "ON":
            case "OFF":
                return Power;
            case "SCHEDULE":
                return Settings;
            case "THRESHOLD_HIGH":
                return TrendingUp;
            case "THRESHOLD_LOW":
                return TrendingDown;
            default:
                return AlertCircle;
        }
    };

    return (
        <Card className="bg-white shadow-lg border-0 p-6 md:p-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Nhật Ký Hoạt Động</h2>
                <p className="text-sm text-gray-500">
                    Lịch sử các thao tác hệ thống
                </p>
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
            ) : logs.length === 0 ? (
                <p className="text-center text-gray-500">Chưa có hoạt động nào</p>
            ) : (
                <div className="space-y-3">
                    {logs.map((log) => {
                        const Icon = getIcon(log.action);
                        return (
                            <div
                                key={log.id}
                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex-1">
                                    <p className="font-semibold">
                                        {log.message}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(log.createdAt).toLocaleString("vi-VN")}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
