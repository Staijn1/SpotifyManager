import {Injectable} from '@angular/core';
import {CustomError} from '../../types/CustomError';
import {SpotifyError} from '../../types/SpotifyError';

@Injectable({
  providedIn: 'root'
})
export class HTTPService {
  private readonly authenticationErrors: { [key: string]: any } = {
    invalid_grant: {message: 'The provided token or code is not valid or has expired. Please login again.'},
    invalid_client: {message: 'Authentication failed, please login.'},
    invalid_request: {message: 'The request made is not valid.'},
  };

  /**
   * Handle the error from spotify and map it to an error we can show
   * @param {SpotifyError} err
   * @returns {CustomError}
   * @private
   */
  private handleError(err: SpotifyError): CustomError {
    const userFriendlyError: CustomError = {
      code: undefined,
      message: undefined,
    };

    try {
      userFriendlyError.message = (this.authenticationErrors[err.error]).message;
    } catch (e) {
      userFriendlyError.message = 'Something went wrong. We\'re really sorry, please try again.';
    }

    return userFriendlyError;
  }

  /**
   * Helper function to perform a request and handle the response with the error handler.
   * @param input - URL to fetch from
   * @param init - options with request
   */
  protected async request(input: string, init: RequestInit): Promise<any> {
    const response = await fetch(input, init);

    if (!response.ok) {
      const body = await response.json();
      throw this.handleError(body);
    }

    const body = await response.text();
    // If the body is valid JSON, parse it and return it.
    try {
      return JSON.parse(body);
    } catch (e) {
      // If the body is not valid JSON, return the body as is.
      return body;
    }
  }
}