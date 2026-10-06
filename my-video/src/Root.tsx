import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { FPS, PROMO_DURATION, RealEstatePromo } from "./RealEstatePromo";
import { ZOHAR_DURATION, ZOHAR_FPS, ZoharCampaign } from "./ZoharCampaign";
import { KARDAN_DURATION, KARDAN_FPS, KardanUziel } from "./KardanUziel";
import { DREAM_DURATION, DREAM_FPS, DreamLottery } from "./DreamLottery";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="RealEstatePromo"
        component={RealEstatePromo}
        durationInFrames={PROMO_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="ZoharCampaign"
        component={ZoharCampaign}
        durationInFrames={ZOHAR_DURATION}
        fps={ZOHAR_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="KardanUziel"
        component={KardanUziel}
        durationInFrames={KARDAN_DURATION}
        fps={KARDAN_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DreamLottery"
        component={DreamLottery}
        durationInFrames={DREAM_DURATION}
        fps={DREAM_FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
