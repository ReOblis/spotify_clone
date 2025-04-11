import { useContext, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { PlayerContext } from "../context/PlayerContext";
import { getFavoriteSongs, removeFromFavorites } from "../api";
import SongActionMenu from "./SongActionMenu";

const DisplayFavorites = () => {
  const { playWithId, track, setSongs } = useContext(PlayerContext);
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFavoriteSongs() {
      try {
        setIsLoading(true);
        const songs = await getFavoriteSongs();
        
        // Process the songs to add streaming URL
        const processed = songs.map(song => ({
          ...song,
          audio_file: `http://127.0.0.1:8000/api/music/stream/${song.id}/`,
        }));
        
        setFavoriteSongs(processed);
        setSongs(processed); // Update PlayerContext without auto-playing
      } catch (error) {
        console.error("Error fetching favorite songs:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchFavoriteSongs();
  }, [setSongs]);

  const handleRemoveFromFavorites = async (songId) => {
    try {
      await removeFromFavorites(songId);
      
      // Remove song from local state
      setFavoriteSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
      
      // Optional: Update the player context songs array as well
      setSongs(prev => prev.filter(song => song.id !== songId));
    } catch (error) {
      console.error("Error removing song from favorites:", error);
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
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="w-full max-w-screen-xl mx-auto px-4 flex-1 overflow-y-auto pb-24">
        {/* Favorites Info */}
        <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
          <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <p className="text-[#a7a7a7]">Playlist</p>
            <h2 className="text-5xl font-bold mb-4 md:text-7xl">Liked Songs</h2>
            <p className="mt-1 text-[#a7a7a7]">
              <b>Spotify</b> • <b>{favoriteSongs.length} songs</b>
            </p>
          </div>
        </div>
        
        {/* Table Headers */}
        {favoriteSongs.length > 0 ? (
          <>
            <div className="grid grid-cols-[1fr_1fr_100px_auto] mt-10 mb-4 pl-2 text-[#a7a7a7] gap-4">
              <p><b className="mr-4">#</b>Title</p>
              <p className="text-center">Duration</p>
              <p className="text-center">+</p>
            </div>
            <hr className="border-[#a7a7a7] border-opacity-30" />
            
            {/* Song List */}
            <div className="song-list">
              {favoriteSongs.map((item, index) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-[1fr_1fr_100px_auto] gap-4 p-2 items-center ${track.id === item.id ? 'text-green-500' : 'text-[#a7a7a7]'} hover:bg-[#ffffff2b]`}
                >
                  <div 
                    className="flex items-center gap-3 overflow-hidden cursor-pointer"
                    onClick={() => playWithId(item.id)}
                  >
                    <b className="w-4 text-center">{index + 1}</b>
                    <img className="w-10 h-10 rounded object-cover" src={item.cover_image} alt={item.title} />
                    <div className="flex flex-col overflow-hidden">
                      <div className={`${track.id === item.id ? 'text-green-500' : 'text-white'} text-sm truncate max-w-[200px] md:max-w-[300px]`}>
                        {item.title}
                      </div>
                      <div className="text-xs text-[#a7a7a7] truncate">{item.artist}</div>
                    </div>
                  </div>
                  <p className="text-[15px] text-center self-center">{item.duration}</p>
                  <div className="flex justify-center items-center gap-4 self-center">
                    <button 
                      className="text-red-400 hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromFavorites(item.id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <SongActionMenu songId={item.id} isInFavorites={true} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-10 text-center text-white">
            <p className="text-xl">You haven't liked any songs yet</p>
            <p className="text-[#a7a7a7] mt-2">Songs you like will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayFavorites;