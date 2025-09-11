import { Cache } from 'cache-manager';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';
export declare class VideoService {
    private cacheManager;
    constructor(cacheManager: Cache);
    uploadVideo(file: Express.Multer.File, nick?: string, uuid?: string, plan?: string): Promise<{
        statusCode: ResponseStatus;
        message: ResponseMessage;
        data: {
            url: string;
        };
    }>;
    getFormatVid(videoName: string): string;
    updateAndSaveCache(key: string, data: any): Promise<void>;
    getDataRedis(key: string): Promise<{
        avatar: string;
        cover: string;
        videos: any[];
        histories: any[];
        photos: {
            url: string;
        }[];
    }>;
    deleteVideo(videoUrl: string, uuid: string, nick: string): Promise<{
        statusCode: ResponseStatus;
        message: ResponseMessage;
    }>;
    deleteVideoBlob(keyUser: string, folder: string, videoUrl: string): Promise<string>;
}
