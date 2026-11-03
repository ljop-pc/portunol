import type { SVGProps } from "react";

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const IconLearn = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 19.5V5a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2Zm0 0A2 2 0 0 0 6 21.5h12" />
    <path d="M9 7h6M9 10.5h4" />
  </svg>
);
export const IconGrammar = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 6h16M4 12h10M4 18h7" />
    <path d="m15 15 2.5 5 2.5-5M15.8 18.5h3.4" />
  </svg>
);
export const IconVocab = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="13" height="14" rx="2" />
    <path d="M19 8v11a2 2 0 0 1-2 2H8" />
    <path d="M7 10h5M7 14h3" />
  </svg>
);
export const IconChat = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M20 12a7 7 0 0 1-10.4 6.1L4 20l1.6-4.6A7 7 0 1 1 20 12Z" />
    <path d="M9 11h6M9 14h3" />
  </svg>
);
export const IconProgress = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);
export const IconSpeaker = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);
export const IconSpeakerOff = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
    <path d="m16 9 5 6M21 9l-5 6" />
  </svg>
);
export const IconClose = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IconBack = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const IconChevron = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);
export const IconAlert = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
);
