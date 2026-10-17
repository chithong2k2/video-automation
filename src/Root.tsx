import { Composition } from "remotion";
import { VideoTemplate } from "./VideoTemplate";

export const Root: React.FC = () => {
  return (
    <Composition
      id="VideoTemplate"
      component={VideoTemplate}
      durationInFrames={1140} // 38 giây mặc định @ 30fps
      fps={30}
      width={1080}
      height={1920} // Chuẩn 9:16 dọc cho Reels & TikTok
      calculateMetadata={({ props }: any) => {
        // Tự động kéo dài thời lượng video khớp với độ dài file voice/subtitles (30s - 45s)
        return {
          durationInFrames: props.durationInFrames || 1140,
        };
      }}
      defaultProps={{
        metadata: {
          categoryTag: "TỐI ƯU VẬN HÀNH",
          topicType: "PRACTICAL_LESSON",
          topic: "Bài học tự động hóa quy trình cho doanh nghiệp vừa và nhỏ",
          sourceUrl: "",
          publishedAt: "",
          targetAudience: "CEO, Founder, chủ doanh nghiệp và quản lý",
          businessGoal: "Tăng nhận diện chuyên môn và tạo khách hàng tiềm năng",
          backgroundIndex: 0,
          aspectRatio: "9:16",
          totalDurationInSeconds: 38,
          hashtags: "#nexostudio #thietkewebsite #phanmemdoanhnghiep #chuyendoiso #congnghe2026",
        },
        hookScene: {
          durationInSeconds: 4,
          badge: "BÀI TOÁN DOANH NGHIỆP",
          title: "Sai lầm khiến 90% doanh nghiệp thất thoát khách hàng âm thầm",
          highlightWord: "thất thoát",
          voiceover: "Nhiều doanh nghiệp chi hàng chục triệu chạy quảng cáo nhưng lại mất khách ở khâu phản hồi.",
          visualType: "TYPOGRAPHY",
          animationType: "SCALE_REVEAL",
        },
        scenes: [
          {
            stepLabel: "THỰC TRẠNG",
            durationInSeconds: 9,
            icon: "📉",
            headline: "Khách hàng rời đi vì quy trình thủ công chậm trễ",
            bodyText: "Dữ liệu rời rạc giữa tin nhắn, file Excel và sổ sách kế toán.",
            highlightWord: "chậm trễ",
            voiceover: "Khi nhân sự bận rộn, tin nhắn của khách bị trôi và thông tin tồn kho không chính xác.",
            visualType: "STATEMENT",
            animationType: "STAGGER_REVEAL",
          },
          {
            stepLabel: "GIẢI PHÁP",
            durationInSeconds: 10,
            icon: "⚙️",
            headline: "Hệ thống Website & Phần mềm tự động hóa theo yêu cầu",
            bodyText: "Đồng bộ đơn hàng, phân luồng chăm sóc khách và báo cáo tự động 24/7.",
            highlightWord: "tự động hóa",
            voiceover: "Một nền tảng quản trị riêng giúp kết nối mọi phòng ban mà không cần tuyển thêm người.",
            visualType: "UI_MOCKUP",
            animationType: "SLIDE_REVEAL",
          },
          {
            stepLabel: "KẾT QUẢ",
            durationInSeconds: 9,
            icon: "📈",
            statHighlight: "TĂNG TỐC ĐỘ GẤP 3 LẦN",
            headline: "Phản hồi khách tức thì và giữ chân khách hàng trung thành",
            bodyText: "Tiết kiệm hàng chục giờ thao tác lặp lại mỗi tuần.",
            highlightWord: "tức thì",
            voiceover: "Doanh nghiệp vận hành trơn tru và tăng trưởng bền vững nhờ số hóa quy trình.",
            visualType: "HERO_STAT",
            animationType: "COUNT_UP",
          },
        ],
        ctaScene: {
          durationInSeconds: 6,
          mainCta: "Nhắn tin cho Nexo Studio",
          offerSubtext: "Nhận tư vấn giải pháp tối ưu cho quy trình doanh nghiệp",
          voiceover: "Nhắn tin cho Nexo Studio ngay hôm nay để nhận giải pháp công nghệ phù hợp nhất.",
          visualType: "BRAND_CTA",
          animationType: "FADE_UP",
        },
        audioUrl: "",
        subtitles: [],
      }}
    />
  );
};
