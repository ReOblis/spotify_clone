import { useState } from "react";
import { register } from "../api"; // Import hàm từ file api.jsx
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (email !== confirmEmail) {
      setError("Email không khớp!");
      return;
    }

    const userData = { username, email, password };

    try {
      await register(userData);
      setError("");
      navigate("/Login"); 
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white px-4">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-4xl font-bold text-center mb-6">Đăng ký tài khoản</h1>

        <form
          onSubmit={handleRegister}
          className="bg-[#1a1a1a] rounded-2xl p-6 shadow-md space-y-4"
        >
          <div>
            <label className="block text-sm mb-1">Tên người dùng</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#333] text-white focus:outline-none"
              placeholder="username"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#333] text-white focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Xác nhận Email</label>
            <input
              type="email"
              required
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#333] text-white focus:outline-none"
              placeholder="Nhập lại email"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#333] text-white focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full"
          >
            Đăng ký
          </button>
        </form>

        <p className="text-center text-sm text-[#b3b3b3]">
          Đã có tài khoản?{" "}
          <a href="/Login" className="text-green-400 hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
