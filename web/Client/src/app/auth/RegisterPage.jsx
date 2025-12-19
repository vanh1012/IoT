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

import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
	const navigate = useNavigate();
    const { register } = useAuth();
;
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

    const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
        if (!username || !email || !password) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
        }

        await register(username, email, password);

        setSuccess("Đăng ký thành công.");
        setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
        setError(err.message || "Đã xảy ra lỗi");
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
					<CardTitle className="text-2xl text-center">Smart Plant Care</CardTitle>
					<CardDescription className="text-center">Đăng ký</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleRegister} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="username">Tên đăng nhập</Label>
							<Input
								id="username"
								placeholder="username123"
								value={username}
                                name="username"
								onChange={(e) => setUsername(e.target.value)}
								disabled={loading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
                                type="email"
                                name="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={loading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Mật khẩu</Label>
							<div className="relative">
								<Input
                                    id="password"
                                    name="password"
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
									{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
								</button>
							</div>
						</div>

						{error && (
							<div className="p-3 bg-destructive-200/10 text-destructive text-sm rounded-md">{error}</div>
						)}

						{success && (
							<div className="p-3 bg-success-200/10 text-green-500 text-sm rounded-md">{success}</div>
						)}

						<Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-300" disabled={loading}>
							{loading ? "Đang xử lí..." : "Đăng ký"}
						</Button>

						<div className="text-center text-sm text-muted-foreground">
							Đã có tài khoản? <Link to="/login" className="text-primary underline">Đăng nhập</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

