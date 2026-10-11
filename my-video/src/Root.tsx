import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { FPS, PROMO_DURATION, RealEstatePromo } from "./RealEstatePromo";
import { ZOHAR_DURATION, ZOHAR_FPS, ZoharCampaign } from "./ZoharCampaign";
import { KARDAN_DURATION, KARDAN_FPS, KardanUziel } from "./KardanUziel";
import {
  DREAM_RAFFLE_DURATION,
  DREAM_RAFFLE_FPS,
  DreamRaffle,
} from "./DreamRaffle";
import {
  DreamRaffleMarket,
  MARKET_DURATION,
  MARKET_FPS,
} from "./DreamRaffleMarket";
import {
  POLITICAL_DURATION,
  POLITICAL_FPS,
  PoliticalAnimation,
} from "./PoliticalAnimation";

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
        durationInFrames={DREAM_RAFFLE_DURATION}
        fps={DREAM_RAFFLE_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DreamRaffleMarket"
        component={DreamRaffleMarket}
        durationInFrames={MARKET_DURATION}
        fps={MARKET_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="PoliticalAnimation"
        component={PoliticalAnimation}
        durationInFrames={POLITICAL_DURATION}
        fps={POLITICAL_FPS}
        width={1280}
        height={720}
      />
    </>
  );
};
