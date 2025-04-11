import { useState, useEffect, useRef } from "react";
import {
  getUserPlaylists,
  addToFavorites,
  removeFromFavorites,
  addSongToPlaylist,
  createPlaylist as apiCreatePlaylist,
} from "../api"; // Import API functions
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import Cookies from 'js-cookie';


const SongActionMenu = ({ songId, isInFavorites = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate(); // Initialize navigate for redirection
  
  // Check if user is logged in
  const isLoggedIn = () => {
    // Check if there's an auth token in localStorage or any other authentication method you use
    return Cookies.get("token");
  };

  // Fetch user playlists
  useEffect(() => {
    if (showPlaylistSelector) {
      fetchPlaylists();
    }
  }, [showPlaylistSelector]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
        setShowPlaylistSelector(false);
        setShowCreatePlaylist(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const fetchPlaylists = async () => {
    setIsLoading(true);
    try {
      // Use the API function instead of direct axios call
      const data = await getUserPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      showNotification("Could not load playlists", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isInFavorites) {
        // Remove from favorites using API function
        await removeFromFavorites(songId);
        showNotification("Removed from favorites", "success");
      } else {
        // Add to favorites using API function
        await addToFavorites(songId);
        showNotification("Added to favorites", "success");
      }
      setShowMenu(false);
    } catch (error) {
      console.error("Error updating favorites:", error);
      showNotification("Failed to update favorites", "error");
    }
  };
  
  const handleAddToPlaylist = async (playlistId) => {
    try {
      // Use the API function instead of direct axios call
      await addSongToPlaylist(playlistId, songId);
      showNotification("Added to playlist", "success");
      setShowPlaylistSelector(false);
      setShowMenu(false);
    } catch (error) {
      // Check for error response
      if (error.message && error.message.includes("400")) {
        showNotification("Song already in playlist", "error");
      } else {
        showNotification("Failed to add to playlist", "error");
      }
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      showNotification("Playlist name is required", "error");
      return;
    }

    try {
      // Create playlist using API function
      const newPlaylist = await apiCreatePlaylist(newPlaylistName);
      
      // Add song to the newly created playlist
      await addSongToPlaylist(newPlaylist.id, songId);
      setNewPlaylistName("");
      setShowCreatePlaylist(false);
      showNotification("Added to new playlist", "success");
      setShowMenu(false);
    } catch (error) {
      console.error("Error creating playlist:", error);
      showNotification("Failed to create playlist", "error");
    }
  };

  const showNotification = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // Determine if we should display menu upward
  // This will check if the button is in the bottom half of the viewport
  const [showMenuUpward, setShowMenuUpward] = useState(false);
  
  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      setShowMenuUpward(rect.top > viewportHeight / 2);
    }
  }, [showMenu]);

  const getMenuPosition = () => {
    if (showMenuUpward) {
      return "bottom-full mb-2"; // Position above button
    }
    return "top-full mt-2"; // Position below button (default)
  };
  
  // Handle click on the Plus button
  const handleButtonClick = (e) => {
    e.stopPropagation();
    
    // If user is not logged in, redirect to Register page
    if (!isLoggedIn()) {
      navigate("/Register");
      return;
    }
    
    // Otherwise, show the menu as usual
    setShowMenu(!showMenu);
    setShowPlaylistSelector(false);
    setShowCreatePlaylist(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Plus Button */}
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="text-green-400 hover:text-green-300 text-lg font-bold"
      >
        +
      </button>

      {/* Dropdown Menu */}
      {showMenu && !showPlaylistSelector && !showCreatePlaylist && (
        <div className={`absolute ${getMenuPosition()} right-0 w-48 bg-[#282828] shadow-lg rounded z-10`}>
          <div 
            className="py-2 px-4 hover:bg-[#3e3e3e] cursor-pointer text-green-400"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite();
            }}
          >
            {isInFavorites ? "Remove from Liked Songs" : "Add to Liked Songs"}
          </div>
          <div 
            className="py-2 px-4 hover:bg-[#3e3e3e] cursor-pointer text-green-400"
            onClick={(e) => {
              e.stopPropagation();
              setShowPlaylistSelector(true);
            }}
          >
            Add to Playlist
          </div>
        </div>
      )}

      {/* Playlist Selector */}
      {showPlaylistSelector && (
        <div className={`absolute ${getMenuPosition()} right-0 w-56 bg-[#282828] shadow-lg rounded z-10`}>
          <div className="p-2 border-b border-[#3e3e3e]">
            <h3 className="text-white font-bold">Add to Playlist</h3>
          </div>
          
          {isLoading ? (
            <div className="p-4 text-center text-[#a7a7a7]">Loading...</div>
          ) : (
            <>
              <div 
                className="py-2 px-4 hover:bg-[#3e3e3e] cursor-pointer text-green-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreatePlaylist(true);
                  setShowPlaylistSelector(false);
                }}
              >
                + Create Playlist
              </div>
              
              {playlists.length > 0 ? (
                playlists.map(playlist => (
                  <div 
                    key={playlist.id}
                    className="py-2 px-4 hover:bg-[#3e3e3e] cursor-pointer truncate"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlaylist(playlist.id);
                    }}
                  >
                    {playlist.name}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-[#a7a7a7]">No playlists found</div>
              )}
            </>
          )}
        </div>
      )}

      {/* Create Playlist Form */}
      {showCreatePlaylist && (
        <div className={`absolute ${getMenuPosition()} right-0 w-64 bg-[#282828] shadow-lg rounded z-10`}>
          <div className="p-2 border-b border-[#3e3e3e]">
            <h3 className="text-white font-bold">Create Playlist</h3>
          </div>
          <div className="p-4">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className="w-full p-2 bg-[#3e3e3e] rounded text-white mb-2"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreatePlaylist(false);
                  setShowPlaylistSelector(true);
                }}
                className="px-3 py-1 rounded bg-[#3e3e3e] hover:bg-[#4e4e4e] text-white"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  createPlaylist();
                }}
                className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {message.text && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-md ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default SongActionMenu;