export interface OverlayComponentState {
  showPause: boolean;
  showCountdown: boolean;
  reconnectingTextKey?: string;
  reconnectingTextParams?: Record<string, unknown>;
}
