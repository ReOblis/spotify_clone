import React, { createContext, useEffect, useRef, useState } from "react";
import { getSongs, getVideos } from "../api"; // Add getVideos import

export const PlayerContext = createContext();

const PlayerContextProvider = ({ children }) => {
  const audioRef = useRef();
  const videoRef = useRef(); // Add reference for video element
  const seekBg = useRef();
  const seekBar = useRef();
  const lastPlayedMediaIdRef = useRef(null); // Track last successfully played media ID

  const [songs, setSongs] = useState([]);
  const [videos, setVideos] = useState([]); // Add videos state
  const [mediaType, setMediaType] = useState("audio"); // Track whether we're playing audio or video
  const [track, setTrack] = useState({
    id: 0,
    title: "",
    artist: "",
    cover_image: "",
    audio_file: "",
    video_file: "", // Add video_file property
    duration: "00:00",
    type: "audio", // Default type is audio
  });
  const [playStatus, setPlayStatus] = useState(false);
  const [time, setTime] = useState({
    currentTime: { minute: "00", second: "00" },
    totalTime: { minute: "00", second: "00" },
  });
  const [isLoopActive, setIsLoopActive] = useState(false);
  const [isShuffleActive, setIsShuffleActive] = useState(false);
  const [isLastTrack, setIsLastTrack] = useState(false);
  const [isChangingSong, setIsChangingSong] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false); // Control video player visibility
  const [favoriteSongs, setFavoriteSongs] = useState([]); // For managing favorite songs

  // Fetch songs and videos when app loads
  useEffect(() => {
    const loadMedia = async () => {
      // Load songs
      const songData = await getSongs();
      if (songData && songData.length > 0) {
        const processedSongs = songData.map(song => ({
          ...song,
          audio_file: `http://127.0.0.1:8000/api/music/stream/${song.id}/`,
          type: "audio"
        }));
        setSongs(processedSongs);
        
        // Set track but don't automatically set source
        setTrack(processedSongs[0]); 
        setIsLastTrack(processedSongs.length === 1);
      }
      
      // Load videos
      try {
        const videoData = await getVideos();
        if (videoData && videoData.length > 0) {
          const processedVideos = videoData.map(video => ({
            ...video,
            video_file: `http://127.0.0.1:8000/api/music/videos/${video.id}/stream/`,
            type: "video",
            thumbnail: video.thumbnail || null // Ensure thumbnail exists
          }));
          setVideos(processedVideos);
        }
      } catch (error) {
        console.error("Error loading videos:", error);
      }
    };

    loadMedia();
    
    // Try to load favorites from localStorage
    try {
      const savedFavorites = localStorage.getItem('favoriteSongs');
      if (savedFavorites) {
        setFavoriteSongs(JSON.parse(savedFavorites));
      }
    } catch (e) {
      console.error("Error loading favorites:", e);
    }
  }, []);

  // Save favorites to localStorage when it changes
  useEffect(() => {
    if (favoriteSongs.length > 0) {
      localStorage.setItem('favoriteSongs', JSON.stringify(favoriteSongs));
    }
  }, [favoriteSongs]);

  // Get the current media element (audio or video) based on media type
  const getCurrentMediaElement = () => {
    return mediaType === "audio" ? audioRef.current : videoRef.current;
  };

  const play = () => {
    const mediaElement = getCurrentMediaElement();
    if (!mediaElement) return;
    
    // Set source if it hasn't been set yet
    if (mediaType === "audio" && !mediaElement.src && track?.audio_file) {
      mediaElement.src = track.audio_file;
      lastPlayedMediaIdRef.current = track.id;
    } else if (mediaType === "video" && !mediaElement.src && track?.video_file) {
      mediaElement.src = track.video_file;
      lastPlayedMediaIdRef.current = track.id;
    }
    
    mediaElement.play()
      .then(() => {
        setPlayStatus(true);
      })
      .catch(err => {
        console.error(`Error playing ${mediaType}:`, err);
        setPlayStatus(false);
      });
  };

  const pause = () => {
    const mediaElement = getCurrentMediaElement();
    if (mediaElement) {
      mediaElement.pause();
      setPlayStatus(false);
    }
  };

  const playWithId = async (id, type = "audio", optionalMediaList) => {
    // Don't do anything if already changing media
    if (isChangingSong) return;
    
    // If already playing this media, just continue
    if (id === lastPlayedMediaIdRef.current && getCurrentMediaElement()?.src) {
      play();
      return;
    }
    
    setIsChangingSong(true);
    setMediaType(type);
    
    // Choose the appropriate media list
    const list = optionalMediaList || (type === "audio" ? songs : videos);
    const media = list.find(item => item.id === id);
    
    if (media) {
      const index = list.findIndex(item => item.id === id);
      setIsLastTrack(index === list.length - 1);
      
      // Update track state first (for UI)
      setTrack({
        ...media,
        type: type
      });
      
      // If it's a video, auto-show the video player
      if (type === "video") {
        setShowVideoPlayer(true);
      }
      
      // Pause and clear current media
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
      
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
      
      // Set the new source with slight delay to avoid multiple requests
      setTimeout(() => {
        const mediaElement = type === "audio" ? audioRef.current : videoRef.current;
        
        if (mediaElement) {
          mediaElement.src = type === "audio" ? media.audio_file : media.video_file;
          lastPlayedMediaIdRef.current = media.id;
          
          mediaElement.play()
            .then(() => {
              setPlayStatus(true);
              setIsChangingSong(false);
            })
            .catch(err => {
              console.error(`Error playing ${type} after track change:`, err);
              setPlayStatus(false);
              setIsChangingSong(false);
            });
        } else {
          setIsChangingSong(false);
        }
      }, 100);
    } else {
      setIsChangingSong(false);
    }
  };

  // Play a video with given ID
  const playVideo = (id, optionalVideoList) => {
    return playWithId(id, "video", optionalVideoList);
  };

  const previous = () => {
    if (isChangingSong) return;
    
    const currentList = mediaType === "audio" ? songs : videos;
    const index = currentList.findIndex((item) => item.id === track?.id);
    
    if (index > 0) {
      playWithId(currentList[index - 1].id, mediaType);
    }
  };

  const next = () => {
    if (isChangingSong) return;
    
    const currentList = mediaType === "audio" ? songs : videos;
    const index = currentList.findIndex((item) => item.id === track?.id);
    
    if (index < currentList.length - 1) {
      playWithId(currentList[index + 1].id, mediaType);
    }
  };

  const playRandomTrack = () => {
    if (isChangingSong) return;
    
    const currentList = mediaType === "audio" ? songs : videos;
    if (currentList.length <= 1) return;
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * currentList.length);
    } while (currentList[randomIndex].id === track.id); // Avoid playing the same track
    
    playWithId(currentList[randomIndex].id, mediaType);
  };

  const toggleLoop = () => {
    if (isShuffleActive) {
      setIsShuffleActive(false);
    }
    
    const newLoopState = !isLoopActive;
    setIsLoopActive(newLoopState);
    
    const mediaElement = getCurrentMediaElement();
    if (mediaElement) {
      mediaElement.loop = newLoopState;
    }
  };

  const toggleShuffle = () => {
    if (isLoopActive) {
      setIsLoopActive(false);
      
      const mediaElement = getCurrentMediaElement();
      if (mediaElement) {
        mediaElement.loop = false;
      }
    }
    setIsShuffleActive(!isShuffleActive);
  };

  const seekSong = (e) => {
    const mediaElement = getCurrentMediaElement();
    if (mediaElement?.duration) {
      const percentage = e.nativeEvent.offsetX / seekBg.current.offsetWidth;
      mediaElement.currentTime = percentage * mediaElement.duration;
    }
  };

  // Toggle favorite status for a song
  const toggleFavorite = (songId) => {
    setFavoriteSongs(prevFavorites => {
      if (prevFavorites.includes(songId)) {
        return prevFavorites.filter(id => id !== songId);
      } else {
        return [...prevFavorites, songId];
      }
    });
  };

  // Effect for timeupdate event
  useEffect(() => {
    const handleTimeUpdate = () => {
      const mediaElement = getCurrentMediaElement();
      if (!mediaElement?.duration) return;

      const percentage = (mediaElement.currentTime / mediaElement.duration) * 100;

      if (seekBar.current) {
        seekBar.current.style.width = `${percentage}%`;
      }

      setTime({
        currentTime: {
          minute: String(Math.floor(mediaElement.currentTime / 60)).padStart(2, "0"),
          second: String(Math.floor(mediaElement.currentTime % 60)).padStart(2, "0"),
        },
        totalTime: {
          minute: String(Math.floor(mediaElement.duration / 60)).padStart(2, "0"),
          second: String(Math.floor(mediaElement.duration % 60)).padStart(2, "0"),
        },
      });
    };

    // Add event listeners to both audio and video elements
    const audio = audioRef.current;
    const video = videoRef.current;
    
    if (audio) {
      audio.addEventListener("timeupdate", handleTimeUpdate);
    }
    
    if (video) {
      video.addEventListener("timeupdate", handleTimeUpdate);
    }
    
    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
      }
      
      if (video) {
        video.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [mediaType]); // Re-add event listeners when media type changes

  // Handle media end behavior
  useEffect(() => {
    const handleTrackEnd = () => {
      if (isChangingSong) return;
      
      // If shuffle is active, play a random track
      if (isShuffleActive) {
        playRandomTrack();
        return;
      }
      
      // If it's the last track and not in loop or shuffle mode
      const currentList = mediaType === "audio" ? songs : videos;
      const index = currentList.findIndex((item) => item.id === track?.id);
      
      if (index === currentList.length - 1 && !isLoopActive && !isShuffleActive) {
        setPlayStatus(false); // Reset to play icon
      } else if (!isLoopActive) {
        // Otherwise play next track if not the last one
        next();
      }
    };
    
    // Set up loop property for both media elements
    const audio = audioRef.current;
    const video = videoRef.current;
    
    if (audio) {
      audio.loop = isLoopActive;
      audio.addEventListener('ended', handleTrackEnd);
    }
    
    if (video) {
      video.loop = isLoopActive;
      video.addEventListener('ended', handleTrackEnd);
    }
    
    return () => {
      if (audio) {
        audio.removeEventListener('ended', handleTrackEnd);
      }
      
      if (video) {
        video.removeEventListener('ended', handleTrackEnd);
      }
    };
  }, [isLoopActive, isShuffleActive, track, songs, videos, mediaType, isChangingSong]);

  return (
    <PlayerContext.Provider
      value={{
        audioRef,
        videoRef,
        seekBg,
        seekBar,
        songs,
        setSongs,
        videos,
        setVideos,
        track,
        setTrack,
        playStatus,
        setPlayStatus,
        time,
        setTime,
        play,
        pause,
        playWithId,
        playVideo,
        previous,
        next,
        seekSong,
        isLoopActive,
        isShuffleActive,
        toggleLoop,
        toggleShuffle,
        isLastTrack,
        isChangingSong,
        mediaType,
        showVideoPlayer,
        setShowVideoPlayer,
        favoriteSongs,
        toggleFavorite
      }}
    >
      {children}
      {/* Audio element for audio playback */}
      <audio ref={audioRef} preload="metadata" />
      
<div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 ${showVideoPlayer ? 'block' : 'hidden'}`}>
  <div className="relative bg-black rounded-lg overflow-hidden">
    <video 
      ref={videoRef} 
      preload="metadata" 
      className="w-[800px] h-[450px] object-contain" 
      onClick={() => playStatus ? pause() : play()}
    />
    
    {/* Play/pause overlay */}
    {!playStatus && (
      <div className="absolute inset-0 flex items-center justify-center">
        <button 
          onClick={play}
          className="bg-green-500 rounded-full p-4 opacity-80 hover:opacity-100 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
        </button>
      </div>
    )}
    
    {/* 
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
           */}
    
    {/* Video title */}
    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4">
      <h2 className="text-white text-lg font-bold truncate">{track.title}</h2>
    </div>
  </div>
</div>
    </PlayerContext.Provider>
  );
};
export default PlayerContextProvider;