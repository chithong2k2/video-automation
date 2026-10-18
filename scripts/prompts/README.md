# Hai loại prompt, hai cách chạy — đừng lẫn

## 1. `freeform.mjs` — chạy trong pipeline, tự động, miễn phí

Prompt này xuất ra **JSON** (danh sách cảnh + dữ liệu). Một lần gọi Gemini, ~5 giây.

```
Exa tìm tin → Gemini sinh JSON → Remotion render → đăng bài
```

Dùng cho cron 6 video/ngày. Không cần người, không cần build.
Chạy: `npm run freeform:live`

## 2. `autonomous-motion-designer.md` — chạy bằng agent, không chạy bằng API

Prompt này yêu cầu AI **viết code TSX, build project, render frame, tự sửa lỗi, render lại**.
Đó là một vòng lặp agent có shell — không phải một lần `generateContent`.

Nếu nhét vào pipeline hiện tại: Gemini trả về code TSX, `JSON.parse` chết, pipeline đứng.
**Không được gọi prompt này từ `pipeline.mjs`.**

Cách chạy đúng — agent ngồi trong repo:

```bash
# ví dụ với một agent CLI có quyền đọc/ghi file + chạy shell
claude -p "$(cat scripts/prompts/autonomous-motion-designer.md)

TIN ĐẦU VÀO:
$(cat out/news-input.json)" \
  --allowedTools "Read,Write,Edit,Bash"
```

Agent sẽ: đọc prompt → tìm tin → viết component mới trong `src/` → `npx remotion render`
→ xem frame → sửa → render lại → để lại file mp4.

Chi phí thật: 10–20 phút và vài trăm nghìn token mỗi video. Chỉ hợp chạy 1 lần/ngày
hoặc theo yêu cầu, không hợp chạy 6 lần/ngày.

## Chọn cái nào

| | freeform (JSON) | autonomous (agent) |
|---|---|---|
| Chạy tự động theo cron | ✅ | ⚠️ được nhưng tốn |
| Concept riêng cho từng tin | một phần | ✅ hoàn toàn |
| Component mới mỗi video | ❌ | ✅ |
| Thời gian | ~3 phút | 10–20 phút |
| Chi phí | ~0 | token + CI minutes |
| Rủi ro | thấp | agent có thể sửa hỏng repo |

Thực tế nên chạy **cả hai**: freeform cho lịch hằng ngày, autonomous cho video "đinh"
mỗi tuần hoặc khi có tin lớn cần hình ảnh đặc biệt.
