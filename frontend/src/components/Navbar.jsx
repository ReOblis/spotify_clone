import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Import js-cookie để kiểm tra cookie
import { assets } from "../assets/assets";

const Navbar = () => {
  const [hasToken, setHasToken] = useState(false); // State để lưu thông tin có token hay không
  const [showPopup, setShowPopup] = useState(false); // State để kiểm soát hiển thị popup
  const [username, setUsername] = useState("User"); // State để lưu tên người dùng
  const [showConfirm, setShowConfirm] = useState(false); // State để hiển thị xác nhận đăng xuất
  const [showSuccess, setShowSuccess] = useState(false); // State để hiển thị thông báo thành công
  const popupRef = useRef(null); // Tham chiếu đến popup để xử lý click outside
  const confirmRef = useRef(null); // Tham chiếu đến hộp xác nhận

  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra nếu có token trong cookie
    const token = Cookies.get("token");
    if (token) {
      setHasToken(true); // Nếu có token thì hiển thị phần tử "B"
      
      // Lấy tên người dùng từ cookie hoặc localStorage nếu có
      const savedUsername = localStorage.getItem("username") || Cookies.get("username");
      if (savedUsername) {
        setUsername(savedUsername);
      }
    } else {
      setHasToken(false); // Nếu không có token thì ẩn phần tử "B"
    }
  }, []); // Chạy once khi component mount

  useEffect(() => {
    // Xử lý click outside để đóng popup
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target) && 
          confirmRef.current && !confirmRef.current.contains(event.target)) {
        setShowPopup(false);
        setShowConfirm(false);
      }
    }
    
    // Thêm event listener
    document.addEventListener("mousedown", handleClickOutside);
    
    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef, confirmRef]);

  // Hiển thị hộp xác nhận đăng xuất
  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  // Xử lý đăng xuất khi người dùng xác nhận
  const handleLogout = () => {
    // Hiển thị thông báo thành công
    setShowSuccess(true);
    
    // Đóng hộp xác nhận
    setShowConfirm(false);
    
    setTimeout(() => {
      // Xóa token khỏi cookie
      Cookies.remove("token");
      Cookies.remove("username");
      localStorage.removeItem("username");
      setHasToken(false);
      setShowPopup(false);
      setShowSuccess(false);
      window.location.reload(); 
    }, 1000);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
    if (showConfirm) {
      setShowConfirm(false);
    }
  };

  // Hủy đăng xuất
  const cancelLogout = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <div className="w-full flex justify-between items-center font-semibold">
        <div className="flex items-center gap-2">
          <img
            className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
            src={assets.arrow_left}
            alt=""
            onClick={() => navigate(-1)} // Quay lại trang trước
          />
          <img
            className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
            src={assets.arrow_right}
            alt=""
            onClick={() => navigate(+1)} // Tiến đến trang tiếp theo
          />
        </div>
        <div className="flex items-center gap-4 relative">
          {/* Ẩn Login và Register nếu có token */}
          {!hasToken && (
            <>
              <a
                href="/Login"
                className="bg-white text-black text-[15px] px-4 py-1 rounded-2xl hidden md:block cursor-pointer"
              >
                Login
              </a>
              <a
                href="/Register"
                className="bg-black py-1 px-3 rounded-2xl text-[15px] cursor-pointer"
              >
                Register
              </a>
            </>
          )}
          
          {/* Hiển thị phần tử B nếu có token */}
          {hasToken && (
            <div className="relative">
              <p 
                className="bg-orange-500 text-black w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                onClick={togglePopup}
              >
                V
              </p>
              
              {/* Popup Menu */}
              {showPopup && (
                <div 
                  ref={popupRef}
                  className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] rounded-md shadow-lg py-1 z-10"
                  style={{ top: "100%" }}
                >
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm leading-5 text-white">Đăng nhập với</p>
                    <p className="text-sm font-medium leading-5 text-white truncate">{username}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogoutClick}
                      className="flex w-full px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
              
              {/* Hộp xác nhận đăng xuất */}
              {showConfirm && (
                <div 
                  ref={confirmRef}
                  className="fixed inset-0 flex items-center justify-center z-50"
                >
                  <div className="absolute inset-0 bg-black opacity-50"></div>
                  <div className="bg-[#2a2a2a] rounded-lg p-6 max-w-sm mx-auto relative z-10">
                    <h3 className="text-lg font-medium text-white mb-4">Xác nhận đăng xuất</h3>
                    <p className="text-sm text-gray-300 mb-6">Bạn có chắc chắn muốn đăng xuất không?</p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={cancelLogout}
                        className="px-4 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-500"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Thông báo đăng xuất thành công */}
              {showSuccess && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg z-50">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p>Đăng xuất thành công!</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <p className="bg-white text-black px-4 py-1 rounded-2xl">All</p>
        <p className="bg-[#242424] cursor-pointer px-4 py-1 rounded-2xl">Music</p>
        <p className="bg-[#242424] cursor-pointer px-4 py-1 rounded-2xl">Podcasts</p>
      </div>
    </>
  );
};

export default Navbar;