import axios from "axios"
import Cookies from 'js-cookie';

const API_URL = "http://127.0.0.1:8000/api/music"; // Địa chỉ backend
const BASE_URL = "http://127.0.0.1:8000/api";

const getHeaders = (isAuth = false) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (isAuth) {
    const token = Cookies.get("token");  // Lấy token từ cookie
    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }
  }

  return headers;
};

export const register = async (userData) => {
  const res = await fetch(`${BASE_URL}/users/register/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errorData = await res.json(); // Lấy thông tin lỗi từ backend
    let errorMessages = "";

    for (const [key, value] of Object.entries(errorData)) {
      if (Array.isArray(value)) {
        value.forEach((errorMsg) => {
          errorMessages += `${errorMsg}\n`; // Nối lỗi với dòng mới
        });
      } else {
        errorMessages += `${value}\n`; // Nếu value không phải mảng, thêm trực tiếp lỗi
      }
    }

    throw { message: errorMessages.trim() }; // Trả về lỗi dưới dạng đối tượng với thông báo chi tiết
  }

  // Nếu đăng ký thành công, lưu token vào cookie
  const data = await res.json();
  if (data.token) {
    Cookies.set('token', data.token); // Lưu token vào cookie
  }
  
  return data;
};


export const login = async (userData) => {
  const res = await fetch(`${BASE_URL}/users/login/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });

  if (!res.ok) throw await res.json();
  
  const data = await res.json();
 
  // Lưu token vào cookie khi đăng nhập thành công
  console.log("Dữ liệu trả về từ backend:", data);

  const token = data.token;
  if (token) {
    Cookies.set("token", token, { expires: 7 });  // Lưu token vào cookie mà không cần bảo mật
  }
  else {
    console.log("Không có token trong cookie");
  }
  
  return data;
};

export const getSongs = async () => {
    try {
        const response = await axios.get(`${API_URL}/songs/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
};

export const getAlbums = async () => {
  try {
    const response = await fetch(`${API_URL}/albums/`);
    if (!response.ok) throw new Error("Failed to fetch albums");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Lấy thông tin album theo ID
export const getAlbumById = async (albumId) => {
  try {
    const response = await fetch(`${API_URL}/albums/${albumId}/`);
    if (!response.ok) throw new Error("Failed to fetch album");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Lấy danh sách bài hát theo album
export const getSongsByAlbum = async (albumId) => {
  try {
    const response = await fetch(`${API_URL}/albums/${albumId}/songs/`);
    if (!response.ok) throw new Error("Failed to fetch songs");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Get streaming URL for a song
export const getStreamUrl = (songId) => {
  return `${API_URL}/stream/${songId}/`;
};

// Lấy danh sách bài hát yêu thích của người dùng
export const getFavoriteSongs = async () => {
  const token = Cookies.get("token")|| "";
  try {
    const response = await fetch(`${API_URL}/favorite_songs/list/`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching favorite songs:", error);
    throw error;
  }
};

// Thêm bài hát vào danh sách yêu thích
export const addToFavorites = async (songId) => {
  const token = Cookies.get("token")|| "";
  try {
    const response = await fetch(`${API_URL}/favorite_songs/`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ song_id: songId }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding song to favorites:", error);
    throw error;
  }
};

// Xóa bài hát khỏi danh sách yêu thích
export const removeFromFavorites = async (songId) => {
  const token = Cookies.get("token")|| "";
  try {
    const response = await fetch(`${API_URL}/favorite_songs/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ song_id: songId }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return true; // Return success
  } catch (error) {
    console.error("Error removing song from favorites:", error);
    throw error;
  }
};
export const removePlaylist = async (playlistId) => {
  const token = Cookies.get("token") || "";

  try {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/delete/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error removing playlist:", error);
    throw error;
  }
};


// PLAYLIST APIS

// Lấy danh sách playlist của người dùng
export const getUserPlaylists = async () => {
  const token = Cookies.get("token")|| "";
  try {
    const response = await fetch(`${API_URL}/playlists/`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching playlists:", error);
    throw error;
  }
};

// Tạo playlist mới
export const createPlaylist = async (name) => {
  const token = Cookies.get("token")|| "";
  try {
    const response = await fetch(`${API_URL}/playlists/`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating playlist:", error);
    throw error;
  }
};

// Lấy thông tin chi tiết playlist
export const getPlaylistById = async (playlistId) => {
  const token = Cookies.get("token")|| "";
  try {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching playlist:", error);
    throw error;
  }
};

// Thêm bài hát vào playlist
export const addSongToPlaylist = async (playlistId, songId) => {
  const token = Cookies.get("token")|| "";
  try {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/add_song/`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ song_id: songId }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    throw error;
  }
};

// Xóa bài hát khỏi playlist
export const removeSongFromPlaylist = async (playlistId, songId) => {
  const token = Cookies.get("token")|| "";
  try {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/remove_song/`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ song_id: songId }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    throw error;
  }
};

// Lấy danh sách bài hát trong playlist
export const getPlaylistSongs = async (playlistId) => {
  const token = Cookies.get("token")|| "";
  try {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/songs/`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching playlist songs:", error);
    throw error;
  }
};
export async function getTopSongs(limit = 20) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/music/songs/top/?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch top songs");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching top songs:", error);
    return [];
  }
}
export const searchContent = async (query) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/music/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};
export const getVideos = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/music/videos/');
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

// Get a specific video
export const getVideo = async (id) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/music/videos/${id}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching video ${id}:`, error);
    throw error;
  }
};

// Update the searchContent function to include videos
