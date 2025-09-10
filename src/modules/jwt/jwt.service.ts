import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from '../../utils/constants';
import { JwtPayload, TokenExpiredError } from 'jsonwebtoken';

interface CustomJwtPayload extends JwtPayload {
  sub: string;
  username: string;
  plan: string;
  code: number;
  message: string;
}

@Injectable()
export class JwtService {
  private readonly JWT_SECRET = jwtConstants.secretUser;

  decodeToken(token: string): CustomJwtPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as CustomJwtPayload;
      return { ...decoded, code: 200, message: 'Token válido' };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return { sub: '', username: '', plan: '', code: 401, message: 'Token caducado' };
      }
      return { sub: '', username: '', plan: '', code: 400, message: 'Token no válido' };
    }
  }
}
