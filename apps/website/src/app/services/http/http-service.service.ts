import { Injectable } from '@angular/core';
import { CustomError } from '../../types/CustomError';
import { SpotifyError } from '../../types/SpotifyError';

@Injectable({
  providedIn: 'root'
})
export class HTTPService {
  private readonly authenticationErrorsMap: Map<string, CustomError> = new Map([
    ['invalid_grant', {
      message: 'The provided token or code is not valid or has expired. Please login again.'
    }],
    ['invalid_client', { message: 'Authentication failed, please login.' }],
    ['invalid_request', { message: 'The request made is not valid.' }]
  ]);

  /**
   * Handle the error from spotify and map it to an error we can show
   * @param {SpotifyError} err
   * @returns {CustomError}
   * @private
   */
  private handleError(err: SpotifyError): CustomError {
    const userFriendlyError: CustomError = {
      message: undefined
    };

    const error = this.authenticationErrorsMap.get(err.error);
    if (error) {
      userFriendlyError.message = error.message;
    } else {
      userFriendlyError.message = 'Something went wrong. We\'re really sorry, please try again.';
    }

    return userFriendlyError;
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
      console.error('Failed to fetch', e)
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
      console.error('Failed to parse response body of a failed request to JSON', e)
      return null as T;
    }
  }
}
