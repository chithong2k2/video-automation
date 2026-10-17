import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export interface SubtitleWord {
  word: string;
  start: number; // tính bằng giây
  end: number;
}

interface KaraokeSubtitlesProps {
  subtitles: SubtitleWord[];
}

export const KaraokeSubtitles: React.FC<KaraokeSubtitlesProps> = ({
  subtitles,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  if (!subtitles || subtitles.length === 0) {
    return null;
  }

  const firstWord = subtitles[0];
  const lastWord = subtitles[subtitles.length - 1];

  // Nếu chưa tới lúc nói hoặc đã nói xong hơn 1.2s thì ẩn phụ đề để màn hình thoáng
  if (currentTime < firstWord.start - 0.5 || currentTime > lastWord.end + 1.2) {
    return null;
  }

  // Tìm từ đang được nói hiện tại
  const currentIndex = subtitles.findIndex(
    (s) => currentTime >= s.start && currentTime <= s.end
  );

  // Hiển thị cụm từ trượt (sliding window 5 từ)
  const activeIndex =
    currentIndex !== -1
      ? currentIndex
      : subtitles.findIndex((s) => s.start > currentTime);
  const targetIndex =
    activeIndex !== -1 ? activeIndex : subtitles.length - 1;

  const windowSize = 5;
  const startIndex = Math.max(0, targetIndex - 2);
  const visibleWords = subtitles.slice(startIndex, startIndex + windowSize);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "14px",
        padding: "18px 36px",
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(20px)",
        borderRadius: "32px",
        border: "1.5px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 10px 35px rgba(0, 0, 0, 0.6)",
        maxWidth: "960px",
        minHeight: "84px",
        margin: "0 auto",
      }}
    >
      {visibleWords.map((item, index) => {
        const isCurrentWord = currentTime >= item.start && currentTime <= item.end;
        const isPastWord = currentTime > item.end;

        return (
          <span
            key={startIndex + index}
            style={{
              fontSize: "42px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: isCurrentWord
                ? "#FACC15" // Màu vàng Karaoke sáng rực
                : isPastWord
                ? "#FFFFFF" // Đã đọc qua -> trắng sáng
                : "rgba(255, 255, 255, 0.38)", // Chưa đọc -> mờ nhẹ
              transform: isCurrentWord ? "scale(1.15)" : "scale(1)",
              textShadow: isCurrentWord
                ? "0 0 25px rgba(250, 204, 21, 0.9), 0 4px 12px rgba(0,0,0,0.8)"
                : "0 2px 8px rgba(0,0,0,0.5)",
              transition: "all 0.08s ease-out",
            }}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
};
