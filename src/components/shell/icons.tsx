import type { SVGProps } from "react";

function S({ children, ...p }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...p}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" /></S>
);
export const UsersIcon = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3.2 3.2 0 0 1 0 6M17.5 20a6 6 0 0 0-3-5.2" /></S>
);
export const NoteIcon = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><circle cx="7" cy="18" r="2.6" /><circle cx="18" cy="16" r="2.6" /><path d="M9.6 18V6l11-2v10" /></S>
);
export const UserIcon = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><circle cx="12" cy="8" r="3.4" /><path d="M5 20a7 7 0 0 1 14 0" /></S>
);
export const GearIcon = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.2A1.7 1.7 0 0 0 6.2 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 13H4.4a2 2 0 1 1 0-4h.2A1.7 1.7 0 0 0 6.2 6.2L6 6a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 11 4.6V4.4a2 2 0 1 1 4 0v.2A1.7 1.7 0 0 0 17.8 6l.1-.1A2 2 0 1 1 20.7 8.7l-.1.1a1.7 1.7 0 0 0-.3 1.9" /></S>
);
export const BellIcon = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M9.5 19a2.5 2.5 0 0 0 5 0" /></S>
);
export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></S>
);
export const HeartIcon = ({ filled, ...p }: SVGProps<SVGSVGElement> & { filled?: boolean }) => (
  <S {...p} fill={filled ? "currentColor" : "none"}><path d="M12 20s-7-4.4-9.3-9A4.6 4.6 0 0 1 12 6.5 4.6 4.6 0 0 1 21.3 11C19 15.6 12 20 12 20z" /></S>
);
export const VolumeIcon = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M4 9v6h4l5 4V5L8 9H4zM16.5 8.5a5 5 0 0 1 0 7" /></S>
);
export const SlidersIcon = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M4 8h10M18 8h2M4 16h2M10 16h10" /><circle cx="16" cy="8" r="2" /><circle cx="8" cy="16" r="2" /></S>
);
export const ChevronRight = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="m9 6 6 6-6 6" /></S>
);
export const ChevronLeft = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="m15 6-6 6 6 6" /></S>
);
export const VerifiedIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 1.6 14.6 4l3.5-.3.9 3.4 3 1.9-1.4 3.2 1.4 3.2-3 1.9-.9 3.4-3.5-.3L12 22.4 9.4 20l-3.5.3-.9-3.4-3-1.9 1.4-3.2L2 8.6l3-1.9.9-3.4L9.4 4 12 1.6z" />
    <path d="m8.5 12 2.4 2.4 4.6-4.8" fill="none" stroke="var(--canvas)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* transport */
export const PlayGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></svg>
);
export const PauseGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><rect x="6" y="4.5" width="4" height="15" rx="1.5" /><rect x="14" y="4.5" width="4" height="15" rx="1.5" /></svg>
);
export const PrevGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><rect x="5" y="5" width="2.4" height="14" rx="1" /><path d="M20 6.2v11.6a1 1 0 0 1-1.55.83l-8.7-5.8a1 1 0 0 1 0-1.66l8.7-5.8A1 1 0 0 1 20 6.2z" /></svg>
);
export const NextGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><rect x="16.6" y="5" width="2.4" height="14" rx="1" /><path d="M4 6.2v11.6a1 1 0 0 0 1.55.83l8.7-5.8a1 1 0 0 0 0-1.66l-8.7-5.8A1 1 0 0 0 4 6.2z" /></svg>
);
export const ShuffleGlyph = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></S>
);
export const RepeatGlyph = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></S>
);
