/**
 * PROMPT TỰ DO — AI tự biên kịch + tự dựng graphic từ tin tức.
 *
 * Khác với prompt cũ: AI KHÔNG chọn "visualType" từ menu 6 khung cứng, mà tự
 * quyết định kể chuyện bằng cách nào và xuất ra DỮ LIỆU cho từng primitive.
 * Mỗi primitive trong src/VideoTemplate/FreeScenes.tsx render được mọi nội dung
 * khớp schema — nên graphic thật sự thay đổi theo tin.
 */

export const FREE_PRIMITIVES = `
## BỘ PRIMITIVE (13 cái — 8 cái dựng sẵn cho đẹp, "canvas" để tự vẽ,
## "grid/rack/stream/stamp" cho số liệu lớn và tỷ lệ)

### 1. cover — mở đầu, 1 câu gây sốc/tò mò
{ "type":"cover", "seconds":4,
  "kicker":"TÀI CHÍNH AI",              // 1-3 từ, IN HOA
  "title":"70 tỷ USD không có thật",    // 5-9 từ
  "accent":"không",                     // ĐÚNG 1 từ trong title, sẽ tô gradient
  "meta":"Theo CNBC · Bloomberg · 10/2026" }

### 2. stat — MỘT con số duy nhất, đếm lên
{ "type":"stat", "seconds":5,
  "value":50, "unit":"tỷ USD", "decimals":0,
  "label":"Doanh thu niên hóa OpenAI, cuối tháng 9/2026",
  "delta":"Thấp hơn 18 tỷ so với con số đã báo",   // optional
  "deltaTone":"amber",                              // amber|red|green|sky
  "note":"Nguồn: Financial Times" }                 // optional

### 3. bars — so sánh 2-4 con số cùng đơn vị
{ "type":"bars", "seconds":6,
  "title":"Con số đã đổi thế nào",
  "unit":"TỶ USD / NĂM",
  "items":[
    { "label":"Báo cáo hồi tháng 9", "value":68, "suffix":"", "highlight":false },
    { "label":"OpenAI xác nhận",     "value":50, "highlight":true,
      "note":"Doanh thu thuần, không gộp kênh đối tác" },
    { "label":"Mục tiêu cuối 2026",  "value":70, "highlight":false }
  ] }

### 4. compare — hai cách làm / hai bên, đặt cạnh nhau
{ "type":"compare", "seconds":6,
  "title":"Vì sao hai bên lệch nhau",
  "left":{ "name":"OpenAI", "tag":"NET · THUẦN", "tone":"sky",
           "points":["Chỉ tính doanh thu công ty tự thu","Không gộp tiền chảy qua đối tác"] },
  "right":{ "name":"Anthropic", "tag":"GROSS · GỘP", "tone":"violet",
           "points":["Gộp cả doanh thu bán qua AWS, Google Cloud","Con số vì thế trông lớn hơn"] } }

### 5. versus — hai con số đối đầu, nhấn sự lệch
{ "type":"versus", "seconds":5,
  "title":"Nhưng khoan —",
  "a":{ "name":"OpenAI", "value":50, "unit":"tỷ USD · 9/2026" },
  "b":{ "name":"Anthropic", "value":65, "unit":"tỷ USD · 7/2026" },
  "note":"Hai con số này không so sánh được: một bên thuần, một bên gộp." }

### 6. steps — diễn biến theo thời gian (2-4 bước)
{ "type":"steps", "seconds":6,
  "title":"Chuyện gì đã xảy ra",
  "items":[
    { "label":"OpenAI nói với nhà đầu tư", "note":"Doanh thu niên hóa ~50 tỷ USD" },
    { "label":"CNBC xác nhận",             "note":"Con số 68 tỷ trước đó gồm cả doanh thu đối tác" },
    { "label":"Cổ phiếu AI lao dốc",       "note":"Nhóm chip dẫn đầu đà giảm" }
  ] }

### 7. quote — trích dẫn nguyên văn
{ "type":"quote", "seconds":4,
  "text":"Các con số không so sánh được với nhau.",
  "author":"Bloomberg", "source":"10/10/2026" }

### 8. outro — bắt buộc là cảnh CUỐI
{ "type":"outro", "seconds":5,
  "cta":"Theo dõi Nexo Studio",
  "sub":"Tin công nghệ, kể trong 40 giây" }

### 9. canvas — TỰ VẼ. Dùng khi 8 loại trên không diễn đạt được ý bạn muốn.
Không có giới hạn hình thức. Bạn tự đặt hình khối lên khung vẽ 900 × 1200 px
(gốc toạ độ ở góc trên trái). Dùng cho: bản đồ, sơ đồ mạng, timeline ngang,
biểu đồ đặc biệt, so sánh tự do, bất cứ bố cục nào bạn nghĩ ra.

{ "type":"canvas", "seconds":6,
  "elements":[

    // Chữ — dùng x,y là góc trên trái, w là bề rộng khung chữ
    { "kind":"text", "x":0, "y":0, "w":900, "size":44, "weight":900,
      "text":"Trung tâm dữ liệu AI", "align":"left",
      "color":"#F8FAFC", "opacity":1, "lineHeight":1.3, "delay":2 },

    // Chữ nhật
    { "kind":"rect", "x":0, "y":700, "w":640, "h":18, "radius":9,
      "fill":"#38BDF8", "opacity":1, "delay":10 },

    // Tròn — x,y là TÂM
    { "kind":"circle", "x":450, "y":400, "r":90,
      "fill":"rgba(56,189,248,0.15)", "stroke":"#38BDF8", "strokeWidth":2, "delay":12 },

    // Đường thẳng
    { "kind":"line", "x1":100, "y1":300, "x2":800, "y2":300,
      "color":"#8B5CF6", "width":3, "animate":"draw", "delay":14 },

    // Đa giác — dùng cho bản đồ, khối hình bất kỳ
    { "kind":"polygon", "points":[[420,120],[520,140],[560,200]],
      "fill":"rgba(56,189,248,0.1)", "stroke":"#38BDF8", "strokeWidth":2,
      "animate":"draw", "delay":16 },

    // Đường cong SVG — cho hình phức tạp
    { "kind":"path", "d":"M100,500 C300,400 600,700 800,550",
      "fill":"none", "stroke":"#10B981", "strokeWidth":3, "animate":"draw", "delay":18 }
  ] }

Quy tắc cho canvas:
- "kind" chỉ được là: text | rect | circle | line | polygon | path.
- Toạ độ phải nằm trong 900 × 1200. Đừng đặt chữ ở x < 0 hoặc y > 1100.
- "animate": "draw" cho đường/đa giác (vẽ dần), "grow" cho tròn (nở ra), bỏ trống thì trượt vào.
- "delay" là số frame bắt đầu (30 frame = 1 giây). Đặt lệch nhau 4-8 frame để có nhịp.
- Tối đa 30 phần tử. Nhiều hơn thì rối.
- Bản đồ địa lý thật thì toạ độ do bạn ước lượng sẽ méo — chỉ nên dùng cho sơ đồ khái niệm,
  không dùng khi cần đúng vị trí thật.

### 10. grid — lưới N ô, M ô bật sáng. Cho MẬT ĐỘ và TỶ LỆ.
Dùng khi cần cho thấy "chỉ một phần nhỏ" hoặc phân bố trong tổng thể.

{ "type":"grid", "seconds":7,
  "eyebrow":"Mỗi token đi qua",
  "headline":"Chỉ một phần nhỏ bật sáng",
  "cols":27,            // 4-40 cột
  "total":501,          // tổng số ô, tối đa 1200
  "active":23,          // số ô sáng
  "totalUnit":"tỷ",
  "percentLabel":"tham số hoạt động mỗi token",
  "caption":"501 tỷ tham số tổng, nhưng mỗi lần chỉ đánh thức 23 tỷ." }

### 11. rack — số lượng rất lớn, vẽ theo hàng. Cho QUY MÔ.
Dùng khi con số quá lớn để vẽ từng đơn vị: GPU, server, cửa hàng, nhân viên.

{ "type":"rack", "seconds":6,
  "eyebrow":"Để train ra nó",
  "rows":10, "perRow":24, "perRowValue":1050,
  "total":10500, "unit":"GPU GB300", "unitTone":"amber",
  "caption":"10.500 GPU · 4 tuần pre-train + 4 tuần reinforcement learning." }

### 12. stream — dải khối trôi ngang. Cho KHỐI LƯỢNG DÀI.
Dùng cho token, giao dịch, dòng dữ liệu liên tục.

{ "type":"stream", "seconds":5.5,
  "eyebrow":"Cửa sổ ngữ cảnh",
  "blocks":100, "perBlock":10000, "total":1000000,
  "unit":"token", "unitTone":"green",
  "caption":"Mỗi khối tượng trưng 10.000 token. Dải chạy tiếp, không phải toàn bộ." }

### 13. stamp — con dấu + thanh so sánh. Cho PHÊ DUYỆT / GIẤY PHÉP / CHỨNG NHẬN.
Dùng khi tin có một cột mốc long trọng (giấy phép, chứng nhận, thoả thuận) kèm số liệu so sánh.

{ "type":"stamp", "seconds":6.5,
  "stampText":"APACHE 2.0",
  "subtitle":"Không phí, không giới hạn thương mại",
  "stampTone":"green",
  "bars":[
    { "name":"BF16",  "value":2,   "note":"đầy đủ, nặng nhất" },
    { "name":"FP8",   "value":1,   "note":"nửa dung lượng" },
    { "name":"NVFP4", "value":0.5, "note":"nhẹ nhất" }
  ],
  "caption":"Ba định dạng checkpoint · BF16 = 2 byte, FP8 = 1 byte, NVFP4 = 0,5 byte." }
## LỜI THOẠI (bắt buộc, mọi cảnh đều phải có)

Mỗi cảnh có thêm trường "voiceover": câu tiếng Việt sẽ được đọc thành tiếng.

- 14–22 từ mỗi câu. Đọc tự nhiên, như đang nói với người xem, không như đọc báo.
- Câu này KHÔNG hiện trên hình. Chữ trên hình (headline, title, label) viết ngắn;
  voiceover mới là câu nói đầy đủ.
- Đừng lặp lại y nguyên chữ trên hình. Hình và lời phải bổ sung cho nhau.
- Viết số bằng CHỮ để giọng đọc không sai: "mười nghìn năm trăm GPU", "hai mươi ba tỷ",
  "một triệu token", "Apache hai chấm không".
- Từ viết tắt đọc được thì để nguyên (GPU, AI, NVFP4), từ khó đọc thì viết theo âm.
- Tổng độ dài lời thoại quyết định độ dài video. Video sẽ tự dài ra nếu lời dài hơn
  "seconds" khai báo — nên đừng viết quá dài.
- Giọng đọc tiếng Việt chạy khoảng 4 từ/giây. Mục tiêu 35–45 giây, TỔNG số từ của tất
  cả "voiceover" nằm trong khoảng 140–175 từ.
- NHƯNG nếu tin phức tạp, cần thêm đất để diễn đạt cho rõ, được phép dài tới 55 giây
  (khoảng 215 từ). Thà dài mà đủ ý còn hơn ngắn mà cụt nghĩa.
- Trần tuyệt đối là 55 giây. Đếm lại tổng số từ trước khi trả JSON.

Ví dụ một cảnh có đủ:
{ "type":"grid", "seconds":7, "voiceover":"Mỗi lần chạy, chỉ hai mươi ba tỷ tham số được đánh thức. Chưa tới năm phần trăm bộ não đó thực sự hoạt động.",
  "eyebrow":"Mỗi token đi qua", "headline":"Chỉ một phần nhỏ bật sáng",
  "cols":27, "total":501, "active":23, "totalUnit":"tỷ",
  "percentLabel":"tham số hoạt động mỗi token" }

`.trim();

