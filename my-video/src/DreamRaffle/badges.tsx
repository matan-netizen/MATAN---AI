import React from "react";
import { Pill } from "./components";
import { COLORS, OFFER } from "./theme";

export const OnePlusOne: React.FC<{ delay?: number; size?: number }> = ({ delay = 0, size = 60 }) => (
  <Pill delay={delay} size={size} pulse>
    1+1 – כל כרטיס מוכפל בחינם
  </Pill>
);

export const EarlyBird: React.FC<{ delay?: number; size?: number }> = ({ delay = 0, size = 58 }) => (
  <Pill delay={delay} size={size} bg={COLORS.coral} sub={OFFER.earlyBirdDeadline}>
    מוקדמים: {OFFER.earlyBird} מזומן
  </Pill>
);

export const SuperTicket: React.FC<{ delay?: number; size?: number }> = ({ delay = 0, size = 58 }) => (
  <Pill
    delay={delay}
    size={size}
    bg="linear-gradient(180deg, #FFF0A8, #D4AF37 60%, #A8841F)"
    color="#2E2104"
    sub={`+${OFFER.superTicket} ריהוט ומכשירי חשמל · תוספת ${OFFER.superTicketPrice} להזמנה`}
  >
    SUPER TICKET
  </Pill>
);
