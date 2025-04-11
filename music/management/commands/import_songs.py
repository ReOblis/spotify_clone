import os
import datetime
from mutagen.mp3 import MP3
from mutagen.flac import FLAC
from mutagen.wave import WAVE
from mutagen.id3 import ID3, TIT2, TPE1, TALB, APIC
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
from music.models import Song, Album
from PIL import Image
import io

# Đường dẫn thư mục chứa file nhạc và cover
MEDIA_PATH = os.path.join(settings.MEDIA_ROOT, "songs")
COVER_PATH = os.path.join(settings.MEDIA_ROOT, "covers")
ALBUM_IMAGES_PATH = os.path.join(settings.MEDIA_ROOT, "album_images")

# Kích thước ảnh bìa là 500x500 pixels
COVER_SIZE = (500, 500)

class Command(BaseCommand):
    help = "Import songs from media folder into the database"

    def handle(self, *args, **kwargs):
        if not os.path.exists(MEDIA_PATH):
            self.stdout.write(self.style.ERROR("⚠️  Thư mục media/songs không tồn tại!"))
            return

        os.makedirs(COVER_PATH, exist_ok=True)  # Tạo thư mục lưu cover nếu chưa có
        os.makedirs(ALBUM_IMAGES_PATH, exist_ok=True)  # Tạo thư mục lưu album cover nếu chưa có

        # Lấy user đầu tiên làm người upload (hoặc tạo user mặc định)
        User = get_user_model()
        default_user = User.objects.first()
        if not default_user:
            self.stdout.write(self.style.ERROR("⚠️  Không tìm thấy user nào trong hệ thống!"))
            return

        for filename in os.listdir(MEDIA_PATH):
            if filename.endswith(('.mp3', '.flac', '.wav')):  # Kiểm tra file nhạc
                file_path = os.path.join(MEDIA_PATH, filename)

                # Đọc metadata từ file nhạc
                metadata = self.get_song_metadata(file_path, filename)

                # Kiểm tra nếu bài hát đã tồn tại
                if Song.objects.filter(title=metadata['title'], artist=metadata['artist']).exists():
                    self.stdout.write(self.style.WARNING(f"⚠️  Bài hát đã tồn tại: {metadata['title']}"))
                    continue

                # Tạo hoặc lấy album
                album, created = Album.objects.get_or_create(
                    name=metadata['album'],
                    defaults={'artist': metadata['artist']}
                )

                # Kiểm tra nếu tên album trùng tên bài hát, lấy cover của bài hát
                if album.name == metadata['title']:
                    album_cover_image = self.extract_cover_image_from_song(file_path, filename)
                    if album_cover_image:
                        # Lưu ảnh vào album_images
                        album.cover_image = album_cover_image
                        album.save()
                else:
                    # Nếu album chưa có cover, lấy ảnh từ bài hát đầu tiên trong album
                    if not album.cover_image:
                        album_cover_image = self.get_album_cover_image(album)
                        if album_cover_image:
                            album.cover_image = album_cover_image
                            album.save()

                # Tạo bài hát mới
                song = Song.objects.create(
                    title=metadata['title'],
                    artist=metadata['artist'],
                    album=album,
                    audio_file=f"songs/{filename}",
                    duration=metadata['duration'],
                    uploaded_by=default_user,
                    cover_image=metadata['image'] or album.cover_image  # Nếu bài hát không có cover thì dùng album's cover
                )

                self.stdout.write(self.style.SUCCESS(f"✅ Đã thêm: {song.title} - {song.artist}"))

        self.stdout.write(self.style.SUCCESS("✅ Đã xử lý tất cả các album."))

    def get_song_metadata(self, file_path, filename):
        """ Trích xuất metadata từ file nhạc và lưu cover image nếu có """
        metadata = {
            'title': os.path.basename(file_path).rsplit('.', 1)[0],  # Lấy tên file nếu không có metadata
            'artist': 'Unknown Artist',
            'album': 'Unknown Album',
            'duration': datetime.time(0, 0, 0),  # Thời lượng mặc định
            'image': None
        }

        if file_path.endswith('.mp3'):
            audio = MP3(file_path, ID3=ID3)
            if audio.tags:
                metadata['title'] = self.get_id3_tag(audio, 'TIT2') or metadata['title']
                metadata['artist'] = self.get_id3_tag(audio, 'TPE1') or 'Unknown Artist'
                metadata['album'] = self.get_id3_tag(audio, 'TALB') or 'Unknown Album'
            metadata['duration'] = self.get_audio_duration(audio.info.length)
            metadata['image'] = self.extract_cover_image(audio, filename)

        elif file_path.endswith('.flac'):
            audio = FLAC(file_path)
            metadata['title'] = audio.get('title', [metadata['title']])[0]
            metadata['artist'] = audio.get('artist', ['Unknown Artist'])[0]
            metadata['album'] = audio.get('album', ['Unknown Album'])[0]
            metadata['duration'] = self.get_audio_duration(audio.info.length)
            metadata['image'] = self.extract_cover_image(audio, filename)

        elif file_path.endswith('.wav'):
            audio = WAVE(file_path)
            metadata['duration'] = self.get_audio_duration(audio.info.length)

        return metadata

    def get_id3_tag(self, audio, tag_name):
        """ Lấy thông tin từ ID3 tag nếu có """
        return audio.tags.get(tag_name).text[0] if tag_name in audio.tags else None

    def get_audio_duration(self, length):
        """ Chuyển đổi thời lượng thành định dạng hh:mm:ss """
        minutes, seconds = divmod(int(length), 60)
        return datetime.time(0, minutes, seconds)

    def extract_cover_image(self, audio, filename):
        """ Trích xuất ảnh bìa và lưu vào thư mục covers """
        cover_filename = f"{filename.rsplit('.', 1)[0]}.jpg"
        cover_path = os.path.join(COVER_PATH, cover_filename)

        if isinstance(audio, MP3) and audio.tags:
            for tag in audio.tags.values():
                if isinstance(tag, APIC):
                    img = Image.open(io.BytesIO(tag.data))

                    # Cắt và resize ảnh thành vuông 500x500
                    img = self.make_square(img)
                    img = img.resize(COVER_SIZE, Image.LANCZOS)
                    
                    img.save(cover_path)
                    return f"covers/{cover_filename}"  # Trả về đường dẫn để lưu vào database

        elif isinstance(audio, FLAC) and audio.pictures:
            for picture in audio.pictures:
                img = Image.open(io.BytesIO(picture.data))

                # Cắt và resize ảnh thành vuông 500x500
                img = self.make_square(img)
                img = img.resize(COVER_SIZE, Image.LANCZOS)

                img.save(cover_path)
                return f"covers/{cover_filename}"

        return None  # Không tìm thấy ảnh

    def extract_cover_image_from_song(self, file_path, filename):
        """ Lấy cover từ bài hát """
        if file_path.endswith('.mp3'):
            audio = MP3(file_path, ID3=ID3)
        elif file_path.endswith('.flac'):
            audio = FLAC(file_path)
        else:
            return None
        
        return self.extract_cover_image(audio, filename)

    def get_album_cover_image(self, album):
        """ Lấy ảnh bìa từ bài hát đầu tiên trong album nếu album chưa có ảnh cover """
        # Lấy bài hát đầu tiên trong album
        first_song = Song.objects.filter(album=album).first()

        if first_song and first_song.cover_image:
            # Lấy ảnh từ bài hát đầu tiên và đổi tên theo mẫu "tên_album_cover"
            album_cover_filename = f"{album.name}_cover.jpg"
            album_cover_path = os.path.join(ALBUM_IMAGES_PATH, album_cover_filename)

            # Copy ảnh từ bài hát đầu tiên vào thư mục album_images
            with open(album_cover_path, "wb") as img_file:
                img_file.write(first_song.cover_image.read())

            return f"album_images/{album_cover_filename}"

        # Nếu album không có ảnh bìa, trả về None
        self.stdout.write(self.style.WARNING(f"⚠️ Album {album.name} không có ảnh bìa từ bài hát đầu tiên"))
        return None

    def make_square(self, img):
        """ Chuyển ảnh thành vuông bằng cách cắt bớt chiều dài và chiều rộng nếu cần """
        width, height = img.size
        min_dimension = min(width, height)

        left = (width - min_dimension) // 2
        top = (height - min_dimension) // 2
        right = (width + min_dimension) // 2
        bottom = (height + min_dimension) // 2

        img = img.crop((left, top, right, bottom))
        return img
