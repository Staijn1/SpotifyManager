import {HttpException, HttpStatus, Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';
import { SpotifyAuthenticationService } from '../../modules/spotify/authentication/spotify-authentication.service';

@Injectable()
export class SpotifyAuthenticationMiddleware implements NestMiddleware {
  /**
   * Inject dependencies
   * @param spotifyAuthService
   */
  constructor(private readonly spotifyAuthService: SpotifyAuthenticationService) {
  }

  /**
   * Get the token from the request and set it to the spotify library
   * @param req
   * @param res
   * @param next
   */
  use(req: Request, res: Response, next: NextFunction) {
    // The access token can be sent as a query parameter, in the body or as a Bearer token in the Authorization header.
    let accessToken = req.query.accessToken || req.body.accessToken || req.headers.authorization;
    if (!accessToken) throw new HttpException('Spotify access token not provided', HttpStatus.UNAUTHORIZED);

    accessToken = accessToken.replace('Bearer ', '');
    // todo error handling, invalid token crashes the api... wtf?
    this.spotifyAuthService.setAccessToken(accessToken)
    next();
  }
}
