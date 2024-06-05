export type BlockClockTheme = {
  colors: {
    blockConfirmationColors: string[];
  };
};

export enum StoppedReason {
  PausedNoWifi = "No wifi",
  PausedNotPluggedIn = "Not plugged in",
  PausedManual = "Tap to resume",
  ErrorSystemClock = "System clock",
  ErrorGeneral = "Tap for details",
}

export enum BlockClockState {
  Connecting = "Connecting",
  ErrorConnecting = "Error Connecting",
  WaitingIBD = "Waiting IBD",
  Downloading = "Downloading",
  BlockTime = "Block Time",
  // TODO: Remove?
  Ready = "Ready",
  Stopped = "Stopped",
  LoadingBlocks = "Loading Blocks",
}
