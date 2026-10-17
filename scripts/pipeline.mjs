// pipeline.mjs — Chạy toàn bộ pipeline tự động
// Node.js: fetch news → AI filter → TTS → Render → Upload → Webhook

import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// ─── Config từ env ────────────────────────────────────────────────────────────
const {
  GEMINI_API_KEY,
  EXA_API_KEY,
  GOOGLE_TTS_API_KEY,
  ACTIVEPIECES_WEBHOOK_URL,
  GOOGLE_DRIVE_FOLDER_ID,
} = process.env;

// ─── Bước 1: Tìm tin tức bằng Exa AI ─────────────────────────────────────────
async function fetchNews() {
  console.log("📰 Đang tìm tin tức mới nhất...");

  const keywords = [
    "chuyển đổi số doanh nghiệp Việt Nam",
    "xu hướng thiết kế website 2025",
    "phần mềm quản lý doanh nghiệp SME",
    "công nghệ giúp doanh nghiệp tăng trưởng",
  ];

  const query = keywords[Math.floor(Math.random() * keywords.length)];

  const res = await axios.post(
    "https://api.exa.ai/search",
    {
      query,
      numResults: 5,
      contents: { text: { maxCharacters: 500 } },
      startPublishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    { headers: { "x-api-key": EXA_API_KEY, "Content-Type": "application/json" } }
  );

  console.log(`✅ Tìm được ${res.data.results.length} tin tức`);
  return res.data.results;
}

// ─── Bước 2: Gemini AI lọc + viết script ──────────────────────────────────────
async function generateScript(newsItems) {
  console.log("🤖 Gemini đang viết script video...");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  // Dùng model mới nhất được khuyến nghị bởi Google
  const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });

  const newsText = newsItems
    .map((n, i) => `${i + 1}. ${n.title}: ${n.text?.slice(0, 200) ?? ""}`)
    .join("\n");

  const prompt = `
Bạn là copywriter chuyên tạo nội dung video ngắn cho dịch vụ thiết kế website và phần mềm doanh nghiệp.

Tin tức mới nhất:
${newsText}

Hãy chọn tin phù hợp nhất và tạo script video 30 giây theo format JSON sau:
{
  "title": "Tiêu đề ngắn gọn, gây tò mò (tối đa 10 từ)",
  "points": [
    "Điểm 1 ngắn gọn (tối đa 10 từ)",
    "Điểm 2 ngắn gọn (tối đa 10 từ)",
    "Điểm 3 ngắn gọn (tối đa 10 từ)"
  ],
  "cta": "Call to action ngắn (tối đa 8 từ)",
  "voiceScript": "Script đọc cho toàn bộ video (150-200 từ tiếng Việt, tự nhiên, thân thiện)",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5",
  "backgroundIndex": 0
}

Chỉ trả về JSON, không giải thích thêm.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();

  const script = JSON.parse(text);
  console.log(`✅ Script: "${script.title}"`);
  return script;
}

// ─── Bước 3: Tạo giọng đọc tiếng Việt ─────────────────────────────────────────
async function generateVoice(voiceScript) {
  console.log("🎙️ Đang tạo giọng đọc...");
  const publicAudioPath = path.join(ROOT, "public", "voice.mp3");
  const outAudioPath = path.join(ROOT, "out", "voice.mp3");
  fs.mkdirSync(path.join(ROOT, "public"), { recursive: true });
  fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });

  let audioBuffer;

  if (GOOGLE_TTS_API_KEY) {
    try {
      const res = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
        {
          input: { text: voiceScript },
          voice: {
            languageCode: "vi-VN",
            name: "vi-VN-Neural2-A",
            ssmlGender: "FEMALE",
          },
          audioConfig: { audioEncoding: "MP3", speakingRate: 1.05, pitch: 1.0 },
        }
      );
      audioBuffer = Buffer.from(res.data.audioContent, "base64");
      console.log("✅ Voice Cloud TTS generated");
    } catch (err) {
      console.warn("⚠️ Google Cloud TTS fail, fallback sang gTTS miễn phí...");
    }
  }

  if (!audioBuffer) {
    // Fallback: Google Translate TTS (Miễn phí 100%, không cần API key)
    const cleanText = voiceScript.slice(0, 200);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
    const response = await axios.get(ttsUrl, { responseType: "arraybuffer", headers: { "User-Agent": "Mozilla/5.0" } });
    audioBuffer = Buffer.from(response.data);
    console.log("✅ Voice gTTS generated");
  }

  fs.writeFileSync(publicAudioPath, audioBuffer);
  fs.writeFileSync(outAudioPath, audioBuffer);
  console.log("✅ Voice saved to public/voice.mp3");
  return "voice.mp3";
}

// ─── Bước 4: Render Remotion video ───────────────────────────────────────────
async function renderVideo(script, audioPath) {
  console.log("🎬 Đang render video...");

  const props = JSON.stringify({
    title: script.title,
    points: script.points,
    cta: script.cta,
    audioUrl: audioPath,
    backgroundIndex: script.backgroundIndex ?? 0,
    hashtags: script.hashtags,
  });

  const outPath = path.join(ROOT, "out", "video.mp4");

  execSync(
    `npx remotion render VideoTemplate "${outPath}" --props='${props}'`,
    { cwd: ROOT, stdio: "inherit" }
  );

  console.log("✅ Video rendered:", outPath);
  return outPath;
}

// ─── Bước 5: Upload video lên GitHub Release CDN cho Facebook ─────────────────
async function uploadToDrive(videoPath) {
  console.log("☁️ Đang upload video lên GitHub CDN Storage...");
  const tag = `v${Date.now()}`;
  const fileName = path.basename(videoPath);

  try {
    // Dùng GitHub CLI đẩy lên repo public video-storage
    execSync(
      `gh release create "${tag}" "${videoPath}#video.mp4" --title "Video ${new Date().toISOString().slice(0, 10)}" --notes "Automated video release" --repo chithong2k2/video-storage`,
      { stdio: "inherit" }
    );
    const publicUrl = `https://github.com/chithong2k2/video-storage/releases/download/${tag}/video.mp4`;
    console.log("✅ Upload xong (GitHub CDN direct link):", publicUrl);
    return publicUrl;
  } catch (err) {
    console.error("❌ Lỗi upload GitHub release:", err.message);
    throw err;
  }
}

// ─── Bước 6: Trigger Activepieces webhook ────────────────────────────────────
async function triggerWebhook(videoUrl, script) {
  console.log("🔔 Đang gửi đến Activepieces...");

  await axios.post(ACTIVEPIECES_WEBHOOK_URL, {
    videoUrl,
    title: script.title,
    hashtags: script.hashtags,
    cta: script.cta,
    timestamp: new Date().toISOString(),
  });

  console.log("✅ Webhook triggered!");
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Bắt đầu pipeline...\n");

  try {
    const news = await fetchNews();
    const script = await generateScript(news);
    const audioPath = await generateVoice(script.voiceScript);
    const videoPath = await renderVideo(script, audioPath);
    const videoUrl = await uploadToDrive(videoPath);
    await triggerWebhook(videoUrl, script);

    console.log("\n🎉 Pipeline hoàn thành!");
    console.log("Video URL:", videoUrl);
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
  }
}

main();
