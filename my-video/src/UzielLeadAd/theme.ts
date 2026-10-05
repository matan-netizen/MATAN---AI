// Heebo is loaded (from public/fonts) by the RealEstatePromo theme module.
export { FONT_FAMILY } from "../RealEstatePromo/theme";

// Kardan brand palette, sampled from the Uziel brochure.
export const COLORS = {
  blue: "#0E8FC0",
  navy: "#1F4C86",
  copper: "#C9762F",
  copperDark: "#8E3F1E",
  orange: "#D99A45",
  sage: "#6F8571",
  slate: "#2E3A43",
  slateDeep: "#1B242B",
  light: "#ECEEF0",
  white: "#FFFFFF",
};

export const BLUE_GRADIENT = `linear-gradient(100deg, ${COLORS.blue} 0%, ${COLORS.navy} 100%)`;
export const COPPER_GRADIENT = `linear-gradient(100deg, ${COLORS.orange} 0%, ${COLORS.copper} 55%, ${COLORS.copperDark} 100%)`;
export const SAGE_GRADIENT = `linear-gradient(135deg, #9DAF9C 0%, ${COLORS.sage} 100%)`;

export const img = (name: string) => `uziel/${name}.jpg`;

export const PHONE = "*9199";
export const WEBSITE = "kardan-nadlan.co.il";
