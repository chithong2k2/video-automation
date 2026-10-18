/**
 * HAI BƯỚC SUY NGHĨ — brainstorm trước, chọn sau.
 *
 * Vì sao phải tách 2 prompt thay vì nhồi vào 1:
 * Nếu để chung một prompt, model sẽ viết thẳng "scenes" vì JSON cho phép, và bước
 * "suy nghĩ" trở thành mẩu trang trí. Tách thành 2 lần gọi riêng thì:
 *   - Bước 1 có hợp đồng đầu ra riêng (chỉ phương án), không thể lách sang kịch bản.
 *   - Bước 2 nhìn thấy 5 phương án như DỮ LIỆU, nên chấm điểm là chấm thật.
 *   - Log CI in ra được AI đã nghĩ gì và vì sao chọn -> debug được.
 *
 * Bước 1: buildBrainstormPrompt -> 5 phương án khác nhau về bản chất
 * Bước 2: buildScriptPrompt    -> chấm điểm, chọn, rồi viết kịch bản
 */
import { FREE_PRIMITIVES } from "./freeform.mjs";

/** Menu rút gọn — chỉ để model biết cái gì dựng được, KHÔNG phải danh sách để chọn. */
export const PRIMITIVE_MENU = `- cover   : mở đầu, một câu hook
- stat    : MỘT con số lớn, đếm lên
- bars    : so sánh 2-4 con số cùng đơn vị
- compare : hai cột đối chiếu nhiều tiêu chí
- versus  : hai bên đối đầu
- steps   : quy trình nhiều bước
- quote   : một câu trích dẫn
- grid    : lưới ô sáng dần — cho TỶ LỆ và QUY MÔ
- rack    : nhiều hàng khối — cho SỐ LƯỢNG rất lớn
- stream  : dải khối trôi ngang — cho KHỐI LƯỢNG dài
- stamp   : con dấu số + thanh so sánh
- canvas  : TỰ VẼ bằng toạ độ (text, rect, circle, line, polygon, path) trên khung 900x1200
- outro   : kết, kêu gọi theo dõi`;

const fmtNews = (newsItems) =>
  newsItems
    .map(
      (n, i) =>
        `[${i + 1}] ${n.title}\n    Nguồn: ${n.source || n.url || "?"} · ${
          n.publishedDate || "?"
        }\n    ${String(n.text || "").slice(0, 700)}`
    )
    .join("\n\n");

const fmtRecent = (recentTypes) =>
  recentTypes.length
    ? `\n\n## CHUỖI CẢNH CỦA CÁC VIDEO TRƯỚC\n${recentTypes
        .map((t, i) => `- Video trước ${i + 1}: ${t}`)
        .join("\n")}\n\nĐây là những ngữ pháp hình ảnh đã dùng rồi. Phương án của đợt này phải KHÁC
về bản chất, không phải đổi vài cảnh cho có.`
    : "";

// ─── BƯỚC 1: BRAINSTORM ──────────────────────────────────────────────────────
export const buildBrainstormPrompt = (newsItems, bannedExtra = [], recentTypes = []) => {
  const banned = bannedExtra.length
    ? `\n\n## CHỦ ĐỀ ĐÃ LÀM (KHÔNG LÀM LẠI)\n${bannedExtra.map((t) => `- ${t}`).join("\n")}`
    : "";

  return `Bạn là đạo diễn hình ảnh cho Nexo Studio — kênh tin công nghệ tiếng Việt, video dọc.

Nhiệm vụ ĐỢT NÀY chỉ là NGHĨ RA PHƯƠNG ÁN DỰNG HÌNH.
Chưa viết kịch bản. Chưa viết lời thoại. Chưa chọn phương án nào.

## TIN ĐẦU VÀO
${fmtNews(newsItems)}${banned}

## CÔNG CỤ DỰNG HÌNH ĐANG CÓ
${PRIMITIVE_MENU}

Đây KHÔNG phải menu để chọn. Đây là hộp màu. Việc của bạn là nghĩ ra cách kể
riêng cho tin này, rồi xem hộp màu có đủ đồ hay không.${fmtRecent(recentTypes)}

## LUẬT BRAINSTORM

1. Sinh ĐÚNG 5 phương án. Chúng phải khác nhau VỀ BẢN CHẤT — không phải 5 cách
   diễn đạt cùng một ý.
2. "spine" của 5 phương án phải khác nhau: không có hai phương án nào dùng cùng
   một bộ primitive.
3. Phương án id 1 LUÔN là phương án HIỂN NHIÊN NHẤT — cái mà bất kỳ ai cũng nghĩ
   ra đầu tiên. Viết nó ra làm mốc để 4 phương án còn lại vượt qua.
4. Ít nhất 2 phương án phải dùng "canvas" — đó là chỗ duy nhất hình ảnh nói được
   điều mà chữ không nói được.
5. Mỗi phương án phải trả lời được: người xem CẢM thấy gì. Không phải họ ĐỌC thấy gì.
6. Bám sát bản chất dữ liệu: số rất lớn thì phải cho thấy độ lớn; hai bên thì phải
   đặt cạnh nhau; một quá trình thì phải cho thấy thứ tự; một cú sốc thì phải cho
   thấy khoảng cách trước-sau.
7. Không bịa số. Chỉ dùng con số có trong tin.

## ĐỊNH DẠNG ĐẦU RA

Chỉ trả về JSON hợp lệ, không markdown, không giải thích ngoài JSON:

{
  "keyFact": "một câu duy nhất: điều người xem phải nhớ sau khi xem",
  "concepts": [
    {
      "id": 1,
      "label": "TÊN NGẮN 2-4 TỪ, IN HOA",
      "angle": "kể tin này từ góc nào",
      "feel": "người xem phải cảm thấy gì",
      "spine": ["grid", "stamp", "canvas"],
      "opening": "ba cảnh đầu sẽ là gì",
      "why": "vì sao hình này mạnh hơn lời",
      "risk": "điểm yếu của phương án này"
    }
  ]
}`;
};

