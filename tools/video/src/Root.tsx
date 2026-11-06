import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS, H, TOTAL, W } from "./core/timeline";

export const RemotionRoot: React.FC = () => (
  <Composition id="Main" component={Main} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{}} />
);

