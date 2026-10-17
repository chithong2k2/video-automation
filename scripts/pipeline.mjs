import "dotenv/config";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ─── Config & Keys ────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const EXA_API_KEY = process.env.EXA_API_KEY;
const ACTIVEPIECES_WEBHOOK_URL = process.env.ACTIVEPIECES_WEBHOOK_URL;

if (!GEMINI_API_KEY) {
  console.error("❌ Thiếu GEMINI_API_KEY trong .env");
  process.exit(1);
}

// ─── Bước 1: Exa AI lấy tin tức công nghệ / kinh doanh mới nhất ────────────────
async function fetchNews(topicQuery = "AI startup tech business Vietnam 2026") {
  console.log(`🔍 Exa AI đang tìm kiếm tin tức mới nhất theo chủ đề: "${topicQuery}"...`);

  if (!EXA_API_KEY) {
    console.log("⚠️ Không có EXA_API_KEY, dùng tin tức dự phòng.");
    return [
      {
        title: "Anthropic và OpenAI ra mắt thế hệ AI Agent mới có khả năng tự động hóa quy trình phần mềm doanh nghiệp",
        text: "Các mô hình AI mới nhất không chỉ viết code mà còn kết nối trực tiếp với API, quản trị cơ sở dữ liệu và vận hành hệ thống chăm sóc khách hàng tự động 24/7.",
        url: "https://techcrunch.com",
        publishedDate: new Date().toISOString(),
      },
    ];
  }

  try {
    const response = await axios.post(
      "https://api.exa.ai/search",
      {
        query: topicQuery,
        numResults: 5,
        useAutoprompt: true,
        contents: { text: { maxCharacters: 600 } },
      },
      {
        headers: {
          "x-api-key": EXA_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const items = response.data.results.map((r) => ({
      title: r.title,
      text: r.text,
      url: r.url,
      publishedDate: r.publishedDate,
    }));

    console.log(`✅ Lấy được ${items.length} tin tức xác thực từ Exa AI`);
    return items;
  } catch (err) {
    console.warn("⚠️ Lỗi Exa AI, dùng tin tức dự phòng:", err.message);
    return [
      {
        title: "Doanh nghiệp tiết kiệm chi phí vận hành nhờ tối ưu hóa phần mềm quản trị",
        text: "Xu hướng chuyển đổi số mạnh mẽ năm 2026 tập trung vào các hệ sinh thái phần mềm tự động hóa tùy chỉnh theo nhu cầu doanh nghiệp.",
        url: "",
        publishedDate: new Date().toISOString(),
      },
    ];
  }
}

// ─── PROMPT 1: BẢN TIN CÔNG NGHỆ & KINH DOANH HẰNG NGÀY (DAILY TECH NEWS) ──────
async function generateDailyNewsScript(newsItems) {
  console.log("📰 [PROMPT BẢN TIN] Biên tập viên đang viết bản tin công nghệ & kinh doanh (35-45s)...");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const modelsToTry = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash"];

  const newsText = newsItems
    .map(
      (n, i) =>
        `${i + 1}. [${n.publishedDate || "Hôm nay"}] ${n.title}\nNguồn: ${n.url || "Nguồn tin cậy"}\nNội dung: ${n.text?.slice(0, 300) ?? ""}`
    )
    .join("\n\n");

  const prompt = `
# PROMPT AI — NEXO STUDIO DAILY TECH & BUSINESS NEWS

## 1. VAI TRÒ
Bạn là Biên tập viên Tin tức Công nghệ & Kinh doanh, chuyên theo dõi những diễn biến mới nhất có ảnh hưởng đến doanh nghiệp, startup, founder, CEO và ngành công nghệ.
Bạn phụ trách sản xuất video bản tin ngắn hằng ngày cho **Nexo Studio** — đơn vị cung cấp dịch vụ thiết kế website và phát triển phần mềm giải pháp cho doanh nghiệp.
Nhiệm vụ chính là giúp người xem cập nhật tin tức nhanh, hiểu chuyện gì đang xảy ra, vì sao nó đáng quan tâm và có thể ảnh hưởng thế nào đến hoạt động kinh doanh.
Đây là kênh chia sẻ tin tức và góc nhìn chuyên môn, **không phải kênh quảng cáo dịch vụ hay tìm kiếm khách hàng trực tiếp**.

## 2. DỮ LIỆU TIN TỨC MỚI NHẤT
${newsText}

Hãy chọn **1 tin tức mới, đáng chú ý nhất** từ danh sách trên để đưa tin.

## 3. CẤU TRÚC VIDEO — 35 ĐẾN 45 GIÂY
Video có phong cách bản tin công nghệ hiện đại: nhanh, rõ, có chiều sâu, hình ảnh chuyên nghiệp và không mang cảm giác quảng cáo.
- **Scene 1 — Hook / Tin đáng chú ý (0–4 giây):** Mở bằng sự kiện, thay đổi hoặc điểm bất ngờ quan trọng nhất. Tiêu đề mạnh nhưng phải chính xác.
- **Scene 2 — Chuyện gì vừa xảy ra? (4–13 giây):** Truyền đạt sự kiện chính xác và dễ hiểu (Ai, vừa công bố/thay đổi điều gì, khi nào).
- **Scene 3 — Chi tiết đáng chú ý (13–24 giây):** Số liệu được công bố, tính năng mới, quy mô thương vụ hoặc điểm khác biệt.
- **Scene 4 — Tác động / Góc nhìn (24–35 giây):** Phân tích vì sao tin này quan trọng với doanh nghiệp, startup hoặc thị trường. Không biến mọi tin thành bài học đạo lý.
- **Scene 5 — Kết thúc / Outro (35–45 giây):** Tóm tắt ý nghĩa lớn nhất, gợi mở góc nhìn. Outro thương hiệu tinh tế: "Theo dõi Nexo Studio để cập nhật tin mới". Không bắt buộc bán hàng.

## 4. PHONG CÁCH VIẾT VOICEOVER
- Dùng tiếng Việt tự nhiên, rõ ràng, phong thái biên tập viên chuyên môn cao.
- Không đọc lại nguyên văn chữ trên màn hình.
- Độ dài: **khoảng 85–115 từ tiếng Việt**, đọc trọn vẹn trong 35–42 giây.

## 5. ĐỊNH DẠNG JSON ĐẦU RA BẮT BUỘC
Chỉ xuất DUY NHẤT một JSON object hợp lệ, không có markdown code fence:

{
  "metadata": {
    "categoryTag": "TECH NEWS",
    "topicType": "NEWS",
    "topic": "Tiêu đề ngắn gọn của sự kiện",
    "eventDate": "Ngày sự kiện diễn ra",
    "publishedAt": "Ngày đăng của nguồn chính",
    "sourceName": "Tên nguồn (VD: TechCrunch, Reuters, VnExpress)",
    "sourceUrl": "URL nguồn",
    "additionalSources": [],
    "verificationStatus": "VERIFIED",
    "targetAudience": "Founder, CEO, startup và người quan tâm công nghệ",
    "backgroundIndex": 0,
    "aspectRatio": "9:16",
    "totalDurationInSeconds": 38,
    "hashtags": "#nexostudio #congnghe #tintuccongnghe #startup #kinhdoanh"
  },
  "hookScene": {
    "durationInSeconds": 4,
    "badge": "TIN CÔNG NGHỆ 24H",
    "title": "Headline chính xác, tạo sự chú ý (3-8 từ)",
    "highlightWord": "Cụm từ nằm chính xác trong title",
    "voiceover": "Câu mở đầu trực tiếp vào sự kiện.",
    "visualType": "TYPOGRAPHY",
    "animationType": "SCALE_REVEAL"
  },
  "scenes": [
    {
      "stepLabel": "DIỄN BIẾN",
      "durationInSeconds": 9,
      "icon": "📰",
      "headline": "Sự kiện chính vừa diễn ra",
      "bodyText": "Dữ kiện cốt lõi của tin tức (5-14 từ).",
      "highlightWord": "Cụm từ có trong bodyText",
      "voiceover": "Giải thích chuyện gì vừa xảy ra một cách dễ hiểu.",
      "visualType": "NEWS_CARD",
      "animationType": "SLIDE_REVEAL"
    },
    {
      "stepLabel": "CHI TIẾT",
      "durationInSeconds": 11,
      "icon": "🔍",
      "headline": "Điểm mới đáng chú ý",
      "bodyText": "Thông tin mới hoặc dữ kiện quan trọng.",
      "highlightWord": "Cụm từ có trong bodyText",
      "voiceover": "Phân tích dữ kiện và giải thích điểm đột phá.",
      "visualType": "DATA_VISUAL",
      "animationType": "STAGGER_REVEAL"
    },
    {
      "stepLabel": "TÁC ĐỘNG",
      "durationInSeconds": 10,
      "icon": "📊",
      "headline": "Vì sao tin này quan trọng?",
      "bodyText": "Tác động tiềm năng hoặc góc nhìn thực tế.",
      "highlightWord": "Cụm từ có trong bodyText",
      "voiceover": "Phân tích ý nghĩa với doanh nghiệp hoặc thị trường.",
      "visualType": "EDITORIAL",
      "animationType": "FADE_UP"
    }
  ],
  "ctaScene": {
    "durationInSeconds": 6,
    "mainCta": "Theo dõi Nexo Studio để cập nhật tin mới",
    "offerSubtext": "Công nghệ, startup và kinh doanh — ngắn gọn, dễ hiểu",
    "voiceover": "Câu kết súc tích, gợi mở và không quảng cáo dịch vụ trực tiếp.",
    "visualType": "BRAND_OUTRO",
    "animationType": "FADE_UP"
  },
  "voiceoverFullText": "Toàn bộ lời thoại của hookScene, các scenes theo đúng thứ tự và ctaScene, ghép thành một đoạn hoàn chỉnh (khoảng 85-115 từ tiếng Việt, đọc vừa vặn trong 35-42 giây).",
  "editorialNote": "Giải thích ngắn vì sao tin này đáng chú ý."
}
`;

  return await runGeminiGeneration(genAI, modelsToTry, prompt);
}

// ─── PROMPT 2: BÀI HỌC THỰC CHIẾN B2B & TỐI ƯU CHUYỂN ĐỔI (B2B LESSON & CRO) ──
async function generateB2BLessonScript(newsItems) {
  console.log("💡 [PROMPT BÀI HỌC B2B] Giám đốc Sáng tạo đang viết kịch bản bài học thực chiến CRO (30-45s)...");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const modelsToTry = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash"];

  const newsText = newsItems
    .map((n, i) => `${i + 1}. ${n.title}: ${n.text?.slice(0, 250) ?? ""}`)
    .join("\n");

  const prompt = `
Bạn là Giám đốc Sáng tạo Video B2B, chuyên gia Storytelling và tối ưu chuyển đổi (CRO) cho thương hiệu **Nexo Studio** — đơn vị thiết kế website chuyên nghiệp và phát triển phần mềm tự động hóa cho doanh nghiệp.

Dựa vào các diễn biến công nghệ sau:
${newsText}

Hãy chọn **1 bài học thực chiến hoặc vấn đề âm thầm khiến doanh nghiệp mất khách/lãng phí chi phí** dành cho CEO, Founder và quản lý. Liên kết tự nhiên đến giải pháp Website hoặc Phần mềm tự động hóa của Nexo Studio.

Thời lượng mục tiêu: **30 ĐẾN 45 GIÂY**.
Tổng lời thoại: **khoảng 95–130 từ tiếng Việt**, tự nhiên, dứt khoát, chuyên gia chia sẻ kinh nghiệm.
TUYỆT ĐỐI KHÔNG ghi chữ "Luận điểm 1", "Luận điểm 2", "Ý 1".

Định dạng JSON bắt buộc:
{
  "metadata": {
    "categoryTag": "TỐI ƯU VẬN HÀNH",
    "topicType": "PRACTICAL_LESSON",
    "topic": "Chủ đề bài học kinh doanh",
    "sourceUrl": "",
    "publishedAt": "",
    "targetAudience": "CEO, Founder, chủ doanh nghiệp và quản lý",
    "businessGoal": "Tăng nhận diện chuyên môn và tạo khách hàng tiềm năng",
    "backgroundIndex": 0,
    "aspectRatio": "9:16",
    "totalDurationInSeconds": 38,
    "hashtags": "#nexostudio #thietkewebsite #phanmemdoanhnghiep #chuyendoiso #congnghe2026"
  },
  "hookScene": {
    "durationInSeconds": 4,
    "badge": "BÀI HỌC KINH DOANH",
    "title": "Headline gây chú ý đánh trúng nỗi đau (3-8 từ)",
    "highlightWord": "Cụm từ nằm chính xác trong title",
    "voiceover": "Lời mở đầu ngắn, tự nhiên và gây tò mò.",
    "visualType": "TYPOGRAPHY",
    "animationType": "SCALE_REVEAL"
  },
  "scenes": [
    {
      "stepLabel": "THỰC TRẠNG",
      "durationInSeconds": 9,
      "icon": "📉",
      "headline": "Điểm nghẽn thực tế",
      "bodyText": "Mô tả nguyên nhân gốc rễ (5-14 từ).",
      "highlightWord": "Cụm từ có trong bodyText",
      "voiceover": "Phân tích vì sao quy trình cũ làm thất thoát khách hàng hoặc chi phí.",
      "visualType": "STATEMENT",
      "animationType": "STAGGER_REVEAL"
    },
    {
      "stepLabel": "GIẢI PHÁP",
      "durationInSeconds": 10,
      "icon": "⚙️",
      "headline": "Giải pháp công nghệ Nexo Studio",
      "bodyText": "Cách Website hoặc Phần mềm tự động hóa xử lý bài toán trên.",
      "highlightWord": "Cụm từ có trong bodyText",
      "voiceover": "Giải thích giải pháp công nghệ vận hành như thế nào.",
      "visualType": "UI_MOCKUP",
      "animationType": "SLIDE_REVEAL"
    },
    {
      "stepLabel": "KẾT QUẢ",
      "durationInSeconds": 9,
      "icon": "📈",
      "statHighlight": "GIÁ TRỊ CỐT LÕI (VD: CẮT GIẢM 70% THỜI GIAN)",
      "headline": "Lợi ích đột phá đo lường được",
      "bodyText": "Kết quả thực tế cho doanh nghiệp.",
      "highlightWord": "Cụm từ có trong bodyText",
      "voiceover": "Khắc họa lợi ích kinh doanh và góc nhìn chiến lược.",
      "visualType": "HERO_STAT",
      "animationType": "COUNT_UP"
    }
  ],
  "ctaScene": {
    "durationInSeconds": 6,
    "mainCta": "Nhắn tin cho Nexo Studio",
    "offerSubtext": "Nhận tư vấn giải pháp phù hợp với quy trình doanh nghiệp",
    "voiceover": "Câu kết tự nhiên, tin cậy và thúc đẩy người xem nhắn tin.",
    "visualType": "BRAND_CTA",
    "animationType": "FADE_UP"
  },
  "voiceoverFullText": "Toàn bộ lời thoại của hookScene, scenes và ctaScene ghép thành một đoạn hoàn chỉnh (khoảng 95-130 từ tiếng Việt, đọc trong 35-42 giây)."
}
`;

  return await runGeminiGeneration(genAI, modelsToTry, prompt);
}

// Hàm dùng chung gọi Gemini với cơ chế thử lại nhiều model
async function runGeminiGeneration(genAI, modelsToTry, prompt) {
  let lastError;
  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📡 Thử model [${modelName}] (Lần ${attempt})...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, "").trim();
        const script = JSON.parse(text);
        const titleText = script.hookScene?.title || script.title || "Video Nexo Studio";
        console.log(`✅ Kịch bản thành công từ [${modelName}]: "${titleText}"`);
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

// ─── Bước 3: Tạo giọng đọc Microsoft Edge-TTS + Phụ đề Karaoke ─────────────────
async function generateVoice(voiceScript) {
  console.log("🎙️ Đang tạo giọng đọc Microsoft Neural Voice & Karaoke Subtitles...");
  const publicAudioPath = path.join(ROOT, "public", "voice.mp3");
  const outAudioPath = path.join(ROOT, "out", "voice.mp3");
  const publicSubPath = path.join(ROOT, "public", "subtitles.json");
  const outSubPath = path.join(ROOT, "out", "subtitles.json");
  const tempTextPath = path.join(ROOT, "out", "temp_voice.txt");

  fs.mkdirSync(path.join(ROOT, "public"), { recursive: true });
  fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
  fs.writeFileSync(tempTextPath, voiceScript, "utf-8");

  let subtitles = [];

  try {
    // Edge-TTS tạo audio và xuất mốc thời gian từng từ cho Karaoke
    execSync(`python scripts/tts.py "${tempTextPath}" "${publicAudioPath}" "${publicSubPath}"`, {
      cwd: ROOT,
      stdio: "inherit",
    });
    fs.copyFileSync(publicAudioPath, outAudioPath);
    if (fs.existsSync(publicSubPath)) {
      fs.copyFileSync(publicSubPath, outSubPath);
      subtitles = JSON.parse(fs.readFileSync(publicSubPath, "utf-8"));
    }
    console.log(`✅ Voice & ${subtitles.length} Karaoke Subtitles created!`);
  } catch (err) {
    console.warn("⚠️ Edge-TTS failed, fallback sang gTTS...", err.message);
    const cleanText = voiceScript.slice(0, 300);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;
    const response = await axios.get(ttsUrl, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    fs.writeFileSync(publicAudioPath, Buffer.from(response.data));
    fs.writeFileSync(outAudioPath, Buffer.from(response.data));
  }

  return { audioPath: "voice.mp3", subtitles };
}

// ─── Bước 4: Render Remotion video (Thời lượng linh động 35s - 45s) ────────────
async function renderVideo(script, voiceData) {
  console.log("🎬 Đang render video Remotion...");

  const { audioPath, subtitles } = voiceData;

  // Tính toán thời lượng video khớp chuẩn với độ dài giọng nói + 2.0 giây đệm
  let durationInSeconds = script.metadata?.totalDurationInSeconds || 38;
  if (subtitles && subtitles.length > 0) {
    const lastWord = subtitles[subtitles.length - 1];
    durationInSeconds = Math.max(30, Math.min(45, Math.ceil(lastWord.end + 2.0)));
  }

  const durationInFrames = durationInSeconds * 30; // 30fps
  console.log(`⏱️ Thời lượng video: ${durationInSeconds} giây (${durationInFrames} frames)`);

  const propsObj = {
    metadata: script.metadata,
    hookScene: script.hookScene,
    scenes: script.scenes,
    ctaScene: script.ctaScene,
    // Tương thích ngược
    title: script.hookScene?.title || script.title,
    slides: script.scenes,
    cta: script.ctaScene?.mainCta || script.cta,
    audioUrl: audioPath,
    backgroundIndex: script.metadata?.backgroundIndex ?? 0,
    hashtags: script.metadata?.hashtags || script.hashtags,
    subtitles: subtitles,
    durationInFrames: durationInFrames,
  };

  const propsPath = path.join(ROOT, "out", "props.json");
  fs.writeFileSync(propsPath, JSON.stringify(propsObj, null, 2), "utf-8");

  const outPath = path.join(ROOT, "out", "video.mp4");

  execSync(
    `npx remotion render VideoTemplate "${outPath}" --props="${propsPath}"`,
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

  const postTitle = script.hookScene?.title || script.title || "Video Nexo Studio";
  const postCta = script.ctaScene?.mainCta || script.cta || "Theo dõi Nexo Studio";
  const postHashtags = script.metadata?.hashtags || script.hashtags || "#nexostudio #congnghe";

  await axios.post(ACTIVEPIECES_WEBHOOK_URL, {
    videoUrl,
    title: postTitle,
    hashtags: postHashtags,
    cta: postCta,
    timestamp: new Date().toISOString(),
  });

  console.log("✅ Webhook triggered!");
}

// ─── Main Dispatcher: 4 Tin Tức + 2 Bài Học B2B Mỗi Ngày ─────────────────────
async function main() {
  console.log("🚀 Bắt đầu pipeline Nexo Studio Multi-Format Video Automation...\n");

  // Kiểm tra tham số dòng lệnh: --type=news hoặc --type=lesson hoặc auto
  const args = process.argv.slice(2);
  const typeArg = args.find((a) => a.startsWith("--type="))?.split("=")[1] || "auto";

  let videoType = typeArg;

  if (videoType === "auto") {
    // Tự động chọn theo giờ Việt Nam (UTC + 7):
    // 07:00, 13:00, 16:00, 20:00 VN -> NEWS (4 video tin tức/ngày)
    // 10:00, 18:00 VN -> LESSON (2 video bài học B2B/ngày)
    const nowUtcHours = new Date().getUTCHours();
    const vnHours = (nowUtcHours + 7) % 24;

    console.log(`⏰ Giờ hiện tại (Việt Nam): ${vnHours}:00`);

    if (vnHours >= 9 && vnHours <= 11) {
      videoType = "lesson"; // 10h sáng: Bài học B2B trưa
    } else if (vnHours >= 17 && vnHours <= 19) {
      videoType = "lesson"; // 18h tối: Bài học B2B tan sở
    } else {
      videoType = "news"; // 07h, 13h, 16h, 20h: Bản tin công nghệ
    }
  }

  console.log(`📌 Định dạng video được chọn: [${videoType.toUpperCase()}]`);

  try {
    const searchQuery =
      videoType === "news"
        ? "AI startup tech business news update 2026"
        : "business software automation case study B2B growth";

    const news = await fetchNews(searchQuery);

    let script;
    if (videoType === "news") {
      script = await generateDailyNewsScript(news);
    } else {
      script = await generateB2BLessonScript(news);
    }

    // Lấy lời thoại từ voiceoverFullText hoặc ghép từ các phân cảnh
    const voiceText =
      script.voiceoverFullText ||
      [
        script.hookScene?.voiceover,
        ...(script.scenes || []).map((s) => s.voiceover),
        script.ctaScene?.voiceover,
      ]
        .filter(Boolean)
        .join(" ") ||
      script.voiceScript;

    console.log(`📝 Tổng số từ lời thoại: ${voiceText.split(/\s+/).length} từ`);

    const audioData = await generateVoice(voiceText);
    const videoPath = await renderVideo(script, audioData);
    const videoUrl = await uploadToDrive(videoPath);
    await triggerWebhook(videoUrl, script);

    console.log(`\n🎉 Pipeline [${videoType.toUpperCase()}] hoàn thành xuất sắc!`);
    console.log("Video URL:", videoUrl);
  } catch (err) {
    console.error("❌ Lỗi pipeline:", err.message);
    process.exit(1);
  }
}

main();
