import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";

const VideoItem = ({ id, title, thumbnail, duration }) => {
  const { playVideo, track, playStatus, mediaType } = useContext(PlayerContext);

  // Check if this video is currently playing
  const isActive = mediaType === "video" && track.id === id;

  const formatDuration = (durationStr) => {
    if (!durationStr) return "00:00";
    
    // If already in MM:SS format, return as is
    if (/^\d+:\d+$/.test(durationStr)) return durationStr;
    
    // Otherwise assume seconds and convert
    const totalSeconds = parseInt(durationStr, 10);
    if (isNaN(totalSeconds)) return "00:00";
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  return (
    <div 
      className={`flex-shrink-0 w-64 p-4 ${isActive ? 'bg-[#282828]' : 'bg-[#181818]'} hover:bg-[#282828] transition-colors rounded-lg cursor-pointer`}
      onClick={() => playVideo(id)}
    >
      <div className="relative w-full aspect-video rounded-md overflow-hidden mb-4">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#333] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 rounded-md">
          <span className="text-xs text-white">{formatDuration(duration)}</span>
        </div>
        
        {/* Play/Active state overlay */}
        <div className={`absolute inset-0 flex items-center justify-center ${isActive && playStatus ? 'bg-black bg-opacity-60' : 'opacity-0 hover:opacity-100'} transition-opacity`}>
          <div className={`${isActive && playStatus ? 'bg-green-600' : 'bg-green-500'} rounded-full p-3`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isActive && playStatus ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              )}
            </svg>
          </div>
        </div>
        
        {/* Now playing indicator */}
        {isActive && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
            {playStatus ? "Đang phát" : "Tạm dừng"}
          </div>
        )}
      </div>
      <h3 className={`font-bold truncate ${isActive ? 'text-green-500' : 'text-white'}`}>{title}</h3>
    </div>
  );
};

export default VideoItem;