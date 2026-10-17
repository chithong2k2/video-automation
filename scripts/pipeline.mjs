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
  const modelsToTry = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash"];

  const newsText = newsItems
    .map((n, i) => `${i + 1}. ${n.title}: ${n.text?.slice(0, 200) ?? ""}`)
    .join("\n");

  const prompt = `
Bạn là Giám đốc Sáng tạo (Creative Director) của Nexo Studio - Agency chuyên Thiết kế Website và Phát triển Phần mềm Doanh nghiệp tại Việt Nam.

Tin tức công nghệ mới nhất:
${newsText}

Hãy chọn 1 tin tức mang tính xu hướng hoặc bài học cho doanh nghiệp nhất, sau đó viết kịch bản video dọc 30 giây (TikTok/Reels) theo chuẩn format JSON:
{
  "title": "Tiêu đề gây tò mò, giật tít chuyên nghiệp (viết hoa chữ cái đầu)",
  "points": [
    "Luận điểm 1: Nêu vấn đề hoặc insight thực tế doanh nghiệp hay gặp",
    "Luận điểm 2: Giải pháp công nghệ từ Website hoặc Phần mềm tự động hóa",
    "Luận điểm 3: Lợi ích tăng trưởng doanh số hoặc tiết kiệm chi phí"
  ],
  "cta": "Nhắn tin cho Nexo Studio để nhận tư vấn miễn phí!",
  "voiceScript": "Lời thoại đọc cho toàn bộ video. Hãy viết thật tự nhiên, phóng khoáng, cuốn hút và liền mạch như một chuyên gia đang chia sẻ kinh nghiệm thực tế. Có câu mở đầu gây chú ý (hook), giải thích cặn kẽ giải pháp và kết bài kêu gọi liên hệ Nexo Studio. Thoải mái diễn đạt sao cho đọc vừa vặn trọn vẹn trong khoảng 25 đến 28 giây (không quá 30 giây).",
  "hashtags": "#nexostudio #thietkewebsite #phanmemdoanhnghiep #chuyendoiso #congnghe2026",
  "backgroundIndex": 0
}

Chỉ trả về cú pháp JSON hợp lệ, không giải thích gì thêm.
`;

  let lastError;
  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📡 Thử model ${modelName} (Lần ${attempt})...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, "").trim();
        const script = JSON.parse(text);
        console.log(`✅ Script thành công từ [${modelName}]: "${script.title}"`);
        return script;
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ [${modelName}] Lần ${attempt} lỗi: ${err.message}. Đợi 3s...`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  throw lastError;
}

// ─── Bước 3: Tạo giọng đọc Microsoft Edge-TTS siêu tự nhiên ────────────────────
async function generateVoice(voiceScript) {
  console.log("🎙️ Đang tạo giọng đọc Microsoft Neural Voice...");
  const publicAudioPath = path.join(ROOT, "public", "voice.mp3");
  const outAudioPath = path.join(ROOT, "out", "voice.mp3");
  const tempTextPath = path.join(ROOT, "out", "temp_voice.txt");

  fs.mkdirSync(path.join(ROOT, "public"), { recursive: true });
  fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
  fs.writeFileSync(tempTextPath, voiceScript, "utf-8");

  try {
    // Ưu tiên Edge-TTS: Giọng đọc truyền cảm, chuẩn ngữ điệu người thật, không bao giờ ngắt tiếng
    execSync(`python scripts/tts.py "${tempTextPath}" "${publicAudioPath}"`, {
      cwd: ROOT,
      stdio: "inherit",
    });
    fs.copyFileSync(publicAudioPath, outAudioPath);
    console.log("✅ Voice Edge-TTS saved successfully to public/voice.mp3");
    return "voice.mp3";
  } catch (err) {
    console.warn("⚠️ Edge-TTS failed, fallback sang gTTS...", err.message);
    const cleanText = voiceScript.slice(0, 200);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
    const response = await axios.get(ttsUrl, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    fs.writeFileSync(publicAudioPath, Buffer.from(response.data));
    fs.writeFileSync(outAudioPath, Buffer.from(response.data));
    console.log("✅ Voice gTTS saved");
    return "voice.mp3";
  }
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

  try {
    // Đẩy release lên chính repo video-automation (Public)
    execSync(
      `gh release create "${tag}" "${videoPath}#video.mp4" --title "Daily Video ${new Date().toISOString().slice(0, 10)}" --notes "Automated daily video" --repo chithong2k2/video-automation`,
      { stdio: "inherit" }
    );
    const publicUrl = `https://github.com/chithong2k2/video-automation/releases/download/${tag}/video.mp4`;
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
