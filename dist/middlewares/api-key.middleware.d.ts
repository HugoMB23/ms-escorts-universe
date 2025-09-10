import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class ApiKeyMiddleware implements NestMiddleware {
    private readonly apiKey;
    use(req: Request, res: Response, next: NextFunction): void;
}
