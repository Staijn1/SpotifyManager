import {Injectable} from '@angular/core';
import {CustomError} from '../../types/CustomError';
import {SpotifyError} from '../../types/SpotifyError';

@Injectable({
  providedIn: 'root'
})
export class SpotifyErrorService {
  private readonly authenticationErrors = {
    invalid_grant: {message: 'The provided token or code is not valid or has expired. Please try again.'},
    invalid_client: {message: 'Authentication failed, please login.'},
    invalid_request: {message: 'The request made is not valid.'},
  };

  constructor() {
  }

  public handleError(err: SpotifyError): CustomError {
    const userFriendlyError: CustomError = {
      code: undefined,
      message: undefined,
    };

    try {
      userFriendlyError.message = this.authenticationErrors[err.error].message;
    } catch (e) {
      userFriendlyError.message = 'Something went wrong. We\'re really sorry, please try again.';
    }

    return userFriendlyError;
  }
}
