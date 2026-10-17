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

// ─── Bước 1: Exa AI tìm kiếm tin tức thực tế trên Internet ────────────────────
async function fetchNews(topicQuery = "AI startup tech business Vietnam 2026") {
  console.log(`🔍 Exa AI đang tìm kiếm tin tức thật trên Internet theo từ khóa: "${topicQuery}"...`);

  if (!EXA_API_KEY) {
    console.log("⚠️ Không tìm thấy EXA_API_KEY trong môi trường cục bộ. Yêu cầu có EXA_API_KEY để tìm tin tức trực tiếp.");
    return [];
  }

  try {
    const response = await axios.post(
      "https://api.exa.ai/search",
      {
        query: topicQuery,
        numResults: 5,
        useAutoprompt: true,
        contents: { text: { maxCharacters: 800 } },
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

    console.log(`✅ Lấy được ${items.length} tin tức thực tế từ Exa AI`);
    return items;
  } catch (err) {
    console.warn("⚠️ Lỗi gọi Exa AI:", err.message);
    return [];
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PROMPT 1: NEXO STUDIO — AI STORYTELLING & SOFTWARE SOLUTION VIDEO DIRECTOR
// ══════════════════════════════════════════════════════════════════════════════
async function generateStorytellingScript(newsItems) {
  console.log("💡 [PROMPT 1] Kích hoạt NEXO STUDIO — AI STORYTELLING & SOFTWARE SOLUTION VIDEO DIRECTOR...");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const modelsToTry = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash"];

  const contextText = newsItems && newsItems.length > 0
    ? newsItems.map((n, i) => `${i + 1}. ${n.title} (Nguồn: ${n.url || "Web"}): ${n.text?.slice(0, 300) ?? ""}`).join("\n\n")
    : "Tự động hóa quản lý doanh nghiệp, số hóa quy trình kinh doanh, tối ưu trải nghiệm khách hàng.";

  const prompt = `
# NEXO STUDIO — AI STORYTELLING & SOFTWARE SOLUTION VIDEO DIRECTOR

## 1. VAI TRÒ

Bạn là AI Creative Director, Video Scriptwriter, Motion Graphics Designer, UI/UX Designer và Remotion Developer.

Nhiệm vụ của bạn là biến một vấn đề thực tế trong kinh doanh thành video dọc ngắn 25–30 giây, cho thấy vấn đề, giải pháp công nghệ và kết quả mà người xem có thể hình dung được.

Video dành cho Nexo Studio — đơn vị thiết kế website, phát triển phần mềm và tự động hóa quy trình kinh doanh.

Đối tượng xem:
- Chủ cửa hàng và doanh nghiệp nhỏ.
- Người kinh doanh online.
- Trung tâm đào tạo và đơn vị cung cấp dịch vụ.
- Doanh nghiệp đang quản lý công việc bằng Excel, Google Sheets, Zalo hoặc nhiều công cụ rời rạc.
- Người muốn số hóa hoạt động kinh doanh nhưng chưa hiểu rõ về công nghệ.

**NGUYÊN TẮC QUAN TRỌNG NHẤT: SHOW, DON'T JUST TELL.**

Không chỉ nói rằng một doanh nghiệp đang gặp vấn đề. Hãy mô phỏng vấn đề bằng hình ảnh.

Không chỉ nói rằng phần mềm giúp tiết kiệm thời gian. Hãy cho người xem thấy quy trình trước và sau khi sử dụng phần mềm.

Không chỉ hiển thị chữ “Tự động hóa”. Hãy tạo ra một luồng công việc tự động chạy trên màn hình.

Không biến toàn bộ video thành các dòng chữ xuất hiện trên nền gradient.

## 2. CHỌN Ý TƯỞNG VIDEO

Dữ liệu tham khảo:
${contextText}

Chọn một vấn đề kinh doanh cụ thể và một giải pháp có thể giải thích bằng hình ảnh.

Các nhóm chủ đề:
- Website bán hàng và giới thiệu doanh nghiệp.
- Quản lý khách hàng, đơn hàng và nhân viên.
- Quản lý học viên, lịch học, đăng ký và học phí.
- Tự động hóa các tác vụ lặp đi lặp lại.
- Đồng bộ dữ liệu giữa website và các công cụ quản lý.
- Những lỗi thường gặp khi quản lý bằng bảng tính hoặc tin nhắn.
- Trải nghiệm khách hàng kém do quy trình thủ công.
- Những ứng dụng công nghệ đơn giản giúp doanh nghiệp vận hành hiệu quả hơn.

Ưu tiên những tình huống gần gũi, có thể hiểu ngay trong vài giây.

Mỗi video chỉ tập trung vào một vấn đề chính, một giải pháp chính và một lợi ích quan trọng nhất.

Không cố nhồi tất cả dịch vụ của Nexo Studio vào cùng một video.

Không tự bịa số liệu, lời chứng thực, khách hàng, doanh thu, tỷ lệ chuyển đổi hoặc kết quả kinh doanh.

Nếu dùng tình huống giả định để minh họa, hãy xem đó là mô phỏng, không trình bày như một case study có thật.

## 3. THỜI LƯỢNG VÀ ĐỊNH DẠNG

- Thời lượng: 28–35 giây.
- Tỷ lệ: 9:16.
- Độ phân giải: 1080 × 1920.
- Ngôn ngữ: tiếng Việt tự nhiên, ngắn gọn, dễ hiểu.
- Voiceover: khoảng 70–95 từ, điều chỉnh theo tốc độ đọc thực tế.
- Nhịp dựng: nhanh, rõ ràng, có điểm nhấn.
- Phong cách: hiện đại, trực quan, chuyên nghiệp nhưng gần gũi.
- Mỗi cảnh phải đóng góp một chi tiết mới cho câu chuyện.

## 4. BẮT BUỘC KỂ CHUYỆN BẰNG HÌNH ẢNH

Mỗi video cần phối hợp ít nhất 3 loại hình ảnh khác nhau khi nội dung cho phép.

Không dùng một kiểu animation cho toàn bộ video.

### A. Mô phỏng tình huống thực tế
Ví dụ khi nói về việc quản lý đơn hàng thủ công:
- Tin nhắn khách hàng xuất hiện liên tục.
- Chủ cửa hàng chuyển qua lại giữa nhiều cửa sổ.
- Một đơn hàng bị bỏ sót hoặc thông tin khách hàng bị trùng.
- Các thông báo chồng lên nhau để thể hiện sự quá tải.

### B. Mô phỏng giao diện phần mềm
Khi giới thiệu giải pháp, hãy tạo giao diện trực quan như:
- Dashboard quản lý.
- Danh sách khách hàng hoặc học viên.
- Bảng đơn hàng và trạng thái xử lý.
- Lịch học hoặc lịch làm việc.
- Trang quản lý sản phẩm.
- Form đăng ký trên website.
- Bảng thống kê hoặc báo cáo.

### C. Mô phỏng quy trình tự động hóa
Ví dụ:
- Khách gửi form → thông tin xuất hiện trong CRM → hệ thống tạo khách hàng mới → nhân viên nhận thông báo.
- Khách đặt hàng → đơn hàng được ghi nhận → trạng thái được cập nhật → dashboard thay đổi.

### D. Trước và sau khi dùng giải pháp
Khi phù hợp, chia khung hình thành hai phần:
**TRƯỚC:** Nhiều cửa sổ, thao tác thủ công, dữ liệu phân tán.
**SAU:** Một giao diện tập trung, quy trình rõ ràng, thao tác ít hơn.

### E. Biểu đồ và infographic
Dùng khi cần giải thích số lượng bước, luồng dữ liệu hoặc sự khác biệt cũ vs mới.

## 5. CẤU TRÚC PHÂN CẢNH
- Cảnh 1 — Hook (0–4 giây): Tình huống trực quan gây chú ý. Headline ngắn, dễ đọc, tối đa 6–8 từ.
- Cảnh 2 — Vấn đề (4–11 giây): Cho thấy vấn đề đang diễn ra và vì sao nó gây bất tiện.
- Cảnh 3 — Giải pháp (11–20 giây): Đưa giải pháp vào bằng hình ảnh trực quan nhất video (Dashboard, workflow, form).
- Cảnh 4 — Kết quả / Lợi ích (20–27 giây): Cho thấy trạng thái sau khi giải pháp được áp dụng.
- Cảnh 5 — Kết thúc & CTA (27–34 giây): Thông điệp ngắn, dễ nhớ. Nhận diện Nexo Studio tinh tế.

## 6. OUTPUT JSON

Chỉ xuất JSON hợp lệ, không thêm Markdown code fence hoặc giải thích bên ngoài.
Sử dụng cấu trúc:

{
  "metadata": {
    "topic": "Tên chủ đề ngắn gọn",
    "industry": "Ngành nghề",
    "targetAudience": "Chủ shop, Founder, Doanh nghiệp SME",
    "problem": "Vấn đề cốt lõi",
    "solution": "Giải pháp công nghệ",
    "aspectRatio": "9:16",
    "width": 1080,
    "height": 1920,
    "targetDurationSeconds": 32,
    "hashtags": ["#nexostudio", "#thietkewebsite", "#phanmemdoanhnghiep", "#chuyendoiso"]
  },
  "creativeDirection": {
    "creativeConcept": "Mô phỏng quy trình thủ công sang tự động",
    "visualStyle": "Modern Tech Dashboard & Workflow",
    "colorPalette": ["#0B0F19", "#3B82F6", "#10B981", "#F59E0B"],
    "cameraLanguage": "Push in, clean transitions",
    "motionLanguage": "Spring animations, node connections",
    "soundDesign": "Clear voiceover",
    "storytellingApproach": "Problem -> Solution Demo -> Real Impact",
    "avoid": ["Only text on gradient", "Fabricated testimonial"]
  },
  "assets": [],
  "scenes": [
    {
      "id": "scene_01",
      "startSeconds": 0,
      "endSeconds": 4,
      "durationSeconds": 4,
      "purpose": "HOOK",
      "voiceover": "Lời thoại hook ngắn gọn và gây tò mò.",
      "visualType": "REAL_WORLD_SCENARIO",
      "visualDescription": "Mô tả hình ảnh trực quan của hook",
      "mainSubject": "Tình huống quá tải",
      "textOverlays": [
        {
          "text": "Headline hook ngắn gọn (3-8 từ)",
          "role": "HOOK",
          "position": "TOP"
        }
      ]
    },
    {
      "id": "scene_02",
      "startSeconds": 4,
      "endSeconds": 11,
      "durationSeconds": 7,
      "purpose": "PROBLEM",
      "voiceover": "Phân tích vì sao quy trình cũ làm mất khách và lãng phí giờ làm.",
      "visualType": "BEFORE_AFTER",
      "visualDescription": "Mô tả vấn đề cụ thể",
      "mainSubject": "Thực trạng thủ công",
      "textOverlays": [
        {
          "text": "Tiêu đề vấn đề thực tế",
          "role": "PROBLEM",
          "position": "TOP"
        }
      ]
    },
    {
      "id": "scene_03",
      "startSeconds": 11,
      "endSeconds": 20,
      "durationSeconds": 9,
      "purpose": "SOLUTION",
      "voiceover": "Giải thích cách website và phần mềm tự động hóa xử lý trơn tru.",
      "visualType": "UI_MOCKUP",
      "visualDescription": "Mô tả giao diện dashboard quản trị tự động",
      "mainSubject": "Phần mềm Nexo Studio",
      "textOverlays": [
        {
          "text": "Tự động hóa với hệ thống quản trị riêng",
          "role": "SOLUTION",
          "position": "TOP"
        }
      ]
    },
    {
      "id": "scene_04",
      "startSeconds": 20,
      "endSeconds": 27,
      "durationSeconds": 7,
      "purpose": "RESULT",
      "voiceover": "Khắc họa hiệu quả thực tế: tiết kiệm thời gian, tăng trải nghiệm khách hàng.",
      "visualType": "DATA_CHART",
      "visualDescription": "Mô tả số liệu hoặc lợi ích thực tế",
      "mainSubject": "Lợi ích đột phá",
      "textOverlays": [
        {
          "text": "Cắt giảm thời gian thao tác thủ công",
          "role": "RESULT",
          "position": "TOP"
        }
      ]
    },
    {
      "id": "scene_05",
      "startSeconds": 27,
      "endSeconds": 34,
      "durationSeconds": 7,
      "purpose": "CTA",
      "voiceover": "Nhắn tin cho Nexo Studio ngay hôm nay để nhận giải pháp tối ưu cho doanh nghiệp.",
      "visualType": "BRAND_OUTRO",
      "visualDescription": "Nhận diện thương hiệu Nexo Studio và nút CTA",
      "mainSubject": "Call To Action",
      "textOverlays": [
        {
          "text": "Nhắn tin cho Nexo Studio ngay hôm nay",
          "role": "CTA",
          "position": "CENTER"
        }
      ]
    }
  ],
  "voiceoverFullText": "Toàn bộ lời thoại ghép từ 5 scene theo thứ tự, khoảng 70-95 từ tiếng Việt, đọc vừa vặn trong 28-34 giây.",
  "ending": {
    "takeaway": "Giải pháp công nghệ phù hợp giúp doanh nghiệp vận hành trơn tru.",
    "brandName": "Nexo Studio",
    "cta": "Nhắn tin cho Nexo Studio để nhận tư vấn miễn phí"
  },
  "qualityChecks": {
    "problemClearlyVisualized": true,
    "solutionClearlyVisualized": true,
    "beforeAfterContrast": true,
    "multipleVisualTypesUsed": true,
    "visualsBeyondText": true,
    "noFabricatedResults": true,
    "assetsAndFallbacksDefined": true,
    "timelineValid": true,
    "voiceoverTimingChecked": true,
    "jsonValid": true
  }
}
`;

  return await runGeminiGeneration(genAI, modelsToTry, prompt);
}

// ══════════════════════════════════════════════════════════════════════════════
// PROMPT 2: NEXO STUDIO — AI DAILY NEWS VIDEO DIRECTOR
// ══════════════════════════════════════════════════════════════════════════════
async function generateDailyNewsScript(newsItems) {
  console.log("📰 [PROMPT 2] Kích hoạt NEXO STUDIO — AI DAILY NEWS VIDEO DIRECTOR...");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const modelsToTry = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash"];

  const newsText = newsItems && newsItems.length > 0
    ? newsItems.map((n, i) => `${i + 1}. [${n.publishedDate || "Hôm nay"}] ${n.title}\nNguồn: ${n.url || "Nguồn tin cậy"}\nNội dung: ${n.text?.slice(0, 350) ?? ""}`).join("\n\n")
    : "Tin tức công nghệ mới nhất về AI, startup và chuyển đổi số doanh nghiệp 2026.";

  const prompt = `
# NEXO STUDIO — AI DAILY NEWS VIDEO DIRECTOR

## 1. VAI TRÒ

Bạn là một AI Video Director, Motion Graphics Designer, News Editor và Creative Technologist chuyên sản xuất video tin tức ngắn bằng Remotion (React).

Nhiệm vụ của bạn là biến một tin tức thực tế về công nghệ, AI, startup, doanh nghiệp, sản phẩm số hoặc nhà sáng lập thành một video dọc 35–45 giây có hình ảnh phong phú, chuyển động đẹp, dễ hiểu và hấp dẫn.

**NGUYÊN TẮC CỐT LÕI: VIDEO PHẢI KỂ CHUYỆN BẰNG HÌNH ẢNH, KHÔNG PHẢI CHỈ BẰNG CHỮ.**

Không được tạo một video mà phần lớn thời lượng chỉ có headline, subtitle, text animation và background gradient.

Mỗi cảnh phải có một ý tưởng hình ảnh cụ thể giúp người xem hiểu tin tức ngay cả khi chưa đọc hết chữ.

## 2. TÌM VÀ XÁC MINH TIN TỨC

Dữ liệu tin tức mới nhất từ hệ thống tìm kiếm:
${newsText}

Chọn một tin tức mới, đáng chú ý, có giá trị với người xem Việt Nam.
Các nhóm chủ đề:
- AI, công nghệ và sản phẩm mới.
- Startup, nhà sáng lập, gọi vốn và mô hình kinh doanh.
- Chiến lược, thay đổi hoặc sự kiện đáng chú ý của các doanh nghiệp.
- Phần mềm, SaaS, thương mại điện tử và xu hướng chuyển đổi số.
- Những ứng dụng công nghệ đang thay đổi cách doanh nghiệp vận hành.

Yêu cầu:
- Ưu tiên nguồn chính thức, báo chí uy tín và thông báo từ doanh nghiệp.
- Kiểm tra ngày đăng bài và ngày sự kiện thực tế.
- Không tự bịa số liệu, phát ngôn, kết quả kinh doanh hoặc chi tiết sản phẩm.
- Lưu URL nguồn để hiển thị hoặc dẫn nguồn trong video.

## 3. THỜI LƯỢNG VÀ ĐỊNH DẠNG

- Thời lượng mục tiêu: 35–45 giây.
- Tỷ lệ: 9:16 (1080 × 1920).
- Ngôn ngữ: tiếng Việt tự nhiên, dễ hiểu, không dịch máy.
- Giọng đọc: rõ ràng, có nhịp, như một kênh tin công nghệ hiện đại.
- Voiceover mục tiêu: khoảng 85–115 từ, điều chỉnh theo tốc độ giọng đọc thực tế.
- Tốc độ hình ảnh đủ nhanh để giữ sự chú ý nhưng không làm người xem bị quá tải.

## 4. BẮT BUỘC ĐA DẠNG HÌNH ẢNH

- Ảnh thật, footage hoặc card tin tức chính thức (NEWS_INTRO, NEWS_CARD).
- Mô phỏng giao diện sản phẩm (PRODUCT_DEMO, UI_MOCKUP, DASHBOARD).
- Biểu đồ và dữ liệu động (DATA_CHART, HERO_STAT).
- Sơ đồ giải thích công nghệ / AI (WORKFLOW_DIAGRAM).
- Outro thương hiệu Nexo Studio tinh tế (BRAND_OUTRO).

## 5. CẤU TRÚC KỂ CHUYỆN 35–45 GIÂY

- Cảnh 1 — Hook (0–4 giây): Mở đầu bằng hình ảnh mạnh liên quan trực tiếp đến tin tức. Tiêu đề ngắn, dễ đọc.
- Cảnh 2 — Sự kiện chính (4–13 giây): Cho người xem thấy sự kiện thực sự là gì. Hiển thị nguồn tin và thời điểm.
- Cảnh 3 — Chi tiết đáng chú ý (13–24 giây): Minh họa tính năng, sản phẩm, số liệu hoặc cách công nghệ hoạt động.
- Cảnh 4 — Tác động (24–35 giây): Giải thích tin tức có ý nghĩa gì với người dùng hoặc doanh nghiệp.
- Cảnh 5 — Kết luận (35–42 giây): Kết thúc bằng một nhận định ngắn, có giá trị. Outro Nexo Studio tinh tế.

## 6. OUTPUT JSON

Chỉ trả về JSON hợp lệ, không thêm Markdown fence hoặc giải thích bên ngoài.
Sử dụng cấu trúc:

{
  "metadata": {
    "topic": "Tiêu đề ngắn gọn của sự kiện",
    "category": "TECH NEWS",
    "eventDate": "Ngày sự kiện diễn ra",
    "publishedAt": "Ngày đăng của nguồn chính",
    "sourceName": "Tên nguồn chính (VD: TechCrunch, Reuters, VnExpress)",
    "sourceUrl": "URL nguồn chính đã xác minh",
    "additionalSources": [],
    "verificationStatus": "VERIFIED",
    "targetAudience": "Người quan tâm công nghệ và kinh doanh tại Việt Nam",
    "aspectRatio": "9:16",
    "width": 1080,
    "height": 1920,
    "targetDurationSeconds": 40,
    "hashtags": ["#nexostudio", "#congnghe", "#tintuccongnghe", "#startup", "#kinhdoanh"]
  },
  "creativeDirection": {
    "visualConcept": "Editorial Tech News with dynamic mockups and data visuals",
    "visualStyle": "Modern Tech Editorial",
    "colorPalette": ["#0B0F19", "#2563EB", "#10B981", "#38BDF8"],
    "cameraLanguage": "Dynamic push-in & parallax",
    "motionLanguage": "Clean spring reveals and data counters",
    "soundDesign": "Professional news anchor tone",
    "visualVarietyPlan": "News Card -> Product Demo -> Data Visual -> Impact Diagram -> Outro",
    "avoid": ["Text only video", "Unverified claims"]
  },
  "assets": [],
  "scenes": [
    {
      "id": "scene_01",
      "startSeconds": 0,
      "endSeconds": 4,
      "durationSeconds": 4,
      "purpose": "HOOK",
      "voiceover": "Câu mở đầu trực tiếp vào sự kiện gây tò mò.",
      "visualType": "NEWS_INTRO",
      "visualDescription": "Card tiêu điểm tin tức công nghệ",
      "mainSubject": "Sự kiện công nghệ",
      "textOverlays": [
        {
          "text": "Headline chính xác, tạo sự chú ý (3-8 từ)",
          "role": "HEADLINE",
          "position": "TOP"
        }
      ]
    },
    {
      "id": "scene_02",
      "startSeconds": 4,
      "endSeconds": 13,
      "durationSeconds": 9,
      "purpose": "MAIN_EVENT",
      "voiceover": "Giải thích chuyện gì vừa xảy ra một cách ngắn gọn, dễ hiểu.",
      "visualType": "UI_MOCKUP",
      "visualDescription": "Mô phỏng sản phẩm hoặc giao diện công nghệ",
      "mainSubject": "Diễn biến sự kiện",
      "textOverlays": [
        {
          "text": "Diễn biến sự kiện chính vừa công bố",
          "role": "HEADLINE",
          "position": "TOP"
        }
      ]
    },
    {
      "id": "scene_03",
      "startSeconds": 13,
      "endSeconds": 24,
      "durationSeconds": 11,
      "purpose": "DETAILS",
      "voiceover": "Phân tích dữ kiện quan trọng và tính năng đột phá của sản phẩm.",
      "visualType": "DATA_CHART",
      "visualDescription": "Biểu đồ so sánh số liệu thực tế",
      "mainSubject": "Chi tiết công nghệ",
      "textOverlays": [
        {
          "text": "Điểm đột phá khiến sự kiện đáng chú ý",
          "role": "HEADLINE",
          "position": "TOP"
        }
      ]
    },
    {
      "id": "scene_04",
      "startSeconds": 24,
      "endSeconds": 35,
      "durationSeconds": 11,
      "purpose": "IMPACT",
      "voiceover": "Phân tích ý nghĩa và tác động trực tiếp đến doanh nghiệp hoặc thị trường.",
      "visualType": "WORKFLOW_DIAGRAM",
      "visualDescription": "Sơ đồ tác động chuyển đổi số",
      "mainSubject": "Tác động thị trường",
      "textOverlays": [
        {
          "text": "Tác động đến doanh nghiệp và thị trường",
          "role": "HEADLINE",
          "position": "TOP"
        }
      ]
    },
    {
      "id": "scene_05",
      "startSeconds": 35,
      "endSeconds": 41,
      "durationSeconds": 6,
      "purpose": "CONCLUSION",
      "voiceover": "Theo dõi Nexo Studio để cập nhật những diễn biến công nghệ mới nhất mỗi ngày.",
      "visualType": "BRAND_OUTRO",
      "visualDescription": "Outro thương hiệu Nexo Studio Tech News",
      "mainSubject": "Brand Outro",
      "textOverlays": [
        {
          "text": "Theo dõi Nexo Studio để cập nhật tin mới",
          "role": "CTA",
          "position": "CENTER"
        }
      ]
    }
  ],
  "voiceoverFullText": "Toàn bộ lời thoại của 5 scenes ghép thành đoạn hoàn chỉnh, khoảng 85-115 từ tiếng Việt, đọc trong 35-42 giây.",
  "ending": {
    "takeaway": "Ý nghĩa lớn nhất của sự kiện.",
    "engagementQuestion": "Bạn nghĩ gì về xu hướng này?",
    "brandName": "Nexo Studio",
    "cta": "Theo dõi Nexo Studio để cập nhật tin công nghệ và kinh doanh"
  },
  "qualityChecks": {
    "newsVerified": true,
    "sourceUrlsPresent": true,
    "visualsBeyondText": true,
    "multipleVisualTypesUsed": true,
    "visualsRelevantToStory": true,
    "statisticsVerified": true,
    "assetRightsReviewed": true,
    "sceneTimingValid": true,
    "voiceoverTimingChecked": true,
    "fallbacksProvided": true
  }
}
`;

  return await runGeminiGeneration(genAI, modelsToTry, prompt);
}

// ─── Gọi Gemini AI với cơ chế retry an toàn ──────────────────────────────────
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
        const titleText = script.metadata?.topic || script.scenes?.[0]?.textOverlays?.[0]?.text || "Kịch bản Nexo Studio";
        console.log(`✅ AI viết kịch bản thành công từ [${modelName}]: "${titleText}"`);
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

// ─── Bước 4: Render Remotion video từ Props động do AI sinh ra ────────────────
async function renderVideo(script, voiceData) {
  console.log("🎬 Đang render video Remotion...");

  const { audioPath, subtitles } = voiceData;

  // Thời lượng video khớp chuẩn với độ dài giọng nói + 2.0 giây đệm
  let durationInSeconds = script.metadata?.targetDurationSeconds || 36;
  if (subtitles && subtitles.length > 0) {
    const lastWord = subtitles[subtitles.length - 1];
    durationInSeconds = Math.max(28, Math.min(45, Math.ceil(lastWord.end + 2.0)));
  }

  const durationInFrames = durationInSeconds * 30; // 30fps
  console.log(`⏱️ Thời lượng video thực tế: ${durationInSeconds} giây (${durationInFrames} frames)`);

  const propsObj = {
    metadata: script.metadata,
    creativeDirection: script.creativeDirection,
    scenes: (script.scenes || []).map((s) => ({
      id: s.id,
      stepLabel: s.purpose,
      durationInSeconds: s.durationSeconds,
      headline: s.textOverlays?.[0]?.text || s.mainSubject || "",
      bodyText: s.visualDescription || s.voiceover || "",
      icon: s.visualType?.includes("MOCKUP") ? "💻" : s.visualType?.includes("WORKFLOW") ? "⚡" : s.visualType?.includes("CHART") ? "📈" : s.visualType?.includes("BEFORE") ? "⚖️" : "📰",
      visualType: s.visualType,
      voiceover: s.voiceover,
    })),
    ending: script.ending,
    hookScene: {
      title: script.scenes?.[0]?.textOverlays?.[0]?.text || script.metadata?.topic || "Nexo Studio",
      badge: script.metadata?.category || "NEXO STUDIO",
    },
    ctaScene: {
      mainCta: script.ending?.cta || "Nhắn tin cho Nexo Studio",
      offerSubtext: script.ending?.takeaway || "Thiết Kế Website Chuẩn UX/UI • Phần Mềm Tự Động Hóa",
    },
    audioUrl: audioPath,
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

// ─── Bước 6: Trigger Activepieces webhook đăng lên Facebook ───────────────────
async function triggerWebhook(videoUrl, script) {
  console.log("🔔 Đang gửi đến Activepieces...");

  const postTitle = script.metadata?.topic || script.scenes?.[0]?.textOverlays?.[0]?.text || "Video Nexo Studio";
  const postCta = script.ending?.cta || "Theo dõi Nexo Studio";
  const rawHashtags = script.metadata?.hashtags || ["#nexostudio", "#congnghe"];
  const postHashtags = Array.isArray(rawHashtags) ? rawHashtags.join(" ") : rawHashtags;

  await axios.post(ACTIVEPIECES_WEBHOOK_URL, {
    videoUrl,
    title: postTitle,
    hashtags: postHashtags,
    cta: postCta,
    timestamp: new Date().toISOString(),
  });

  console.log("✅ Webhook triggered!");
}

// ─── Main Dispatcher ──────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Bắt đầu pipeline Nexo Studio Multi-Format Video Automation...\n");

  const args = process.argv.slice(2);
  const typeArg = args.find((a) => a.startsWith("--type="))?.split("=")[1] || "auto";

  let videoType = typeArg;

  if (videoType === "auto") {
    // 07:00, 13:00, 16:00, 20:30 VN -> NEWS (4 video tin tức/ngày)
    // 10:00, 18:30 VN -> LESSON (2 video bài học B2B/ngày)
    const nowUtcHours = new Date().getUTCHours();
    const vnHours = (nowUtcHours + 7) % 24;

    console.log(`⏰ Giờ hiện tại (Việt Nam): ${vnHours}:00`);

    if (vnHours >= 9 && vnHours <= 11) {
      videoType = "lesson"; // 10h sáng: Bài học B2B trưa
    } else if (vnHours >= 17 && vnHours <= 19) {
      videoType = "lesson"; // 18h30 tối: Bài học B2B tan sở
    } else {
      videoType = "news"; // 07h, 13h, 16h, 20h: Bản tin công nghệ
    }
  }

  console.log(`📌 Kịch bản được chọn: [${videoType === "news" ? "DAILY TECH NEWS" : "STORYTELLING & SOFTWARE SOLUTION"}]`);

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
      script = await generateStorytellingScript(news);
    }

    const voiceText =
      script.voiceoverFullText ||
      (script.scenes || []).map((s) => s.voiceover).filter(Boolean).join(" ");

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
