import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/music"; // Địa chỉ backend

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
};;
