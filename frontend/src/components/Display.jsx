import { Route, Routes, useLocation } from "react-router-dom";
import DisplayHome from "./DisplayHome";
import DisplayAlbum from "./DisplayAlbum";
import { useEffect, useRef, useState } from "react";
import { getAlbums } from "../api";

const Display = () => {
  const displayRef = useRef();
  const location = useLocation();
  const isAlbum = location.pathname.includes("album");
  const [albums, setAlbums] = useState([]);
  const [bgColor, setBgColor] = useState("#121212");

  useEffect(() => {
    async function fetchAlbums() {
      const data = await getAlbums();
      setAlbums(data);
    }
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (isAlbum && albums.length > 0) {
      const albumId = parseInt(location.pathname.split("/").pop());
      const album = albums.find((album) => album.id === albumId);
      if (album) {
        setBgColor(album.bgColor || "#121212");
      }
    } else {
      setBgColor("#121212");
    }
    displayRef.current.style.background = `linear-gradient(${bgColor}, #121212)`;
  }, [location, albums]);

  return (
  <div 
  ref={displayRef} 
  className="w-full h-full flex-1 px-6 pt-4 rounded bg-[#121212] text-white overflow-y-auto lg:w-[75%] lg:ml-0"
>
  <Routes>
    <Route path="/" element={<DisplayHome />} />
    <Route path="/album/:id" element={<DisplayAlbum />} />
    
  </Routes>
</div>
  );
};

export default Display;
