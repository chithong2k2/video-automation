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
        return {
          durationInFrames: props.durationInFrames || 1140,
        };
      }}
      defaultProps={{
        audioUrl: "",
        subtitles: [],
      }}
    />
  );
};
