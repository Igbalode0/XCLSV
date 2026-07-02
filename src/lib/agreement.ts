/**
 * The Exclusive Listening Agreement — content and version, shared by the
 * client gate screen and the server acceptance logic. Pure module: no React,
 * no server-only imports.
 *
 * Bumping AGREEMENT_VERSION forces every listener to re-accept before they
 * can enter any room or hear any music (acceptances are stored per version).
 */
export const AGREEMENT_VERSION = "2026-07-01";

export const AGREEMENT_TITLE = "Exclusive Listening Agreement";

export const AGREEMENT_SUBTITLE =
  "You are about to access unreleased music shared in confidence by an artist.";

export const AGREEMENT_INTRO =
  "By accepting this agreement, you acknowledge and agree that:";

export const AGREEMENT_TERMS: string[] = [
  "All music available on XCLSV is private and unreleased.",
  "You may stream the music as many times as you like.",
  "You are NOT permitted to download, screen-record, record externally, redistribute, upload, or share any portion of the music.",
  "Every listening session is associated with your account.",
  "Audio streams may contain unique forensic identifiers used to investigate unauthorized distribution.",
  "Any unauthorized distribution may result in immediate account termination, permanent removal from XCLSV, legal action, and claims for damages where applicable.",
  "Artists trust you with early access.",
];

export const AGREEMENT_CLOSING = "Please respect their work.";

export const AGREEMENT_CONFIRMATION =
  "I have read and understood this agreement.";
