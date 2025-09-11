import { Cache } from 'cache-manager';
import { UpdatePhotoHighlightedDto } from '../../common/dto/profile-path.dto';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';
import { PhotoState } from '../../enum/photoState.enum';
export declare class PhotosService {
    private cacheManager;
    constructor(cacheManager: Cache);
    uploadPhotos(files: Express.Multer.File[], nick?: string, uuid?: string, plan?: string): Promise<{
        statusCode: ResponseStatus;
        message: ResponseMessage;
        data: {
            url: string;
            orden: number;
            highlighted: boolean;
            state: PhotoState;
        }[];
    }>;
    getFomartImg(imageName: string): string;
    updatePhotoHighlighted(uuid: string, nick: string, plan: string, data: UpdatePhotoHighlightedDto): Promise<{
        statusCode: ResponseStatus;
        message: ResponseMessage;
        data: any;
    }>;
    deletePhoto(photoUrl: string, uuid: string, nick: string): Promise<{
        statusCode: ResponseStatus;
        message: ResponseMessage;
    }>;
    updateAndSaveCache(key: string, dataRedis: any): Promise<void>;
    getDataRedis(key: string): Promise<{
        avatar: string;
        cover: string;
        videos: any[];
        histories: any[];
        photos: {
            url: string;
            orden: number;
            state: string;
        }[];
    }>;
    deletePhotoBlob(keyUser: string, folder: string, photoUrl: string): Promise<string>;
}
