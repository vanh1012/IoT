"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { Button } from "../../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui//lable";

import { Leaf, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!email || !password) throw new Error("Please fill in all fields");
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                throw new Error("Please enter a valid email");

            // Simulated login
            localStorage.setItem(
                "user",
                JSON.stringify({ email, name: email.split("@")[0] })
            );

            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-neutral-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg rounded-xl">
                <CardHeader className="space-y-2">
                    <div className="flex items-center justify-center mb-2">
                        <Leaf className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-center">
                        Smart Plant Care
                    </CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">
                            Don't have an account?
                        </span>{" "}
                        <Link
                            to="/signup"
                            className="text-primary hover:underline font-medium"
                        >
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
