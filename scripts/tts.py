import asyncio
import json
import sys
import edge_tts

async def main():
    if len(sys.argv) < 3:
        print("Usage: python tts.py <text_file> <output_file> [subtitles_file]")
        sys.exit(1)

    text_file = sys.argv[1]
    output_file = sys.argv[2]
    subtitles_file = sys.argv[3] if len(sys.argv) > 3 else "public/subtitles.json"

    with open(text_file, "r", encoding="utf-8") as f:
        text = f.read().strip()

    voice = "vi-VN-HoaiMyNeural"
    communicate = edge_tts.Communicate(text, voice, rate="+5%", pitch="+0Hz")

    word_boundaries = []
    sentence_boundaries = []

    with open(output_file, "wb") as file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start_sec = chunk["offset"] / 10_000_000
                dur_sec = chunk["duration"] / 10_000_000
                word_boundaries.append({
                    "word": chunk["text"],
                    "start": round(start_sec, 3),
                    "end": round(start_sec + dur_sec, 3)
                })
            elif chunk["type"] == "SentenceBoundary":
                s_start = chunk["offset"] / 10_000_000
                s_dur = chunk["duration"] / 10_000_000
                s_words = chunk["text"].split()
                if s_words:
                    total_chars = sum(len(w) for w in s_words)
                    curr_time = s_start
                    for w in s_words:
                        w_dur = (len(w) / max(1, total_chars)) * s_dur
                        sentence_boundaries.append({
                            "word": w,
                            "start": round(curr_time, 3),
                            "end": round(curr_time + w_dur, 3)
                        })
                        curr_time += w_dur

    # Ưu tiên word_boundaries nếu có, nếu không thì dùng sentence_boundaries
    final_words = word_boundaries if word_boundaries else sentence_boundaries

    # Dự phòng khẩn cấp nếu API không trả về boundaries
    if not final_words:
        all_words = text.split()
        avg_w_dur = 0.35
        curr = 0.5
        for w in all_words:
            final_words.append({
                "word": w,
                "start": round(curr, 3),
                "end": round(curr + avg_w_dur, 3)
            })
            curr += avg_w_dur

    with open(subtitles_file, "w", encoding="utf-8") as f:
        json.dump(final_words, f, ensure_ascii=False, indent=2)

    print(f"Generated voice and {len(final_words)} karaoke words successfully.")

if __name__ == "__main__":
    asyncio.run(main())
