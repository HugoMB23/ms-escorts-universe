import { JwtPayload } from 'jsonwebtoken';
interface CustomJwtPayload extends JwtPayload {
    sub: string;
    username: string;
    plan: string;
    code: number;
    message: string;
}
export declare class JwtService {
    private readonly JWT_SECRET;
    decodeToken(token: string): CustomJwtPayload;
}
export {};
