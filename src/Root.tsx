import { Composition } from "remotion";
import { VideoTemplate } from "./VideoTemplate";

export const Root: React.FC = () => {
  return (
    <Composition
      id="VideoTemplate"
      component={VideoTemplate}
      durationInFrames={900} // 30 giây @ 30fps
      fps={30}
      width={1080}
      height={1920} // Dọc — chuẩn Reels & TikTok
      defaultProps={{
        title: "Chuyển đổi số cho doanh nghiệp",
        points: [
          "Website chuyên nghiệp tăng uy tín",
          "Phần mềm giúp tiết kiệm 50% thời gian",
          "Giải pháp tùy chỉnh theo từng ngành",
        ],
        cta: "Liên hệ ngay để được tư vấn miễn phí!",
        audioUrl: "",
        backgroundIndex: 0,
        hashtags: "#chuyendoiso #thietkewebsite #phanmem",
      }}
    />
  );
};
