import { Composition } from "remotion";
import { VideoTemplate } from "./VideoTemplate";
import { FreeVideo, scriptFrames } from "./VideoTemplate/FreeVideo";
import { BeamVideo, BEAM_FRAMES } from "./VideoTemplate/BeamStory";

export const Root: React.FC = () => {
  return (
    <>
      {/* Hệ cũ: kịch bản cố định 6 khung + voiceover + phụ đề karaoke */}
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

      {/* Hệ tự do: AI tự dựng cảnh + graphic từ dữ liệu tin tức */}
      <Composition
        id="FreeVideo"
        component={FreeVideo}
        durationInFrames={1080}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={({ props }: any) => ({
          durationInFrames: scriptFrames(props, 30),
        })}
        defaultProps={{
          brand: "NEXO STUDIO",
          scenes: [],
        }}
      />

      {/* Video một lần: component viết riêng cho tin Beam 501B */}
      <Composition
        id="BeamVideo"
        component={BeamVideo}
        durationInFrames={BEAM_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
