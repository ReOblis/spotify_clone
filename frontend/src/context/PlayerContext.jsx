import React, { createContext, useEffect, useRef, useState } from "react";
import { getSongs } from "../api"; // hoặc getSongsByAlbum nếu cần fetch theo album

export const PlayerContext = createContext();

const PlayerContextProvider = ({ children }) => {
  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();
  const lastPlayedTrackIdRef = useRef(null); // Track last successfully played track ID

  const [songs, setSongs] = useState([]);
  const [track, setTrack] = useState({
    id: 0,
    title: "",
    artist: "",
    cover_image: "",
    audio_file: "",
    duration: "00:00",
  });
  const [playStatus, setPlayStatus] = useState(false);
  const [time, setTime] = useState({
    currentTime: { minute: "00", second: "00" },
    totalTime: { minute: "00", second: "00" },
  });
  const [isLoopActive, setIsLoopActive] = useState(false);
  const [isShuffleActive, setIsShuffleActive] = useState(false);
  const [isLastTrack, setIsLastTrack] = useState(false);
  const [isChangingSong, setIsChangingSong] = useState(false); // State to track song change process

  // Fetch toàn bộ danh sách bài hát khi app load
  useEffect(() => {
    const loadSongs = async () => {
      const songData = await getSongs();
      if (songData && songData.length > 0) {
        const processedSongs = songData.map(song => ({
          ...song,
          audio_file: `http://127.0.0.1:8000/api/music/stream/${song.id}/`
        }));
        setSongs(processedSongs);
        
        // Set track but don't automatically set source
        setTrack(processedSongs[0]); 
        setIsLastTrack(processedSongs.length === 1);
      }
    };

    loadSongs();
  }, []);

  async function fetchSongs(id) {
    const data = await getSongsByAlbum(id);
    const processedSongs = data.map(song => ({
      ...song,
      audio_file: `http://127.0.0.1:8000/api/music/stream/${song.id}/`
    }));
    setSongs(processedSongs); // 🎯 cập nhật danh sách vào context
    setTrack(processedSongs[0]); // nếu muốn phát tự động bài đầu tiên
    setIsLastTrack(processedSongs.length === 1);
  }

  const play = () => {
    if (!audioRef.current) return;
    
    // Only set source if it hasn't been set yet
    if (!audioRef.current.src && track?.audio_file) {
      audioRef.current.src = track.audio_file;
      lastPlayedTrackIdRef.current = track.id;
    }
    
    audioRef.current.play()
      .then(() => {
        setPlayStatus(true);
      })
      .catch(err => {
        console.error("Error playing audio:", err);
        setPlayStatus(false);
      });
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayStatus(false);
    }
  };

  const playWithId = async (id, optionalSongList) => {
    // Don't do anything if already changing song
    if (isChangingSong) return;
    
    // If already playing this song, just continue
    if (id === lastPlayedTrackIdRef.current && audioRef.current?.src) {
      play();
      return;
    }
    
    setIsChangingSong(true);
    
    const list = optionalSongList || songs;
    const song = list.find(s => s.id === id);
    
    if (song) {
      const index = list.findIndex(s => s.id === id);
      setIsLastTrack(index === list.length - 1);
      
      // Update track state first (for UI)
      setTrack(song);
      
      // Pause and clear current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
      
      // Set the new source with slight delay to avoid multiple requests
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = song.audio_file;
          lastPlayedTrackIdRef.current = song.id;
          
          audioRef.current.play()
            .then(() => {
              setPlayStatus(true);
              setIsChangingSong(false);
            })
            .catch(err => {
              console.error("Error playing after track change:", err);
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

  const previous = () => {
    if (isChangingSong) return;
    
    const index = songs.findIndex((s) => s.id === track?.id);
    if (index > 0) {
      playWithId(songs[index - 1].id);
    }
  };

  const next = () => {
    if (isChangingSong) return;
    
    const index = songs.findIndex((s) => s.id === track?.id);
    if (index < songs.length - 1) {
      playWithId(songs[index + 1].id);
    }
  };

  const playRandomTrack = () => {
    if (isChangingSong || songs.length <= 1) return;
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * songs.length);
    } while (songs[randomIndex].id === track.id); // Avoid playing the same track
    
    playWithId(songs[randomIndex].id);
  };

  const toggleLoop = () => {
    if (isShuffleActive) {
      setIsShuffleActive(false);
    }
    
    const newLoopState = !isLoopActive;
    setIsLoopActive(newLoopState);
    
    if (audioRef.current) {
      audioRef.current.loop = newLoopState;
    }
  };

  const toggleShuffle = () => {
    if (isLoopActive) {
      setIsLoopActive(false);
      if (audioRef.current) {
        audioRef.current.loop = false;
      }
    }
    setIsShuffleActive(!isShuffleActive);
  };

  const seekSong = (e) => {
    if (audioRef.current?.duration) {
      const percentage = e.nativeEvent.offsetX / seekBg.current.offsetWidth;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
    }
  };

  // Effect for timeupdate event
  useEffect(() => {
    const handleTimeUpdate = () => {
      if (!audioRef.current?.duration) return;

      const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;

      if (seekBar.current) {
        seekBar.current.style.width = `${percentage}%`;
      }

      setTime({
        currentTime: {
          minute: String(Math.floor(audioRef.current.currentTime / 60)).padStart(2, "0"),
          second: String(Math.floor(audioRef.current.currentTime % 60)).padStart(2, "0"),
        },
        totalTime: {
          minute: String(Math.floor(audioRef.current.duration / 60)).padStart(2, "0"),
          second: String(Math.floor(audioRef.current.duration % 60)).padStart(2, "0"),
        },
      });
    };

    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("timeupdate", handleTimeUpdate);
    }
    
    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, []);

  // Handle song end behavior
  useEffect(() => {
    const handleTrackEnd = () => {
      if (isChangingSong) return;
      
      // If shuffle is active, play a random track
      if (isShuffleActive) {
        playRandomTrack();
        return;
      }
      
      // If it's the last track and not in loop or shuffle mode
      const index = songs.findIndex((s) => s.id === track?.id);
      if (index === songs.length - 1 && !isLoopActive && !isShuffleActive) {
        setPlayStatus(false); // Reset to play icon
      } else if (!isLoopActive) {
        // Otherwise play next track if not the last one
        next();
      }
    };
    
    // Set up loop property when audio changes or loop state changes
    if (audioRef.current) {
      audioRef.current.loop = isLoopActive;
    }
    
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', handleTrackEnd);
    }
    
    return () => {
      if (audio) {
        audio.removeEventListener('ended', handleTrackEnd);
      }
    };
  }, [isLoopActive, isShuffleActive, track, songs, isChangingSong]);

  return (
    <PlayerContext.Provider
      value={{
        audioRef,
        seekBg,
        seekBar,
        songs,
        setSongs,
        track,
        setTrack,
        playStatus,
        setPlayStatus,
        time,
        setTime,
        play,
        pause,
        playWithId,
        previous,
        next,
        seekSong,
        isLoopActive,
        isShuffleActive,
        toggleLoop,
        toggleShuffle,
        isLastTrack,
        isChangingSong
      }}
    >
      {children}
      {/* Important: No src attribute initially - we'll set it programmatically only when needed */}
      <audio ref={audioRef} preload="none" />
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;