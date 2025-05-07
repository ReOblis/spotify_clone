import { useContext } from "react";
import { assets } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContext";
import SongActionMenu from "./SongActionMenu";

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
    mediaType,
    setShowVideoPlayer,
    showVideoPlayer,
    favoriteSongs = [] // Default to empty array if not provided from context
  } = useContext(PlayerContext);
  
  // Format time with leading zeros
  const formatTime = (timeObj) => {
    return `${timeObj.minute}:${timeObj.second < 10 ? '0' + timeObj.second : timeObj.second}`;
  };
  
  return (
    <div className={`h-[10%] bg-black flex justify-between items-center text-white px-4 ${showVideoPlayer ? 'z-[60]' : ''}`}>
      {/* Song/Video info section - fixed width */}
      <div className="hidden lg:flex items-center gap-4 w-[250px] min-w-[250px]">
        <img 
          className="w-12 h-12 object-cover flex-shrink-0" 
          src={track.cover_image || track.thumbnail || assets.default_cover} 
          alt="media_cover" 
        />
        <div className="overflow-hidden">
          <p className="truncate text-sm font-medium">{track.title}</p>
          <p className="truncate text-xs text-gray-400">
            {mediaType === "video" ? "Video" : track.artist}
          </p>
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
      
     <div className="hidden lg:flex w-[250px] justify-end">
  <div className="flex items-center gap-4">
    {/* Video button - show for all content */}
    <button 
      onClick={() => setShowVideoPlayer(!showVideoPlayer)}
      className="text-white hover:text-green-500 transition-colors"
      disabled={mediaType !== "video"}
    >
      {showVideoPlayer ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
          
          {/* Full screen button - only when video is showing */}
          {mediaType === "video" && showVideoPlayer && (
            <button 
              onClick={() => {
                const videoElement = document.querySelector('video');
                if (videoElement) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    videoElement.requestFullscreen();
                  }
                }
              }}
              className="text-white hover:text-green-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
          )}
          
          {/* Action menu for audio */}
          {mediaType === "audio" && track.id && (
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