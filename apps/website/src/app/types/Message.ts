export class Message extends Error {
  constructor(
    public severity: 'error' | 'warning' | 'info' | 'success',
    message: string,
    public action?: () => void
  ) {
    super(message);
  }
}
