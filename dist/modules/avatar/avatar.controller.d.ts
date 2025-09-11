import { AvatarService } from './avatar.service';
import { JwtService } from '../../modules/jwt/jwt.service';
export declare class AvatarController {
    private readonly avatarService;
    private readonly jwtService;
    constructor(avatarService: AvatarService, jwtService: JwtService);
    uploadAvatar(file: Express.Multer.File, req: Request): Promise<{
        data: any;
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
    }>;
}
