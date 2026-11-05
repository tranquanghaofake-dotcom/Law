import { Composition } from "remotion";
import { GioiThieu, type Props } from "./GioiThieu";
import { FPS, TOTAL } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition id="GioiThieu" component={GioiThieu} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{ music: false } satisfies Props} />
);
