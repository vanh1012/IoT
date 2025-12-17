"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MessageCircle, Send, X, Minimize2, Maximize2, Loader } from "lucide-react";

export function AIChatbox({ sensorData, thresholds }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: "1",
            text: "Xin chào! Tôi là trợ lý AI của hệ thống tưới cây. Tôi có thể giúp bạn với khuyến nghị về tưới nước, ánh sáng và chăm sóc cây. Hỏi gì đó nhé!",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            text: input,
            sender: "user",
            timestamp: new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("/api/project-bot/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: input,
                    sensorData: sensorData,
                    thresholds: thresholds,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response from chatbot");
            }

            const data = await response.json();

            const botMessage = {
                id: (Date.now() + 1).toString(),
                text: data.reply || "Xin lỗi, tôi không thể xử lý câu hỏi của bạn lúc này.",
                sender: "bot",
                timestamp: new Date().toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
                sender: "bot",
                timestamp: new Date().toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {isOpen && (
                <div
                    className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 ${isMinimized ? "h-16" : "h-[600px]"
                        }`}
                >
                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageCircle className="w-5 h-5" />
                            <div>
                                <h3 className="font-semibold">Trợ Lý AI</h3>
                                <p className="text-xs text-blue-100">Hệ thống tưới cây</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-1 hover:bg-blue-600 rounded transition-colors"
                            >
                                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-blue-600 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* BODY */}
                    {!isMinimized && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === "user"
                                                    ? "bg-blue-500 text-white rounded-br-none"
                                                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                                                }`}
                                        >
                                            <p className="text-sm">{msg.text}</p>
                                            <p
                                                className={`text-xs mt-1 ${msg.sender === "user" ? "text-blue-100" : "text-gray-600"
                                                    }`}
                                            >
                                                {msg.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-200 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                                            <Loader className="w-4 h-4 animate-spin" />
                                            <p className="text-sm">Đang suy nghĩ...</p>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* INPUT */}
                            <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Nhập tin nhắn..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={loading}
                                        className="flex-1"
                                    />

                                    <Button
                                        type="submit"
                                        disabled={loading || !input.trim()}
                                        className="bg-blue-500 hover:bg-blue-600"
                                        size="icon"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
