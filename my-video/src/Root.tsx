import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { FPS, PROMO_DURATION, RealEstatePromo } from "./RealEstatePromo";
import { ZOHAR_DURATION, ZOHAR_FPS, ZoharCampaign } from "./ZoharCampaign";
import { KARDAN_DURATION, KARDAN_FPS, KardanUziel } from "./KardanUziel";
import { DreamRaffle, RAFFLE_DURATION, RAFFLE_FPS } from "./DreamRaffle";
import { WINNER_DURATION, WINNER_FPS, WinnerSpot } from "./WinnerSpot";

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
        id="DreamRaffle"
        component={DreamRaffle}
        durationInFrames={RAFFLE_DURATION}
        fps={RAFFLE_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="WinnerSpot"
        component={WinnerSpot}
        durationInFrames={WINNER_DURATION}
        fps={WINNER_FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
