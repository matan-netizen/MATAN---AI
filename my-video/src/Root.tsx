import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { FPS, PROMO_DURATION, RealEstatePromo } from "./RealEstatePromo";
import { ZOHAR_DURATION, ZOHAR_FPS, ZoharCampaign } from "./ZoharCampaign";
import { KARDAN_DURATION, KARDAN_FPS, KardanUziel } from "./KardanUziel";
import { DREAM_FPS, DreamLottery, dreamDuration } from "./DreamLottery";
import { DreamPoster, POSTER_DURATION, POSTER_FPS } from "./DreamPoster";
import { DreamWinner, WINNER_DURATION, WINNER_FPS } from "./DreamWinner";
import {
  DreamThisYear,
  THIS_YEAR_DURATION,
  THIS_YEAR_FPS,
} from "./DreamThisYear";

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
        defaultProps={{ cut: "full" as const }}
        durationInFrames={dreamDuration("full")}
        fps={DREAM_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DreamLotteryApartment"
        component={DreamLottery}
        defaultProps={{ cut: "apartment" as const }}
        durationInFrames={dreamDuration("apartment")}
        fps={DREAM_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DreamLotteryChesed"
        component={DreamLottery}
        defaultProps={{ cut: "chesed" as const }}
        durationInFrames={dreamDuration("chesed")}
        fps={DREAM_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DreamPoster"
        component={DreamPoster}
        durationInFrames={POSTER_DURATION}
        fps={POSTER_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DreamWinner"
        component={DreamWinner}
        durationInFrames={WINNER_DURATION}
        fps={WINNER_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DreamThisYear"
        component={DreamThisYear}
        durationInFrames={THIS_YEAR_DURATION}
        fps={THIS_YEAR_FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
