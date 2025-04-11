import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { getAlbumById, getSongsByAlbum, getFavoriteSongs } from "../api";
import SongActionMenu from "./SongActionMenu";

const DisplayAlbum = () => {
  const { id } = useParams();
  const { playWithId, track, setSongs } = useContext(PlayerContext);
  const [albumData, setAlbumData] = useState(null);
  const [localSongs, setLocalSongs] = useState([]); // local display only
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  
  useEffect(() => {

    async function fetchAlbum() {
      const album = await getAlbumById(id);
      setAlbumData(album);
    }
    async function fetchSongs() {
      const data = await getSongsByAlbum(id);
      const processed = data.map(song => ({
        ...song,
        audio_file: `http://127.0.0.1:8000/api/music/stream/${song.id}/`,
      }));
      setLocalSongs(processed);   // for display
      setSongs(processed);        // update PlayerContext without auto-playing
    }
    
    async function fetchFavoriteSongs() {
      try {
        // Use the getFavoriteSongs function from api.jsx
        const favoriteSongsData = await getFavoriteSongs();
        // Extract IDs for easier checking
        const favoriteIds = favoriteSongsData.map(song => song.id);
        setFavoriteSongs(favoriteIds);
      } catch (error) {
        console.error("Error fetching favorite songs:", error);
      }
    }
    
    fetchAlbum();
    fetchSongs();
    fetchFavoriteSongs();
  }, [id, setSongs]);
  
  if (!albumData) return <p>Loading...</p>;
  
  return (
    <div className="w-full max-w-screen-xl mx-auto px-4">

      <Navbar />
      {/* Album Info */}
      <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
        <img className="w-48 rounded" src={albumData.cover_image} alt="Album Cover" />
        <div className="flex flex-col">
          <p>Playlist</p>
          <h2 className="text-5xl font-bold mb-4 md:text-7xl">{albumData.name}</h2>
          <h4>{albumData.desc}</h4>
          <p className="mt-1">
            <b>Spotify</b> • <b>{albumData.saves} saves</b> • <b>{localSongs.length} songs</b>
          </p>
        </div>
      </div>
      {/* Table Headers */}
      <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
        <p><b className="mr-4">#</b>Title</p>
        <p>Album</p>
        <p className="text-center">Duration</p>
        <p className="text-center">+</p>
      </div>
      <hr />
      {/* Song List */}
      {localSongs.map((item, index) => (
        <div
          key={item.id}
          className={`grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center ${track.id === item.id ? 'text-green-500' : 'text-[#a7a7a7]'} hover:bg-[#ffffff2b] cursor-pointer`}
        >
          <div 
            className="flex items-center gap-3 overflow-hidden"
            onClick={() => playWithId(item.id)}
          >
            <b className="w-4 text-center">{index + 1}</b>
            <img className="w-10 h-10 rounded object-cover" src={item.cover_image} alt={item.title} />
            <div className="flex flex-col overflow-hidden">
              <div className={`${track.id === item.id ? 'text-green-500' : 'text-white'} text-sm truncate max-w-[150px]`}>
                {item.title}
              </div>
              <div className="text-xs text-[#a7a7a7] truncate">{item.artist}</div>
            </div>
          </div>
          <p className="text-[15px] truncate">{albumData.name}</p>
          <p className="text-[15px] text-center">{item.duration}</p>
          <div className="text-center">
            <SongActionMenu 
              songId={item.id} 
              isInFavorites={favoriteSongs.includes(item.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisplayAlbum;