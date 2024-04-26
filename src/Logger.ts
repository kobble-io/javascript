export class Logger {
  constructor(private readonly verbose: boolean) {}

  public debug(message: string): void {
    if (!this.verbose) {
      return
    }

    console.log(`[DEBUG] ${message}`)
  }
}
