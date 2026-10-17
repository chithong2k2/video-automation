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
    
    sub_maker = edge_tts.SubMaker()
    with open(output_file, "wb") as file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                sub_maker.create_sub((chunk["offset"], chunk["duration"]), chunk["text"])

    # Tạo JSON phụ đề từng từ kèm thời gian (giây)
    words = []
    for (start, end), word in sub_maker.subs:
        words.append({
            "word": word,
            "start": start.total_seconds(),
            "end": end.total_seconds()
        })

    with open(subtitles_file, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=2)

    print(f"✅ Generated voice and {len(words)} karaoke words!")

if __name__ == "__main__":
    asyncio.run(main())
