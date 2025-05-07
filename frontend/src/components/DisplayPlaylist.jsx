import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { getPlaylistById, getPlaylistSongs, removeSongFromPlaylist, removePlaylist } from "../api";
import SongActionMenu from "./SongActionMenu";
import { useNavigate } from "react-router-dom";
const DisplayPlaylist = () => {
  const { id } = useParams();
  const { playWithId, track, setSongs } = useContext(PlayerContext);
  const [playlistData, setPlaylistData] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchPlaylist() {
      try {
        const playlist = await getPlaylistById(id);
        setPlaylistData(playlist);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    }
    
    async function fetchSongs() {
      try {
        const songs = await getPlaylistSongs(id);
        
        // Process the songs to add streaming URL
        const processed = songs.map(song => ({
          ...song,
          audio_file: `http://127.0.0.1:8000/api/music/stream/${song.id}/`,
        }));
        
        setPlaylistSongs(processed);
        setSongs(processed); // Update PlayerContext without auto-playing
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching playlist songs:", error);
        setIsLoading(false);
      }
    }
    
    fetchPlaylist();
    fetchSongs();
  }, [id, setSongs]);
  const navigate = useNavigate();

const handleDeletePlaylist = async () => {
  if (!window.confirm("Are you sure you want to delete this playlist?")) return;

  try {
    await removePlaylist(id);
    navigate("/"); // hoặc "/library" nếu bạn có trang riêng
  } catch (error) {
    console.error("Failed to delete playlist:", error);
    alert("Failed to delete playlist");
  }
};
  const handleRemoveFromPlaylist = async (songId) => {
    try {
      await removeSongFromPlaylist(id, songId);
      
      // Remove song from local state
      setPlaylistSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
      
      // Update the player context songs array as well
      setSongs(prev => prev.filter(song => song.id !== songId));
    } catch (error) {
      console.error("Error removing song from playlist:", error);
    }
  };

  if (isLoading) return (
    <div>
      <Navbar />
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    </div>
  );
  
  if (!playlistData) return (
  <div className="w-full h-full flex-1 px-6 pt-4 rounded bg-[#121212] text-white overflow-y-auto lg:w-[75%] lg:ml-0">
      <Navbar />
      <div className="mt-10 text-center text-white">
        <p className="text-xl">Playlist not found</p>
        <p className="text-[#a7a7a7] mt-2">The playlist you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    </div>
  );
  
   return (
  <div className="w-full h-full flex-1 px-6 pt-4 rounded bg-[#121212] text-white overflow-y-auto lg:w-[75%] lg:ml-0">
    <Navbar /> 
      
      {/* Playlist Info */}
      <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
        <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <div className="flex flex-col">
          <p className="text-[#a7a7a7]">Playlist</p>
          <h2 className="text-5xl font-bold mb-4 md:text-7xl">{playlistData.name}</h2>
          <p className="mt-1 text-[#a7a7a7]">
            <b>Spotify</b> • <b>{playlistSongs.length} songs</b>
          </p>
        </div>
         {/* Delete Button */}
  <button
    onClick={handleDeletePlaylist}
    className="mt-4 w-fit px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-full"
  >
    Delete Playlist
  </button>
      </div>
      
      {/* Table Headers */}
      {playlistSongs.length > 0 ? (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
            <p><b className="mr-4">#</b>Title</p>
            <p>Artist</p>
            <p className="text-center">Duration</p>
            <p className="text-center">+</p>
          </div>
          <hr className="border-[#a7a7a7] border-opacity-30" />
          
          {/* Song List */}
          <div className="song-list">
            {playlistSongs.map((item, index) => (
              <div
                key={item.id}
                className={`grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center ${track.id === item.id ? 'text-green-500' : 'text-[#a7a7a7]'} hover:bg-[#ffffff2b]`}
              >
                <div 
                  className="flex items-center gap-3 overflow-hidden cursor-pointer"
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
                <p className="text-[15px] truncate">{item.artist}</p>
                <p className="text-[15px] text-center self-center">{item.duration}</p>
                <div className="flex justify-center items-center gap-4 self-center">
                  <button 
                    className="text-red-400 hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromPlaylist(item.id);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <SongActionMenu songId={item.id} isInPlaylist={true} playlistId={id} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-10 text-center text-white">
          <p className="text-xl">This playlist is empty</p>
          <p className="text-[#a7a7a7] mt-2">Add songs to this playlist to see them here</p>
        </div>
      )}
    </div>
  );
};

export default DisplayPlaylist;