export const DEFAULT_CLOCK_INTERVAL_IN_SECOND = 10

export class ClockManager {
  private intervalToClear: ReturnType<typeof setInterval> | null = null

  constructor(
    private tokenRefreshCallback: () => void,
    private intervalInSecond = DEFAULT_CLOCK_INTERVAL_IN_SECOND
  ) {}

  private get intervalInMillisecond() {
    return this.intervalInSecond * 1000
  }

  start() {
    // Call the token refresh callback immediately
    this.tokenRefreshCallback()

    if (this.intervalToClear) {
      clearInterval(this.intervalToClear)
    }

    this.intervalToClear = setInterval(() => {
      this.tokenRefreshCallback()
    }, this.intervalInMillisecond)
  }
}
