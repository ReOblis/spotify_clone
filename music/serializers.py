from rest_framework import serializers
from .models import Album, Song
from .models import Playlist, FavoriteSong, PlaylistSong
from django.conf import settings



class AlbumSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = '__all__'

    def get_cover_image(self, obj):
        request = self.context.get("request")
        if obj.cover_image and hasattr(obj.cover_image, 'url'):
            return request.build_absolute_uri(obj.cover_image.url)
        return None    
    cover_image = serializers.SerializerMethodField()
    def get_cover_image(self, obj):
        if obj.cover_image:
            return f"http://127.0.0.1:8000{settings.MEDIA_URL}{obj.cover_image}"
        return None
    class Meta:
        model = Album
        fields = '__all__'

class SongSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = '__all__'

    def get_cover_image(self, obj):
        request = self.context.get("request")
        if obj.cover_image and hasattr(obj.cover_image, 'url'):
            return request.build_absolute_uri(obj.cover_image.url)
        return None    
    cover_image = serializers.SerializerMethodField()
    def get_cover_image(self, obj):
        if obj.cover_image:
            return f"http://127.0.0.1:8000{settings.MEDIA_URL}{obj.cover_image}"
        return None


class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = ['id', 'name', 'user', 'created_at']


class PlaylistSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistSong
        fields = ['id', 'playlist', 'song']


class FavoriteSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteSong
        fields = ['id', 'user', 'song', 'added_at']
