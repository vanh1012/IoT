"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Droplet, Power, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function PumpControlPanel() {
    const { user, controlDevice } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const isOn = user.pump;

    const handleToggle = async () => {
        if (loading) return;

        try {
            setLoading(true);
            await controlDevice({
                type: "pump",
                state: !isOn,
            });
        } catch (err) {
            console.error("Pump toggle failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white shadow-lg border-0 p-6 md:p-8">
            {/* HEADER */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Droplet className="w-6 h-6 text-blue-600" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Máy Bơm Nước
                        </h2>
                        <p className="text-sm text-gray-500">
                            Điều khiển bật / tắt máy bơm
                        </p>
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
                            : "bg-blue-500 hover:bg-blue-600"
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
                        {isOn ? "TẮT MÁY BƠM" : "BẬT MÁY BƠM"}
                    </>
                )}
            </button>
        </Card>
    );
}
