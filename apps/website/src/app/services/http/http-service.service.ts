import { Injectable } from '@angular/core';
import { Message } from '../../types/Message';
import { SpotifyError } from '../../types/SpotifyError';

@Injectable({
  providedIn: 'root'
})
export class HTTPService {
  private readonly authenticationErrorsMap: Map<string, Message> = new Map([
    ['invalid_grant', new Message('error', 'The provided token or code is not valid or has expired. Please login again.')],
    ['invalid_client', new Message('error', 'Authentication failed, please login.')],
    ['invalid_request', new Message('error', 'The request made is not valid.')]
  ]);


  /**
   * Handle the error from spotify and map it to an error we can show
   * @param {SpotifyError} err
   * @returns {Message}
   * @private
   */
  private handleError(err: SpotifyError): Message {
    const userfriendlyAuthenticationError = this.authenticationErrorsMap.get(err.error);

    if (userfriendlyAuthenticationError) return userfriendlyAuthenticationError;

    return new Message('error', err.error_description ?? (err as unknown as Error).message);
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
      throw new Error('Failed to fetch due to a network error.');
    }

    response = await fetch(input, init);

    if (!response.ok) {
      const body = await response.json();
      throw this.handleError(body);
    }

    const body = await response.text();
    // If the body is valid JSON, parse it and return it.
    try {
      return JSON.parse(body);
    } catch (e) {
      console.error('Failed to parse response body of a failed request to JSON', e);
      return null as T;
    }
  }
}
