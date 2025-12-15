"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Lightbulb, Power, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LightControlPanel() {
    const { user, controlDevice } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const isOn = user.light;

    const handleToggle = async () => {
        if (loading) return;

        try {
            setLoading(true);
            await controlDevice({
                type: "light",
                state: !isOn,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white shadow-lg border-0 p-6 md:p-8">
            {/* HEADER */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                        <Lightbulb className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Ánh Sáng</h2>
                        <p className="text-sm text-gray-500">Điều khiển bật / tắt đèn</p>
                    </div>
                </div>

                {/* STATUS */}
                <div
                    className={`text-right p-4 rounded-lg border-2 ${isOn
                            ? "bg-green-100 border-green-500"
                            : "bg-gray-100 border-gray-300"
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

            {/* TOGGLE BUTTON */}
            <button
                onClick={handleToggle}
                disabled={loading}
                className={`w-full py-6 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all
          ${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : isOn
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                    }
          text-white shadow-lg`}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Đang xử lý...
                    </>
                ) : (
                    <>
                        <Power className="w-6 h-6" />
                        {isOn ? "TẮT ÁNH SÁNG" : "BẬT ÁNH SÁNG"}
                    </>
                )}
            </button>
        </Card>
    );
}
