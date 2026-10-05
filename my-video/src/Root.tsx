import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import {
  FOOTAGE_DURATION,
  FOOTAGE_FPS,
  FOOTAGE_H,
  FOOTAGE_W,
  MastovFootage,
} from "./MastovFootage";
import { MASTOV_DURATION, MASTOV_FPS, MastovPresale } from "./MastovPresale";
import { FPS, PROMO_DURATION, RealEstatePromo } from "./RealEstatePromo";
import { UZIEL_DURATION, UZIEL_FPS, UzielLeadAd } from "./UzielLeadAd";
import { ZOHAR_DURATION, ZOHAR_FPS, ZoharCampaign } from "./ZoharCampaign";

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
        id="UzielLeadAd"
        component={UzielLeadAd}
        durationInFrames={UZIEL_DURATION}
        fps={UZIEL_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="MastovPresale"
        component={MastovPresale}
        durationInFrames={MASTOV_DURATION}
        fps={MASTOV_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="MastovFootage"
        component={MastovFootage}
        durationInFrames={FOOTAGE_DURATION}
        fps={FOOTAGE_FPS}
        width={FOOTAGE_W}
        height={FOOTAGE_H}
      />
    </>
  );
};
