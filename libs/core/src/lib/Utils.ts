export class Utils {
  public static GetOriginalPlaylistIdFromDescription(description?: string | null): string | null {
    if(!description) return null;

    const originalIdRegex = /\{([^}]+)\}/g;
    const matchResult = description.match(originalIdRegex);

    if (matchResult && matchResult.length > 0) {
      return matchResult[0].replace('{', '').replace('}', '');
    }

    return null;
  }
}
