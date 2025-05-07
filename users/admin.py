from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from music.models import Song, Album, Playlist, PlaylistSong, FavoriteSong, Video
from django.contrib.auth import get_user_model

User = get_user_model()

# -------------------------
# Song Admin
# -------------------------
@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'artist', 'album', 'duration', 'listen_count', 'created_at')
    search_fields = ('title', 'artist')
    list_filter = ('created_at', 'artist', 'album')
    ordering = ('-created_at',)

# -------------------------
# Album Admin
# -------------------------
@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'artist', 'created_at')
    search_fields = ('name', 'artist')
    list_filter = ('created_at', 'artist')
    ordering = ('-created_at',)

# -------------------------
# Playlist Admin
# -------------------------
@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'created_at')
    search_fields = ('name', 'user__username')
    list_filter = ('created_at', 'user')
    ordering = ('-created_at',)

# -------------------------
# Playlist Song Admin
# -------------------------
@admin.register(PlaylistSong)
class PlaylistSongAdmin(admin.ModelAdmin):
    list_display = ('id', 'playlist', 'song', 'order', 'added_at')
    search_fields = ('playlist__name', 'song__title')
    list_filter = ('playlist', 'added_at')

# -------------------------
# Favorite Song Admin
# -------------------------
@admin.register(FavoriteSong)
class FavoriteSongAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'song', 'added_at')
    search_fields = ('user__username', 'song__title')
    list_filter = ('added_at', 'user')

# -------------------------
# Video Admin
# -------------------------
@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'duration', 'created_at')
    search_fields = ('title',)
    list_filter = ('created_at',)

# -------------------------
# Custom User Admin
# -------------------------
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'username', 'email', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('username', 'email')
    list_filter = ('is_staff', 'is_superuser', 'date_joined')
    
    # Don't add date_joined to fieldsets as it's already included in UserAdmin.fieldsets
    # We'll just make it read-only
    readonly_fields = ('date_joined',)