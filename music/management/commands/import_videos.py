import os
import shutil
from django.core.management.base import BaseCommand
from django.core.files import File
from moviepy import VideoFileClip
from music.models import Video

VIDEO_RAW_DIR = 'media/video_raw'  # Nơi chứa video gốc cần xử lý
VIDEO_DEST_DIR = 'media/videos'    # Nơi lưu video sau xử lý
SUPPORTED_EXTENSIONS = ('.mp4', '.mov', '.mkv')

class Command(BaseCommand):
    help = 'Import local videos from media/video_raw to media/videos and create Video records'

    def handle(self, *args, **options):
        if not os.path.exists(VIDEO_RAW_DIR):
            self.stdout.write(f"[!] Thư mục không tồn tại: {VIDEO_RAW_DIR}")
            return

        files = os.listdir(VIDEO_RAW_DIR)
        count = 0

        for file_name in files:
            if not file_name.lower().endswith(SUPPORTED_EXTENSIONS):
                continue

            source_path = os.path.join(VIDEO_RAW_DIR, file_name)
            dest_path = os.path.join(VIDEO_DEST_DIR, file_name)
            title = os.path.splitext(file_name)[0]

            if Video.objects.filter(title=title).exists():
                self.stdout.write(f"[!] Video đã tồn tại: {title}")
                continue

            try:
                # Lấy thời lượng video
                clip = VideoFileClip(source_path)
                duration = f"{int(clip.duration // 60)}:{int(clip.duration % 60):02d}"

                # Lưu vào database
                with open(source_path, 'rb') as f:
                    video = Video(title=title, duration=duration)
                    video.video_file.save(file_name, File(f), save=True)
                os.remove(source_path)

                # Di chuyển file sau khi xử lý
                if not os.path.exists(VIDEO_DEST_DIR):
                    os.makedirs(VIDEO_DEST_DIR)

                self.stdout.write(f"[✓] Đã import và di chuyển: {title}")
                count += 1
            except Exception as e:
                self.stdout.write(f"[✗] Lỗi với {file_name}: {str(e)}")

        self.stdout.write(self.style.SUCCESS(f"✅ Đã import xong {count} video"))
