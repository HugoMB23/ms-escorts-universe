import { Cache } from '@nestjs/cache-manager';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';
export declare class CoverService {
    private cacheManager;
    constructor(cacheManager: Cache);
    uploadCover(file: Express.Multer.File, uuid: string, nick: string): Promise<{
        data: any;
        statusCode: ResponseStatus;
        message: ResponseMessage;
    }>;
    updateCover(key: string, dataRedis: any): Promise<{
        data: any;
        statusCode: ResponseStatus;
        message: ResponseMessage;
    }>;
    getDataRedis(key: string): Promise<{
        avatar: string;
        cover: string;
        videos: any[];
        histories: any[];
        photos: {
            url: string;
        }[];
    }>;
}
