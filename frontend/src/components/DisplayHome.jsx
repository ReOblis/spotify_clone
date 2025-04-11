import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import AlbumItem from "./AlbumItem";
import SongItem from "./SongItem";
import { getAlbums, getSongsByAlbum, getTopSongs, searchContent } from "../api";

const DisplayHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    // Kiểm tra xem có phải đang ở chế độ tìm kiếm không
    if (location.search) {
      const params = new URLSearchParams(location.search);
      const query = params.get('q');
      if (query) {
        setSearchQuery(query);
        setIsSearchMode(true);
        performSearch(query);
        return;
      }
    } else if (location.state?.query) {
      setSearchQuery(location.state.query);
      setIsSearchMode(true);
      
      if (location.state?.results) {
        const { songs, albums, artists } = location.state.results;
        setSongs(songs || []);
        setAlbums(albums || []);
        setArtists(artists || []);
      } else {
        performSearch(location.state.query);
      }
      return;
    }

    // Nếu không ở chế độ tìm kiếm, hiển thị nội dung mặc định
    setIsSearchMode(false);
    fetchDefaultData();
  }, [location]);

  const fetchDefaultData = async () => {
    setIsLoading(true);
    try {
      // Fetch albums
      const albumsData = await getAlbums();
      setAlbums(albumsData);
      
      // Fetch top songs
      const topSongsData = await getTopSongs();
      setSongs(topSongsData);
    } catch (error) {
      console.error("Error fetching default data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (query) => {
    setIsLoading(true);
    try {
      const results = await searchContent(query);
      setSongs(results.songs || []);
      setAlbums(results.albums || []);
      setArtists(results.artists || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lọc kết quả dựa trên bộ lọc đang hoạt động (chỉ áp dụng cho chế độ tìm kiếm)
  const getFilteredResults = () => {
    if (!isSearchMode || activeFilter === "all") {
      return { songs, albums, artists };
    } else {
      return {
        songs: activeFilter === "music" ? songs : [],
        albums: activeFilter === "music" ? albums : [],
        artists: activeFilter === "music" ? artists : [],
      };
    }
  };

  const filteredResults = getFilteredResults();
  const hasResults = isSearchMode && (
    filteredResults.songs?.length > 0 || 
    filteredResults.albums?.length > 0 || 
    filteredResults.artists?.length > 0
  );

  return (
    <>
      <Navbar onSearch={(query) => {
        navigate(`/?q=${encodeURIComponent(query)}`, { 
          state: { query } 
        });
      }} />

     
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-t-4 border-green-500 rounded-full animate-spin"></div>
        </div>
      ) : isSearchMode ? (
        // Hiển thị kết quả tìm kiếm
        <>
          {hasResults ? (
            <div className="p-4">
              {/* Artists Section */}
              {filteredResults.artists?.length > 0 && (
                <div className="mb-4">
                  <h1 className="my-5 font-bold text-2xl">Artists</h1>
                  <div className="flex overflow-auto gap-4 pb-4">
                    {filteredResults.artists.map((artist) => (
                      <div 
                        key={artist.id}
                        className="flex-shrink-0 w-48 p-4 bg-[#181818] hover:bg-[#282828] transition-colors rounded-lg cursor-pointer"
                        onClick={() => navigate(`/artist/${artist.id}`)}
                      >
                        <div className="w-full aspect-square rounded-full overflow-hidden mb-4">
                          {artist.image ? (
                            <img 
                              src={artist.image} 
                              alt={artist.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#333] flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold truncate text-center">{artist.name}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Albums Section */}
              {filteredResults.albums?.length > 0 && (
                <div className="mb-4">
                  <h1 className="my-5 font-bold text-2xl">Albums</h1>
                  <div className="flex overflow-auto gap-4 pb-4">
                    {filteredResults.albums.map((album) => (
                      <AlbumItem 
                        key={album.id} 
                        name={album.name} 
                        desc={album.desc || album.artist} 
                        id={album.id} 
                        image={album.cover_image} 
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Songs Section */}
              {filteredResults.songs?.length > 0 && (
                <div className="mb-4">
                  <h1 className="my-5 font-bold text-2xl">Songs</h1>
                  <div className="flex overflow-auto gap-4 pb-4">
                    {filteredResults.songs.map((song) => (
                      <SongItem 
                        key={song.id} 
                        name={song.title} 
                        desc={song.artist} 
                        id={song.id} 
                        image={song.cover_image} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">No results found for "{searchQuery}"</h2>
              <p className="text-gray-400">Try different keywords or check your spelling</p>
            </div>
          )}
        </>
      ) : (
        // Hiển thị nội dung mặc định
        <div className="p-4">
          <div className="mb-4">
            <h1 className="my-5 font-bold text-2xl">Featured Albums</h1>
            <div className="flex overflow-auto gap-4 pb-4">
              {albums.length > 0 ? (
                albums.map((item) => (
                  <AlbumItem 
                    key={item.id} 
                    name={item.name} 
                    desc={item.desc} 
                    id={item.id} 
                    image={item.cover_image} 
                  />
                ))
              ) : (
                <p>Loading albums...</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h1 className="my-5 font-bold text-2xl">Today's biggest hits</h1>
            <div className="flex overflow-auto gap-4 pb-4">
              {songs.length > 0 ? (
                songs.map((song) => (
                  <SongItem 
                    key={song.id} 
                    name={song.title} 
                    desc={song.artist} 
                    id={song.id} 
                    image={song.cover_image} 
                  />
                ))
              ) : (
                <p>Loading songs...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DisplayHome;