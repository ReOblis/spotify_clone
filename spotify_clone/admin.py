from django.contrib import admin

from spotify_clone.music.models import Song

admin.site.register(Song)
admin.site.register(Album)
admin.site.register(Playlist)