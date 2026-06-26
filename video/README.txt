HERO VIDEO INSTRUCTIONS
════════════════════════════════════════════════════════

Place your MP4 video file here as:
    video/hero.mp4

IDEAL VIDEO CHARACTERISTICS:
────────────────────────────
  • Shot: a slow, steady dolly/push move into or through a
    building (entrance → door → interior). The camera should
    move forward continuously so scrubbing feels like walking.

  • Duration: 15–30 seconds is ideal.
    (longer = slower, more cinematic scroll pacing)

  • Resolution: 1920×1080 or 3840×2160 (4K).
    Wider aspect ratios (2.39:1) are fine — object-cover crops.

  • Format: H.264 MP4 for broadest browser support.
    Keep file size under ~25 MB for fast initial buffering.
    Higher bitrate = smoother frame-seeking.

  • No audio needed — the video is muted by attribute.

FREE VIDEO SOURCES:
───────────────────
  Pexels.com — search "luxury interior", "architecture walk"
  Coverr.co  — curated cinematic clips, free for commercial use
  Mixkit.co  — free stock video

TECHNICAL NOTE:
───────────────
  The video does NOT autoplay. JavaScript drives video.currentTime
  directly from the user's scroll position via spring physics,
  creating a "walk-through" effect. The video must be seekable
  (i.e., an MP4 with a proper moov atom at the start, not a live
  stream). If your browser reports "video not supported", run:
      ffmpeg -i input.mov -vcodec h264 -acodec aac video/hero.mp4
