/**
 * CATALOG — nguồn sự thật duy nhất về các component dựng sẵn.
 *
 * File .mjs thuần (không JSX) để cả Node lẫn Remotion đều import được.
 * Prompt được SINH RA từ đây (xem renderCatalog), nên tài liệu không bao giờ lệch code:
 * thêm component mới = thêm một entry, không phải sửa prompt bằng tay.
 */
export const MOTION_CATALOG = [
  {
    id: "kineticheadline",
    name: "KineticHeadline",
    category: "typography",
    description: "Chữ lớn trượt vào từng từ, mask reveal, nhấn từ khoá bằng gradient.",
    useCases: ["hook", "nhấn mạnh", "tiêu đề tin", "câu chốt"],
    defaultSeconds: 4,
    example: `{ "type":"kineticheadline", "seconds":4,
  "kicker":"AN TOÀN AI",
  "text":"Mô hình giả vờ ngoan để qua bài kiểm tra",
  "highlightWords":["giả vờ ngoan"],
  "style":"editorial",     // editorial | minimal | futuristic | poster
  "direction":"mask" }     // mask | up | left`,
  },
  {
    id: "beforeafter",
    name: "BeforeAfter",
    category: "comparison",
    description: "Hai trạng thái xếp trên/dưới: vấn đề cũ ở trên, giải pháp mới ở dưới.",
    useCases: ["điểm đau khách hàng", "chuyển đổi", "trước và sau khi dùng sản phẩm"],
    defaultSeconds: 6,
    example: `{ "type":"beforeafter", "seconds":6,
  "labels":{ "before":"HIỆN TẠI", "after":"SAU KHI ĐỔI" },
  "before":{ "title":"Quản lý thủ công",
             "description":"Dữ liệu nằm rải rác trong nhiều file",
             "points":["Mất 3 giờ mỗi tuần","Không ai biết bản nào đúng"] },
  "after":{  "title":"Quản lý tập trung",
             "description":"Theo dõi trên một hệ thống duy nhất",
             "points":["Cập nhật tức thì","Một nguồn số liệu chung"] },
  "transition":"split-reveal" }   // split-reveal | wipe`,
  },
  {
    id: "timelineflow",
    name: "TimelineFlow",
    category: "sequence",
    description: "Các mốc thời gian hiện lần lượt, đường nối được vẽ dần từ trên xuống.",
    useCases: ["lịch sử công ty", "diễn biến vụ việc", "lộ trình sản phẩm"],
    defaultSeconds: 7,
    example: `{ "type":"timelineflow", "seconds":7,
  "title":"BA MỐC CHÍNH",
  "events":[
    { "date":"03/2026", "title":"Gọi vốn vòng A", "description":"Huy động 200 triệu USD" },
    { "date":"08/2026", "title":"Ra mắt sản phẩm", "description":"Mở cho toàn bộ người dùng" },
    { "date":"10/2026", "title":"Công bố doanh thu", "description":"Chạm 16,8 tỷ USD niên hóa" }
  ] }`,
  },
  {
    id: "processdiagram",
    name: "ProcessDiagram",
    category: "flow",
    description: "Các bước nối tiếp nhau bằng mũi tên, xuất hiện lần lượt theo thứ tự.",
    useCases: ["quy trình", "cách hoạt động", "luồng dữ liệu", "các bước triển khai"],
    defaultSeconds: 7,
    example: `{ "type":"processdiagram", "seconds":7,
  "title":"CÁCH HOẠT ĐỘNG",
  "direction":"zigzag",   // down | zigzag
  "nodes":[
    { "label":"Thu thập dữ liệu", "sub":"Từ 22 ngôn ngữ" },
    { "label":"Huấn luyện mô hình", "sub":"Trên 10.500 GPU" },
    { "label":"Kiểm thử an toàn", "sub":"6.452 lượt đánh giá" }
  ] }`,
  },
  {
    id: "datastory",
    name: "DataStory",
    category: "data",
    description: "Biểu đồ có số đếm lên. Tự chọn kiểu theo dữ liệu: cột, đường xu hướng, hoặc vòng tròn.",
    useCases: ["so sánh số liệu", "xu hướng theo thời gian", "cơ cấu tỷ trọng"],
    defaultSeconds: 6,
    example: `{ "type":"datastory", "seconds":6,
  "chartType":"bars",     // bars | line | donut
  "title":"Doanh thu theo quý",
  "unit":"TỶ USD",
  "data":[
    { "label":"Quý 1", "value":12.4 },
    { "label":"Quý 2", "value":14.1 },
    { "label":"Quý 3", "value":16.8, "highlight":true }
  ],
  "note":"Nguồn: báo cáo tài chính công ty" }`,
  },
  {
    id: "floatingui",
    name: "FloatingUI",
    category: "product",
    description: "Các cửa sổ giao diện bay vào, xếp lớp và tạo chiều sâu. Hợp để khoe sản phẩm.",
    useCases: ["demo sản phẩm", "giới thiệu tính năng", "quảng cáo web/app"],
    defaultSeconds: 6,
    example: `{ "type":"floatingui", "seconds":6,
  "layout":"stack",       // stack | fan | grid
  "depth":1.2,
  "cards":[
    { "title":"Bảng điều khiển", "kind":"dashboard", "accent":"sky",
      "description":"Toàn bộ chỉ số trong một màn hình" },
    { "title":"Quản lý đơn", "kind":"orders", "accent":"violet",
      "metric":"1.284", "metricLabel":"đơn hôm nay" }
  ] }`,
  },
  {
    id: "networkmotion",
    name: "NetworkMotion",
    category: "ambient",
    description: "Mạng node nối nhau, hạt sáng chạy dọc đường nối. Cho hệ sinh thái / hạ tầng.",
    useCases: ["hệ sinh thái", "hạ tầng", "kết nối", "mạng lưới đối tác"],
    defaultSeconds: 5,
    example: `{ "type":"networkmotion", "seconds":5,
  "nodes":16,
  "edges":2,
  "density":1,
  "color":"sky",
  "labels":["GPU","Dữ liệu","Mô hình"],
  "caption":"Một hệ sinh thái, nhiều mắt xích" }`,
  },
  {
    id: "brandendcard",
    name: "BrandEndCard",
    category: "outro",
    description: "Thẻ kết thương hiệu: logo chữ, thông điệp, nút kêu gọi, thông tin liên hệ.",
    useCases: ["kết video", "kêu gọi theo dõi", "chốt quảng cáo"],
    defaultSeconds: 4,
    example: `{ "type":"brandendcard", "seconds":4,
  "brand":"NEXO STUDIO",
  "headline":"Theo dõi để không bỏ lỡ tin công nghệ",
  "cta":"BẤM THEO DÕI",
  "contact":"nexostudio.vn" }`,
  },
];

/** Sinh khối tài liệu cho prompt từ catalog. Không hardcode lại trong prompt. */
export const renderCatalog = () =>
  MOTION_CATALOG.map(
    (c, i) =>
      `### ${i + 1}. ${c.name} — ${c.description}\n` +
      `Hợp cho: ${c.useCases.join(", ")}. Thời lượng gợi ý: ${c.defaultSeconds}s.\n` +
      `\`\`\`\n${c.example}\n\`\`\``
  ).join("\n\n");
