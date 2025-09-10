import { HistoryService } from './history.service';
import { JwtService } from '../../modules/jwt/jwt.service';
export declare class HistoryController {
    private readonly historyService;
    private readonly jwtService;
    constructor(historyService: HistoryService, jwtService: JwtService);
    uploadHistory(file: Express.Multer.File, req: Request): Promise<{
        data: any;
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
    }>;
    deleteHistory(historyUrl: string, req: Request): Promise<{
        data: {};
        statusCode: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
}
