import {HttpException, HttpStatus, Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';
import {SpotifyService} from '../spotify/spotify.service';

@Injectable()
export class SpotifyAuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly spotifyService: SpotifyService) {
  }

  use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.query.accessToken || req.body.accessToken;

    if (!accessToken) throw new HttpException('Access token not provided', HttpStatus.UNAUTHORIZED);
    // todo error handling, invalid crashes the api... wtf?
    this.spotifyService.setAccessToken(accessToken)

    console.log('SpotifyAuthenticationMiddleware: accessToken:', accessToken);
    next();
  }
}
