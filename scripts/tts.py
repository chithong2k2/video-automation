import asyncio
import sys
import edge_tts

async def main():
    if len(sys.argv) < 3:
        print("Usage: python tts.py <text_file> <output_file>")
        sys.exit(1)

    text_file = sys.argv[1]
    output_file = sys.argv[2]

    with open(text_file, "r", encoding="utf-8") as f:
        text = f.read().strip()

    # Giọng nữ Hoài My truyền cảm, tự nhiên như phát thanh viên
    voice = "vi-VN-HoaiMyNeural"
    
    communicate = edge_tts.Communicate(text, voice, rate="+5%", pitch="+0Hz")
    await communicate.save(output_file)
    print(f"✅ Generated high quality voice: {output_file}")

if __name__ == "__main__":
    asyncio.run(main())
