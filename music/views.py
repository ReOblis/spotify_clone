from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .models import Song, Album, Playlist, FavoriteSong, PlaylistSong
from .serializers import SongSerializer, AlbumSerializer, PlaylistSerializer
from django.http import JsonResponse
from django.conf import settings
from rest_framework.response import Response
from django.http import FileResponse, Http404
from django.db.models import F, Q




# 📌 API: Lấy danh sách album (Công khai)
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # Cho phép tất cả truy cập
def album_list(request):
    if request.method == 'GET':
        albums = Album.objects.all()
        serializer = AlbumSerializer(albums, many=True, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = AlbumSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 📌 API: Lấy chi tiết album (Công khai)
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])  # Cho phép tất cả truy cập
def album_detail(request, album_id):
    try:
        album = Album.objects.get(id=album_id)
    except Album.DoesNotExist:
        return Response({"error": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AlbumSerializer(album)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = AlbumSerializer(album, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        album.delete()
        return Response({"message": "Album deleted"}, status=status.HTTP_204_NO_CONTENT)

# 📌 API: Lấy danh sách bài hát (Công khai)
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # Cho phép tất cả truy cập
def song_list(request):
    if request.method == 'GET':
        songs = Song.objects.all()
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':  
        serializer = SongSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 📌 API: Lấy chi tiết bài hát (Công khai)
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])  # Cho phép tất cả truy cập
def song_detail(request, song_id):
    try:
        song = Song.objects.get(id=song_id)
    except Song.DoesNotExist:
        return Response({"error": "Song not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = SongSerializer(song)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = SongSerializer(song, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        song.delete()
        return Response({"message": "Song deleted"}, status=status.HTTP_204_NO_CONTENT)
@api_view(['GET'])
@permission_classes([AllowAny])
def song_list_by_album(request, album_id):
    try:
        album = Album.objects.get(id=album_id)
        songs = Song.objects.filter(album=album)
        serializer = SongSerializer(songs, many=True, context={"request": request})
        return Response(serializer.data)
    except Album.DoesNotExist:
        return Response({"error": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

############################################################################

class PlaylistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        name = request.data.get('name')
        if not name:
            return Response({"detail": "Playlist name is required"}, status=status.HTTP_400_BAD_REQUEST)

        playlist = Playlist.objects.create(name=name, user=user)
        return Response(PlaylistSerializer(playlist).data, status=status.HTTP_201_CREATED)
    def get(self, request):
        user = request.user
        playlists = Playlist.objects.filter(user=user).order_by('-created_at')
        serializer = PlaylistSerializer(playlists, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PlaylistSongsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, playlist_id):
        user = request.user
        playlist = Playlist.objects.filter(id=playlist_id, user=user).first()

        if not playlist:
            return Response({"detail": "Playlist not found or you are not the owner"}, status=status.HTTP_404_NOT_FOUND)

        # Lấy các bài hát thông qua bảng trung gian PlaylistSong
        playlist_songs = PlaylistSong.objects.filter(playlist=playlist).select_related('song')
        songs = [ps.song for ps in playlist_songs]
        serializer = SongSerializer(songs, many=True, context={'request': request})
        
        return Response(serializer.data, status=status.HTTP_200_OK)
class PlaylistDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, playlist_id):
        user = request.user
        playlist = Playlist.objects.filter(id=playlist_id, user=user).first()

        if not playlist:
            return Response({"detail": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PlaylistSerializer(playlist)
        return Response(serializer.data, status=status.HTTP_200_OK)
class AddSongToPlaylist(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, playlist_id):
        user = request.user
        song_id = request.data.get('song_id')

        playlist = Playlist.objects.filter(id=playlist_id, user=user).first()
        if not playlist:
            return Response({"detail": "Playlist not found or you're not the owner"}, status=status.HTTP_404_NOT_FOUND)

        song = Song.objects.filter(id=song_id).first()
        if not song:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra đã tồn tại trong playlist chưa
        exists = PlaylistSong.objects.filter(playlist=playlist, song=song).exists()
        if exists:
            return Response({"detail": "Song already exists in playlist"}, status=status.HTTP_400_BAD_REQUEST)

        PlaylistSong.objects.create(playlist=playlist, song=song)
        return Response({"detail": "Song added to playlist"}, status=status.HTTP_201_CREATED)

class RemoveSongFromPlaylist(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, playlist_id):
        user = request.user
        song_id = request.data.get('song_id')

        playlist = Playlist.objects.filter(id=playlist_id, user=user).first()
        if not playlist:
            return Response({"detail": "Playlist not found or you're not the owner"}, status=status.HTTP_404_NOT_FOUND)

        song = Song.objects.filter(id=song_id).first()
        if not song:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)

        playlist_song = PlaylistSong.objects.filter(playlist=playlist, song=song).first()
        if not playlist_song:
            return Response({"detail": "Song not found in playlist"}, status=status.HTTP_404_NOT_FOUND)

        playlist_song.delete()
        return Response({"detail": "Song removed from playlist"}, status=status.HTTP_200_OK)
  
    
class FavoriteSongView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Thêm bài hát vào danh sách yêu thích"""
        user = request.user
        song_id = request.data.get('song_id')

        song = Song.objects.filter(id=song_id).first()
        if not song:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)

        favorite_song, created = FavoriteSong.objects.get_or_create(user=user, song=song)
        
        if created:
            return Response({"detail": "Song added to favorites"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"detail": "Song is already in your favorites"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """Xóa bài hát khỏi danh sách yêu thích"""
        user = request.user
        song_id = request.data.get('song_id')

        song = Song.objects.filter(id=song_id).first()
        if not song:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)

        favorite_song = FavoriteSong.objects.filter(user=user, song=song).first()
        if favorite_song:
            favorite_song.delete()
            return Response({"detail": "Song removed from favorites"}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Song is not in your favorites"}, status=status.HTTP_400_BAD_REQUEST)    
        permission_classes = [IsAuthenticated]


class FavoriteSongListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        favorite_song_ids = FavoriteSong.objects.filter(user=user).values_list('song_id', flat=True)
        songs = Song.objects.filter(id__in=favorite_song_ids)
        serializer = SongSerializer(songs, many=True, context={'request': request})
        
        return Response(serializer.data)  

@permission_classes([AllowAny])
class StreamAudioView(APIView):
    def get(self, request, song_id):
        try:
            song = Song.objects.get(id=song_id)

            Song.objects.filter(id=song.id).update(listen_count=F('listen_count') + 1)

            audio_path = song.audio_file.path

            response = FileResponse(open(audio_path, 'rb'))
            response['Content-Type'] = 'audio/mpeg'  # Tùy vào định dạng bạn dùng
            response['Accept-Ranges'] = 'bytes'
            response['Access-Control-Allow-Origin'] = '*'  # CORS cho frontend gọi

            return response

        except Song.DoesNotExist:
            raise Http404("Song does not exist")
        except Exception as e:
            return Response({'error': str(e)}, status=500)

        
@permission_classes([AllowAny])
class SongsByAlbum(APIView):
    def get(self, request, album_id):
        songs = Song.objects.filter(album_id=album_id)
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)
    
@permission_classes([AllowAny])
class TopSongsView(APIView):

    def get(self, request):
        top_songs = Song.objects.all().order_by('-listen_count')[:20]  # lấy top 20
        serializer = SongSerializer(top_songs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def search(request):
    query = request.GET.get('q', '')
    if not query:
        return Response({'songs': [], 'albums': []})
    
    # Tìm kiếm song theo title và artist
    songs = Song.objects.filter(
        Q(title__icontains=query) | 
        Q(artist__icontains=query)
    )[:10]  # Giới hạn 10 kết quả
    
    # Tìm kiếm album theo name
    albums = Album.objects.filter(name__icontains=query)[:10]
    
    # Tìm kiếm song theo album
    songs_by_album = Song.objects.filter(album__name__icontains=query)
    songs = (songs | songs_by_album).distinct()[:10]  # Kết hợp và loại bỏ trùng lặp
    
    return Response({
        'songs': SongSerializer(songs, many=True).data,
        'albums': AlbumSerializer(albums, many=True).data
    })