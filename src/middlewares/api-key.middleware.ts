import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { jwtConstants } from '../utils/constants';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  private readonly apiKey = jwtConstants.secretAdmin; 

  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === this.apiKey) {
      next();
    } else {
      throw new UnauthorizedException('Invalid API Key');
    }
  }
}
