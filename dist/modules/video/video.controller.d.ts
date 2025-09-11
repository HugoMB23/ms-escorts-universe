import { VideoService } from './video.service';
import { JwtService } from '../../modules/jwt/jwt.service';
export declare class VideoController {
    private readonly videoService;
    private readonly jwtService;
    constructor(videoService: VideoService, jwtService: JwtService);
    uploadVideo(file: Express.Multer.File, req: Request): Promise<{
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
        data: {
            url: string;
        };
    }>;
    deleteVideo(videoUrl: string, req: Request): Promise<{
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
    }>;
}
