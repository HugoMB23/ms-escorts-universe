import { CoverService } from './cover.service';
import { JwtService } from '../../modules/jwt/jwt.service';
export declare class CoverController {
    private readonly coverService;
    private readonly jwtService;
    constructor(coverService: CoverService, jwtService: JwtService);
    uploadCover(file: Express.Multer.File, req: Request): Promise<{
        data: any;
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
    }>;
}