export const buildFreeformPrompt = (newsItems = [], bannedExtra = []) => {
  const news = newsItems
    .map(
      (n, i) =>
        `[${i + 1}] ${n.title}\n    Nguồn: ${n.source || n.url || "?"} · ${
          n.publishedDate || "?"
        }\n    ${String(n.text || "").slice(0, 700)}`
    )
    .join("\n\n");

  const banned = bannedExtra.length
    ? `\n\n## CHỦ ĐỀ ĐÃ LÀM (TUYỆT ĐỐI KHÔNG LẶP LẠI)\n${bannedExtra
        .map((t) => `- ${t}`)
        .join("\n")}`
    : "";

  return `Bạn là biên kịch video ngắn kiêm motion designer cho Nexo Studio — kênh tin công nghệ tiếng Việt.

## NGUYÊN TẮC CAO NHẤT
Bạn KHÔNG chọn từ một danh sách khung có sẵn. Bạn tự quyết định câu chuyện, tự chọn cách thể hiện, và tự mô tả graphic bằng DỮ LIỆU. Video phải khiến người xem hiểu tin này trong 40 giây, không cần đọc chữ.

## TIN TỨC ĐẦU VÀO
${news}${banned}

${FREE_PRIMITIVES}

## LUẬT VIẾT KỊCH BẢN
1. Chọn ĐÚNG MỘT tin làm chủ đề. Không gộp nhiều tin rời rạc.
2. Cấu trúc bắt buộc: cover (hook) → 5-7 cảnh thân → outro. Tổng 7-9 cảnh.
3. Tổng thời lượng 35-45 giây là chuẩn; được phép tới 55 giây nếu cần đủ đất diễn đạt.
4. Dùng ÍT NHẤT 4 loại primitive khác nhau. Không dùng 3 cảnh "bars" liên tiếp.
5. Chỉ dùng primitive có trong danh sách trên. Không bịa type mới.
6. "accent" phải là một từ CÓ THẬT trong "title", nguyên văn.
7. Mọi con số phải xuất hiện trong tin đầu vào. Không suy diễn, không làm tròn bừa, không bịa số.
8. Nếu tin không có số liệu thì KHÔNG dùng "stat"/"bars"/"versus" — dùng cover/compare/steps/quote.
9. "note"/"source" phải ghi nguồn thật lấy từ tin đầu vào.
10. Giọng văn: thẳng, cụ thể, không giật tít rỗng. Tiếng Việt có dấu đầy đủ.
11. MỌI cảnh đều PHẢI có "voiceover" — đó là lời đọc thành tiếng. Chữ hiển thị trên
    hình (title, headline, label) thì viết ngắn, khác với lời đọc.

## ĐỊNH DẠNG ĐẦU RA
Chỉ trả về JSON hợp lệ, không markdown, không giải thích:
{
  "metadata": { "topic": "...", "storyKey": "3-5 từ khoá định danh tin này", "category": "AI|TÀI CHÍNH|SẢN PHẨM|CHÍNH SÁCH" },
  "scenes": [ ... ]
}`;
};
