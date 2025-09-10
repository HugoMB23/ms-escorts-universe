import { PhotosService } from './photo.service';
import { UpdatePhotoHighlightedDto } from '../../common/dto/profile-path.dto';
import { JwtService } from '../../modules/jwt/jwt.service';
export declare class PhotosController {
    private readonly photosService;
    private readonly jwtService;
    constructor(photosService: PhotosService, jwtService: JwtService);
    uploadPhotos(files: Express.Multer.File[], req: Request): Promise<{
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
        data: {
            url: string;
            orden: number;
            highlighted: boolean;
            state: import("../../enum/photoState.enum").PhotoState;
        }[];
    }>;
    updatePhoto(data: UpdatePhotoHighlightedDto, req: Request): Promise<{
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
        data: any;
    }>;
    deletePhoto(photoUrl: string, req: Request): Promise<{
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
    }>;
}
