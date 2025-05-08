import os
import shutil
from django.core.management.base import BaseCommand
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
from moviepy import VideoFileClip
from music.models import Video

VIDEO_RAW_DIR = 'media/video_raw'     # Nơi chứa video gốc cần xử lý
VIDEO_DEST_DIR = 'media/videos'       # Nơi lưu video sau xử lý
THUMBNAIL_DIR = 'media/thumbnails'    # Nơi lưu thumbnail
SUPPORTED_EXTENSIONS = ('.mp4', '.mov', '.mkv')

class Command(BaseCommand):
    help = 'Import local videos from media/video_raw to media/videos and create Video records with thumbnails'

    def handle(self, *args, **options):
        if not os.path.exists(VIDEO_RAW_DIR):
            self.stdout.write(f"[!] Thư mục không tồn tại: {VIDEO_RAW_DIR}")
            return

        # Đảm bảo các thư mục đích tồn tại
        for directory in [VIDEO_DEST_DIR, THUMBNAIL_DIR]:
            if not os.path.exists(directory):
                os.makedirs(directory)

        files = os.listdir(VIDEO_RAW_DIR)
        count = 0

        for file_name in files:
            if not file_name.lower().endswith(SUPPORTED_EXTENSIONS):
                continue

            source_path = os.path.join(VIDEO_RAW_DIR, file_name)
            title = os.path.splitext(file_name)[0]

            if Video.objects.filter(title=title).exists():
                self.stdout.write(f"[!] Video đã tồn tại: {title}")
                continue

            try:
                # Mở video và lấy thông tin
                clip = VideoFileClip(source_path)
                duration = f"{int(clip.duration // 60)}:{int(clip.duration % 60):02d}"
                
                # Tạo thumbnail từ frame ở giây thứ 2 (hoặc frame cuối nếu video ngắn hơn)
                thumbnail_time = min(2.0, clip.duration / 2)
                thumbnail_name = f"{title}_thumbnail.jpg"
                thumbnail_path = os.path.join(THUMBNAIL_DIR, thumbnail_name)
                
                # Lưu thumbnail
                frame = clip.get_frame(thumbnail_time)
                clip.save_frame(thumbnail_path, t=thumbnail_time)
                
                # Lưu vào database
                video = Video(title=title, duration=duration)
                
                # Lưu file video
                with open(source_path, 'rb') as f:
                    video.video_file.save(file_name, File(f), save=False)
                
                # Lưu file thumbnail
                with open(thumbnail_path, 'rb') as f:
                    video.thumbnail.save(thumbnail_name, File(f), save=False)
                
                # Lưu model
                video.save()
                
                # Xóa file gốc sau khi xử lý
                os.remove(source_path)
                
                self.stdout.write(f"[✓] Đã import video và tạo thumbnail: {title}")
                count += 1
                
                # Đóng clip để giải phóng tài nguyên
                clip.close()
                
            except Exception as e:
                self.stdout.write(f"[✗] Lỗi với {file_name}: {str(e)}")

        self.stdout.write(self.style.SUCCESS(f"✅ Đã import xong {count} video với thumbnail"))