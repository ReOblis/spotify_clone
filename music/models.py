from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()  

class Album(models.Model):
    name = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    cover_image = models.ImageField(upload_to="album_images/", blank=True, null=True)   
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Song(models.Model):
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    album = models.ForeignKey(Album, related_name="songs", on_delete=models.CASCADE, null=True, blank=True)
    audio_file = models.FileField(upload_to="songs/") 
    duration = models.CharField(max_length=50, blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    cover_image = models.ImageField(upload_to="covers/", blank=True, null=True) 
    listen_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    

class Playlist(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='playlists')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class PlaylistSong(models.Model):
    playlist = models.ForeignKey('Playlist', on_delete=models.CASCADE, related_name='playlist_songs')
    song = models.ForeignKey('Song', on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('playlist', 'song')
        ordering = ['order']

    def __str__(self):
        return f"{self.song.title} in {self.playlist.name}"
    
class FavoriteSong(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'song')
    def __str__(self):
        return f"{self.user.username} - {self.song.title}"

class Video(models.Model):
    title = models.CharField(max_length=255)
    video_file = models.FileField(upload_to='videos/')
    duration = models.CharField(max_length=50, blank=True)
    thumbnail = models.ImageField(upload_to='thumbnails/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
