import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";  // Import hàm login từ api.jsx


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Reset lỗi trước khi thực hiện login

    try {
      // Gọi hàm login từ api.jsx
      const userData = await login({ email, password });

      // Nếu đăng nhập thành công, chuyển hướng người dùng đến trang chủ
      navigate("/"); // Hoặc bất kỳ trang nào bạn muốn người dùng đến sau khi đăng nhập
    } catch (error) {
      // Nếu có lỗi, hiển thị thông báo lỗi
      console.error("Lỗi đăng nhập:", error);
      setErrorMsg(error.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md text-center px-8">
        {/* Logo */}
        <div className="mb-8">
          <svg viewBox="0 0 24 24" className="h-12 w-12 mx-auto mb-4">
            <path
              fill="white"
              d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.1-2.58-11.88-1.38-.48.12-.99-.12-1.11-.6-.12-.48.12-.99.6-1.11 4.32-1.32 9.6-.66 13.32 1.62.36.18.54.78.33 1.17zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.78 1.02.48 1.56-.3.42-1.02.66-1.62.36z"
            />
          </svg>
          <h1 className="text-3xl font-bold">Đăng nhập vào Spotify</h1>
        </div>
    {/* Social Login Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          <button className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-full border border-gray-700 hover:bg-gray-800">
            <div className="w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 48 48" className="w-full h-full">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
            </div>
            <span className="font-medium">Tiếp tục bằng Google</span>
          </button>
          
          <button className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-full border border-gray-700 hover:bg-gray-800">
            <div className="w-5 h-5 flex items-center justify-center text-blue-600">
              <svg viewBox="0 0 320 512" className="w-full h-full">
                <path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path>
              </svg>
            </div>
            <span className="font-medium">Tiếp tục bằng Facebook</span>
          </button>
          
          <button className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-full border border-gray-700 hover:bg-gray-800">
            <div className="w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 384 512" className="w-full h-full">
                <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"></path>
              </svg>
            </div>
            <span className="font-medium">Tiếp tục bằng Apple</span>
          </button>
          
          <button className="w-full py-3 px-4 rounded-full border border-gray-700 hover:bg-gray-800 font-medium">
            Tiếp tục bằng số điện thoại
          </button>
        </div>
        {/* Form */}
        <form onSubmit={handleLogin} className="text-left space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-3 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-white"
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              className="w-full p-3 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-white"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div className="text-red-500 text-sm mt-2">{errorMsg}</div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-green-500 rounded-full font-bold hover:scale-105 hover:bg-green-400 transition-all"
          >
            Đăng nhập
          </button>
        </form>

        {/* Link đăng ký */}
        <div className="mt-6 text-sm text-center">
          <span className="text-gray-400">Bạn chưa có tài khoản? </span>
          <Link to="/Register" className="text-white hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
