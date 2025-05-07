from django.urls import path
from . import views
from .views import album_list, album_detail, song_list, song_detail, song_list_by_album
from .views import AddSongToPlaylist, RemoveSongFromPlaylist, FavoriteSongView, StreamAudioView, FavoriteSongListView, PlaylistView, PlaylistSongsView, PlaylistDetailView, TopSongsView, get_all_videos, get_video,stream_video, delete_playlist

urlpatterns = [
    path('albums/', album_list, name='album-list'),
    path('albums/<int:album_id>/', album_detail, name='album-detail'),
    path('songs/', song_list, name='song-list'),
    path('songs/<int:song_id>/', song_detail, name='song-detail'),
    path('playlists/<int:playlist_id>/add_song/', AddSongToPlaylist.as_view(), name='add-song-to-playlist'),
    path('playlists/<int:playlist_id>/remove_song/', RemoveSongFromPlaylist.as_view(), name='remove-song-from-playlist'),
    path('favorite_songs/', FavoriteSongView.as_view(), name='favorite-song'),
    path('albums/<int:album_id>/songs/', song_list_by_album, name='song-list-by-album'),
    path('stream/<int:song_id>/', StreamAudioView.as_view(), name='stream_audio'),
    path('playlists/', PlaylistView.as_view(), name='playlist-list-create'),
    path('playlists/<int:playlist_id>/delete/', delete_playlist, name='delete_playlist'),
    path('playlists/<int:playlist_id>/songs/', PlaylistSongsView.as_view(), name='playlist-songs'),
    path('playlists/<int:playlist_id>/', PlaylistDetailView.as_view(), name='playlist-detail'),
    path('favorite_songs/list/', FavoriteSongListView.as_view(), name='favorite-songs-list'),
    path('songs/top/', TopSongsView.as_view(), name='top-songs'),
    path('search', views.search, name='search'),
    path('videos/', get_all_videos, name='get_all_videos'),
    path('videos/<int:video_id>/', get_video, name='get_video'),
    path('videos/<int:id>/stream/', stream_video, name='stream_video')




    
]
