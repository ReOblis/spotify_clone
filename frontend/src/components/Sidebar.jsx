import { useNavigate, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { useEffect, useState } from "react";
import { getUserPlaylists, createPlaylist, searchContent } from "../api";
import Cookies from 'js-cookie';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
const [showCreateInput, setShowCreateInput] = useState(false);
const [newPlaylistName, setNewPlaylistName] = useState("");

  // Check if route is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.includes(path);
  };

  // Kiểm tra xem trang hiện tại có phải trang tìm kiếm không (dựa vào query params)
  const isSearchPage = () => {
    const params = new URLSearchParams(location.search);
    return params.has('q');
  };

  useEffect(() => {
    // Check if user is logged in by looking for token in cookies
    const checkLoginStatus = () => {
      const token = Cookies.get("token");
      return !!token;
    };

    const fetchPlaylists = async () => {
      setIsLoading(true);
      const loggedIn = checkLoginStatus();
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        try {
          const userPlaylists = await getUserPlaylists();
          setPlaylists(userPlaylists);
        } catch (error) {
          console.error("Error fetching playlists:", error);
        }
      }
      setIsLoading(false);
    };

    fetchPlaylists();

    // Lấy query từ URL nếu đang ở trang tìm kiếm
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [location.pathname]);

 const handleCreatePlaylist = async () => {
  if (!isLoggedIn) {
    navigate('/login');
    return;
  }

  if (!newPlaylistName.trim()) {
    alert("Please enter a playlist name.");
    return;
  }

  try {
    const newPlaylist = await createPlaylist(newPlaylistName.trim());
    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName(""); // Reset form
    setShowCreateInput(false); // Ẩn form
    navigate(`/playlist/${newPlaylist.id}`);
  } catch (error) {
    console.error("Error creating playlist:", error);
  }
};


  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearching(true);
      try {
        const searchResults = await searchContent(searchQuery);
        // Thay đổi: Thay vì navigate đến /search, chúng ta sẽ navigate đến trang chủ với query parameter
        navigate(`/?q=${encodeURIComponent(searchQuery)}`, { 
          state: { 
            results: searchResults, 
            query: searchQuery 
          } 
        });
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const toggleSearchView = () => {
    // Nếu đang ở trang tìm kiếm, quay về trang chủ
    if (isSearchPage()) {
      navigate('/');
    }
    // Focus the search input when clicked
    document.getElementById('search-input')?.focus();
  };

  return (
    <div className="w-[25%] h-full flex-col gap-2 text-white hidden lg:flex overflow-hidden">
      {/* Navigation section */}
      <div className="bg-[#121212] h-auto p-4 rounded flex flex-col gap-1">
        <div 
          onClick={() => navigate('/')} 
          className={`flex items-center gap-3 pl-4 py-2 cursor-pointer ${isActive('/') && !isSearchPage() ? 'text-white' : 'text-gray-400'} hover:text-white`}
        >
          <img className="w-6" src={assets.home_icon} alt="Home" />
          <p className="font-semibold">Home</p>
        </div>
        <div 
          onClick={toggleSearchView}
          className={`flex items-center gap-3 pl-4 py-2 cursor-pointer ${isSearchPage() ? 'text-white' : 'text-gray-400'} hover:text-white`}
        >
          <img className="w-6" src={assets.search_icon} alt="Search" />
          <p className="font-semibold">Search</p>
        </div>
        {/* Search Input - Luôn hiển thị */}
        <div className="px-4 py-2">
          <div className="relative">
            <input
              id="search-input"
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full py-2 pl-8 pr-4 bg-[#242424] rounded-full text-sm text-white focus:outline-none focus:ring-2 focus:ring-white"
            />
            <div className="absolute left-3 top-2.5">
              {isSearching ? (
                <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
              ) : (
                <img className="w-4 h-4" src={assets.search_icon} alt="Search" />
              )}
            </div>
            {searchQuery && (
              <div 
                className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-white"
                onClick={() => {
                  setSearchQuery("");
                  // Nếu đang ở trang tìm kiếm, quay về trang chủ khi xóa query
                  if (isSearchPage()) {
                    navigate('/');
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Library section */}
<div className="bg-[#121212] flex-grow rounded flex flex-col overflow-hidden">

  {/* Header: Library + Buttons */}
  <div className="p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <img className="w-6" src={assets.stack_icon} alt="Library" />
      <p className="font-semibold">Your Library</p>
    </div>
    <div className="flex items-center gap-3">
      <div 
        onClick={() => setShowCreateInput(prev => !prev)}
        className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-[#282828] cursor-pointer"
        title="Create playlist"
      >
        <img className="w-4" src={assets.plus_icon} alt="Create" />
      </div>
      <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-[#282828] cursor-pointer">
        <img className="w-4" src={assets.arrow_icon} alt="Browse" />
      </div>
    </div>
  </div>

  {/* Create Playlist Input - Show when toggled */}
  {showCreateInput && (
    <div className="px-4 mb-2">
      <input
        type="text"
        value={newPlaylistName}
        onChange={(e) => setNewPlaylistName(e.target.value)}
        placeholder="Enter playlist name"
        className="w-full p-2 rounded bg-[#1a1a1a] text-white placeholder-gray-400 mb-2 border border-gray-600"
      />
      <div className="flex gap-2">
        <button
          onClick={handleCreatePlaylist}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1.5 rounded"
        >
          Create
        </button>
        <button
          onClick={() => {
            setShowCreateInput(false);
            setNewPlaylistName("");
          }}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1.5 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  )}

        {/* Filter/sort options */}
        <div className="px-4 flex gap-2">
          <button className="px-3 py-1.5 text-sm bg-[#232323] hover:bg-[#2a2a2a] rounded-full">Playlists</button>
          <button className="px-3 py-1.5 text-sm bg-[#232323] hover:bg-[#2a2a2a] rounded-full">Albums</button>
        </div>
        
        {/* Favorites & Playlists */}
        <div className="flex-grow overflow-y-auto mt-4 px-2 custom-scrollbar">
          {/* Favorites Link - Always visible */}
          <div 
            onClick={() => navigate('/favorites')} 
            className={`flex items-center p-2 rounded ${isActive('/favorites') ? 'bg-[#232323]' : ''} hover:bg-[#232323] cursor-pointer mb-2`}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 mr-3 rounded flex-shrink-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm">Liked Songs</p>
              <p className="text-xs text-gray-400">Playlist • Your favorites</p>
            </div>
          </div>
        
          {/* User Playlists */}
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin mx-auto mb-2"></div>
              Loading playlists...
            </div>
          ) : isLoggedIn && playlists.length > 0 ? (
            <div className="flex flex-col gap-2">
              {playlists.map(playlist => (
                <div 
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className={`flex items-center p-2 rounded ${isActive(`/playlist/${playlist.id}`) ? 'bg-[#232323]' : ''} hover:bg-[#232323] cursor-pointer`}
                >
                  <div className="w-12 h-12 bg-[#282828] mr-3 rounded flex-shrink-0 flex items-center justify-center">
                    {playlist.cover_image ? (
                      <img src={playlist.cover_image} alt={playlist.name} className="w-full h-full object-cover rounded" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-sm truncate">{playlist.name}</p>
                    <p className="text-xs text-gray-400 truncate">Playlist • You</p>
                  </div>
                </div>
              ))}
            </div>
          ) : !isLoggedIn ? (
            <>
              <div className="p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4">
                <h1>Create your first playlist</h1>
                <p className="font-light text-sm text-gray-300">It's easy, we'll help you</p>
                <button 
                  onClick={() => isLoggedIn ? handleCreatePlaylist() : navigate('/Login')}
                  className="px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4 hover:scale-105 transition-transform"
                >
                  Create Playlist
                </button>
              </div>
              <div className="p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4">
                <h1>Create your favorite songs</h1>
                <button 
                  onClick={() => isLoggedIn ? handleCreatePlaylist() : navigate('/Login')}
                  className="px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4 hover:scale-105 transition-transform"
                >
                  Create Favorites list
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-gray-400">
              <p>No playlists found</p>
              
            </div>
          )}
        </div>
      </div>
      
      {/* Custom scrollbar style */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4d4d4d;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;