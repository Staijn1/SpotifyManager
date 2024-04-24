import { Injectable } from '@angular/core';
import { Message } from '../../types/Message';
import { SpotifyError } from '../../types/SpotifyError';
import { MessageService } from '../message/message.service';

@Injectable({
  providedIn: 'root'
})
export class HTTPService {
  private readonly authenticationErrorsMap: Map<string, Message> = new Map([
    ['invalid_grant', new Message('error', 'The provided token or code is not valid or has expired. Please login again.')],
    ['invalid_client', new Message('error', 'Authentication failed, please login.')],
    ['invalid_request', new Message('error', 'The request made is not valid.')]
  ]);

  constructor(protected readonly messageService: MessageService) {
  }

  /**
   * Handle the error from spotify and map it to an error we can show
   * @param err
   * @private
   */
  private handleError(err: SpotifyError | Error): Message {
    if (!('error_description' in err)) {
      const message = new Message('error', err.message);
      this.messageService.setMessage(message);
      return message;
    }

    const userfriendlyAuthenticationError = this.authenticationErrorsMap.get(err.error);

    if (userfriendlyAuthenticationError) {
      this.messageService.setMessage(userfriendlyAuthenticationError);
      return userfriendlyAuthenticationError;
    }

    const message = new Message('error', err.error_description);
    this.messageService.setMessage(message);
    return message;
  }

  /**
   * Helper function to perform a request and handle the response with the error handler.
   * @param input - URL to fetch from
   * @param init - options with request
   */
  protected async request<T>(input: string, init: RequestInit): Promise<T> {
    let response: Response;

    try {
      response = await fetch(input, init);
    } catch (e) {
      console.error('Failed to fetch', e);
      this.handleError(e as Error);
      throw e;
    }

    if (!response.ok) {
      const body = await response.json();
      throw this.handleError(body);
    }

    const body = await response.text();
    // If body not null and not empty, parse it as JSON, otherwise return null.
    if(!body || body === '') {
      // Cast to any as strict type checking would otherwise not allow this.
      // But T should already be defined as T | null if you know some endpoint can return null
      return null as any;
    }

    // If the body is valid JSON, parse it and return it.
    try {
      return JSON.parse(body);
    } catch (e) {
      console.error('Failed to parse response body of a failed request to JSON', e);
      this.handleError(e as Error);
      throw e;
    }
  }
}
