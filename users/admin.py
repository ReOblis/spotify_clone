from django.contrib import admin

from music.models import Song, Album, Playlist


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('id', 'artist', 'created_at')  # Cột hiển thị trong danh sách
    search_fields = ('name', 'artist')  # Thêm thanh tìm kiếm
    list_filter = ('created_at', 'artist')  # Thêm bộ lọc ở bên phải
