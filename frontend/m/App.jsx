import { Routes, Route, useLocation } from "react-router-dom";
import Display from "./components/Display";
import Player from "./components/Player";
import Sidebar from "./components/Sidebar";
import Register from "./components/Register";
import Login from "./components/Login";
import { useContext } from "react";
import { PlayerContext } from "./context/PlayerContext";

const App = () => {
  const { audioRef, track } = useContext(PlayerContext);
  const location = useLocation();
  
  // Check if current route is login or register
  const isAuthPage = location.pathname === "/Login" || location.pathname === "/Register";
  
  return (
    <div className="h-screen bg-black">
      {isAuthPage ? (
        // For login and register pages, only render the Routes without sidebar and player
        <Routes>
          <Route path="/Register" element={<Register />} />
          <Route path="/Login" element={<Login />} />
        </Routes>
      ) : (
        // For all other pages, render the full layout
        <>
          <div className="h-[90%] flex">
            <Sidebar />
            <Routes>
              <Route path="/*" element={<Display />} />
              {/* Add other main app routes here */}
            </Routes>
          </div>
          <Player />
        </>
      )}
      <audio ref={audioRef} src={track.file} preload="auto"></audio>
    </div>
  );
};

export default App;