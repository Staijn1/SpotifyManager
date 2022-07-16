import {HttpException, HttpStatus, Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';
import {SpotifyService} from '../../spotify/spotify.service';

@Injectable()
export class SpotifyAuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly spotifyService: SpotifyService) {
  }

  use(req: Request, res: Response, next: NextFunction) {
    // The access token can be sent as a query parameter, in the body or as a Bearer token in the Authorization header.
    let accessToken = req.query.accessToken || req.body.accessToken || req.headers.authorization;
    if (!accessToken) throw new HttpException('Access token not provided', HttpStatus.UNAUTHORIZED);

    accessToken = accessToken.replace('Bearer ', '');
    // todo error handling, invalid crashes the api... wtf?
    this.spotifyService.setAccessToken(accessToken)

    next();
  }
}
