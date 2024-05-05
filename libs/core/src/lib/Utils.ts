export class Utils {
  public static GetOriginalPlaylistIdFromDescription(description?: string | null): string | null {
    if (!description) return null;

    const originalIdRegex = /\{([^}]+)\}/g;
    const matchResult = description.match(originalIdRegex);

    if (matchResult && matchResult.length > 0) {
      return matchResult[0].replace('{', '').replace('}', '');
    }

    return null;
  }
}

export class Stopwatch {
  private startTime: number | undefined;

  public start(): void {
    this.startTime = performance.now();
  }

  public stop(): number {
    if (!this.startTime) {
      throw new Error('Stopwatch has not been started.');
    }

    return performance.now() - this.startTime;
  }
}
