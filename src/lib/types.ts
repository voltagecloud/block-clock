export type BlockClockTheme = {
  colors: {
    blockConfirmationColors: string[];
  };
};

// TODO: remove
export enum StoppedReason {
  PausedNoWifi = "No wifi",
  PausedNotPluggedIn = "Not plugged in",
  PausedManual = "Tap to resume",
  ErrorSystemClock = "System clock",
  ErrorGeneral = "Tap for details",
}
