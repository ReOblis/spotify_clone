import { useContext } from "react";
import { assets } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContext";
import SongActionMenu from "./SongActionMenu"; // Import component SongActionMenu

const Player = () => {
  const { 
    seekBar, 
    seekBg, 
    playStatus, 
    play, 
    pause, 
    track, 
    time, 
    previous, 
    next, 
    seekSong,
    isLoopActive,
    isShuffleActive,
    toggleLoop,
    toggleShuffle,
    isChangingSong,
    favoriteSongs = [] // Mặc định là mảng rỗng nếu không được cung cấp từ context
  } = useContext(PlayerContext);
  
  // Format time with leading zeros
  const formatTime = (timeObj) => {
    return `${timeObj.minute}:${timeObj.second < 10 ? '0' + timeObj.second : timeObj.second}`;
  };
  
  return (
    <div className="h-[10%] bg-black flex justify-between items-center text-white px-4">
      {/* Song info section - fixed width */}
      <div className="hidden lg:flex items-center gap-4 w-[250px] min-w-[250px]">
        <img className="w-12 h-12 object-cover flex-shrink-0" src={track.cover_image} alt="song_cover" />
        <div className="overflow-hidden">
          <p className="truncate text-sm font-medium">{track.title}</p>
          <p className="truncate text-xs text-gray-400">{track.artist}</p>
          {isChangingSong && (
            <p className="text-xs text-green-500">Loading...</p>
          )}
        </div>
      </div>
      
      {/* Player controls section */}
      <div className="flex flex-col items-center gap-1 flex-1">
        <div className="flex gap-4 justify-center w-full">
          <img 
            className={`w-4 cursor-pointer ${isShuffleActive ? 'opacity-100' : 'opacity-50'}`} 
            src={assets.shuffle_icon} 
            alt="shuffle" 
            onClick={toggleShuffle}
          />
          <img 
            onClick={previous} 
            className={`w-4 cursor-pointer ${isChangingSong ? 'opacity-50' : 'opacity-100'}`} 
            src={assets.prev_icon} 
            alt="previous" 
          />
          {playStatus ? (
            <img 
              onClick={pause} 
              className={`w-4 cursor-pointer ${isChangingSong ? 'opacity-50' : 'opacity-100'}`} 
              src={assets.pause_icon} 
              alt="pause" 
            />
          ) : (
            <img 
              onClick={play} 
              className={`w-4 cursor-pointer ${isChangingSong ? 'opacity-50' : 'opacity-100'}`} 
              src={assets.play_icon} 
              alt="play" 
            />
          )}
          <img 
            onClick={next} 
            className={`w-4 cursor-pointer ${isChangingSong ? 'opacity-50' : 'opacity-100'}`} 
            src={assets.next_icon} 
            alt="next" 
          />
          <img 
            className={`w-4 cursor-pointer ${isLoopActive ? 'opacity-100' : 'opacity-50'}`} 
            src={assets.loop_icon} 
            alt="loop" 
            onClick={toggleLoop}
          />
        </div>
        
        {/* Seek bar section - fixed layout */}
        <div className="flex items-center w-full max-w-[500px] mx-auto">
          <p className="text-xs w-12 text-right">{formatTime(time.currentTime)}</p>
          <div 
            ref={seekBg} 
            onClick={seekSong} 
            className="flex-1 mx-2 bg-gray-700 rounded-full h-1 cursor-pointer"
          >
            <hr ref={seekBar} className="h-1 border-none w-0 bg-green-500 rounded-full" />
          </div>
          <p className="text-xs w-12">{formatTime(time.totalTime)}</p>
        </div>
      </div>
      
      {/* Right side with action menu */}
      <div className="hidden lg:flex w-[250px] justify-end">
        <div className="text-center">
          {track.id && (
            <SongActionMenu 
              songId={track.id} 
              isInFavorites={favoriteSongs.includes(track.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Player;