// ─── BƯỚC 2: CHẤM ĐIỂM + CHỌN + VIẾT KỊCH BẢN ───────────────────────────────
export const buildScriptPrompt = (newsItems, brainstorm, recentTypes = []) => {
  const concepts = (brainstorm?.concepts || [])
    .map(
      (c) =>
        `### Phương án ${c.id} — ${c.label}
- Góc kể: ${c.angle}
- Cảm giác: ${c.feel}
- Bộ xương cảnh: ${(c.spine || []).join(" > ")}
- Mở đầu: ${c.opening}
- Vì sao mạnh: ${c.why}
- Rủi ro: ${c.risk}`
    )
    .join("\n\n");

  return `Bạn là biên kịch video ngắn kiêm motion designer cho Nexo Studio.

Dưới đây là 5 phương án dựng hình đã được brainstorm cho MỘT tin.
Nhiệm vụ: CHẤM ĐIỂM từng phương án, CHỌN một, rồi viết kịch bản theo phương án đó.

## TIN ĐẦU VÀO
${fmtNews(newsItems)}

## ĐIỀU NGƯỜI XEM PHẢI NHỚ
${brainstorm?.keyFact || "(không có)"}

## 5 PHƯƠNG ÁN
${concepts}

## CÁCH CHẤM (mỗi tiêu chí 1-5 điểm)

- dungHop  : hình có nói đúng bản chất tin này không
- roRang   : người xem hiểu mà không cần đọc chữ
- moi      : có tránh được khung quen thuộc không. Phương án hiển nhiên (id 1) bị
             trừ điểm nặng ở tiêu chí này trừ khi nó thật sự là lựa chọn đúng
- khaThi   : có dựng được bằng primitive đang có không

Chọn phương án có TỔNG điểm cao nhất. Được phép LAI hai phương án nếu lai cho ra
kết quả tốt hơn hẳn — nhưng phải ghi rõ lai những phương án nào.
Nếu phương án hiển nhiên thắng, phải giải thích vì sao nó thật sự tốt hơn.

## CÔNG CỤ

${FREE_PRIMITIVES}

## LUẬT VIẾT KỊCH BẢN

1. Chọn ĐÚNG MỘT tin làm chủ đề. Không gộp nhiều tin rời rạc.
2. Cấu trúc: cover (hook) -> 5-7 cảnh thân -> outro. Tổng 7-9 cảnh.
3. Tổng thời lượng 35-45 giây là chuẩn; được phép tới 55 giây nếu cần đủ đất diễn đạt.
4. Bám đúng bộ xương cảnh của phương án đã chọn. Không lặp một loại cảnh quá 2 lần
   trong cùng video. Tuyệt đối không dùng 3 cảnh "bars" liên tiếp.
5. Mỗi video PHẢI có ÍT NHẤT 1 cảnh "canvas" — chỗ duy nhất bạn tự đặt toạ độ.
6. Chỉ dùng primitive có trong danh sách. Không bịa type mới.
7. "accent" phải là một từ CÓ THẬT trong "title", nguyên văn.
8. Mọi con số phải xuất hiện trong tin đầu vào. Không suy diễn, không bịa số.
9. Nếu tin không có số liệu thì KHÔNG dùng "stat"/"bars"/"versus".
10. "note"/"source" phải ghi nguồn thật lấy từ tin đầu vào.
11. Giọng văn: thẳng, cụ thể, không giật tít rỗng. Tiếng Việt có dấu đầy đủ.
12. MỌI cảnh đều PHẢI có "voiceover" — lời đọc thành tiếng. Chữ trên hình viết ngắn.

${fmtRecent(recentTypes)}

## ĐỊNH DẠNG ĐẦU RA

Chỉ trả về JSON hợp lệ, không markdown, không giải thích ngoài JSON:

{
  "decision": {
    "scores": [
      { "id": 1, "dungHop": 4, "roRang": 5, "moi": 2, "khaThi": 5, "total": 16 }
    ],
    "chosen": 3,
    "merged": [3, 5],
    "why": "vì sao chọn phương án này, bằng một đoạn ngắn"
  },
  "metadata": {
    "topic": "...",
    "storyKey": "3-5 từ khoá định danh tin này",
    "category": "AI|TÀI CHÍNH|SẢN PHẨM|CHÍNH SÁCH",
    "concept": "TÊN PHƯƠNG ÁN ĐÃ CHỌN"
  },
  "scenes": [ ... ]
}`;
};
