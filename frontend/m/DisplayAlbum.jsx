import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { getAlbumById, getSongsByAlbum } from "../api";

const DisplayAlbum = () => {
  const { id } = useParams();
  const { playWithId } = useContext(PlayerContext);
  const [albumData, setAlbumData] = useState(null);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    // Fetch album data based on album ID
    async function fetchAlbum() {
      const album = await getAlbumById(id);
      setAlbumData(album);
    }

    // Fetch songs based on album ID
    async function fetchSongs() {
      const data = await getSongsByAlbum(id);
      setSongs(data);
    }

    fetchAlbum();
    fetchSongs(); // Fetch songs every time the album ID changes
  }, [id]);  // The useEffect will run every time the `id` changes

  if (!albumData) return <p>Loading...</p>;

  return (
    <div>
      <Navbar />
      <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
        {/* Display album cover */}
        <img className="w-48 rounded" src={albumData.cover_image} alt="Album Cover" />
        <div className="flex flex-col">
          <p>Playlist</p>
          <h2 className="text-5xl font-bold mb-4 md:text-7xl">{albumData.name}</h2>
          <h4>{albumData.desc}</h4>
          <p className="mt-1">
            <b>Spotify</b> • <b>{albumData.saves} saves</b> • <b>{songs.length} songs</b>
          </p>
        </div>
      </div>

      {/* Display songs */}
      <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
  <p><b className="mr-4">#</b>Title</p>
  <p>Album</p>
  <p className="text-center">Duration</p>
  <p className="text-center">+</p> {/* Cột thêm dấu + */}
</div>
<hr />
      {songs.map((item, index) => (
  <div
    key={item.id}
    onClick={() => playWithId(item.id)}
    className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
  >
    {/* Cột 1: số thứ tự + ảnh + title/artist */}
    <div className="flex items-center gap-3 overflow-hidden">
      <b className="w-4 text-center">{index + 1}</b>
      <img className="w-10 h-10 rounded object-cover" src={item.cover_image} alt={item.title} />
      <div className="flex flex-col overflow-hidden">
        <div className="text-white text-sm truncate max-w-[150px]">{item.title}</div>
        <div className="text-xs text-[#a7a7a7] truncate">{item.artist}</div>
      </div>
    </div>

    {/* Cột 2: tên album */}
    <p className="text-[15px] truncate">{albumData.name}</p>

    {/* Cột 3: thời lượng */}
    <p className="text-[15px] text-center">{item.duration}</p>

    {/* Cột 4: dấu + */}
    <p className="text-green-400 text-lg font-bold text-center hover:text-green-300">+</p>
  </div>
))}

    </div>
  );
};

export default DisplayAlbum;
