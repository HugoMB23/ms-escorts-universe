import { Cache } from 'cache-manager';
import { HttpStatus } from '@nestjs/common';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';
export declare class HistoryService {
    private cacheManager;
    constructor(cacheManager: Cache);
    uploadHistory(file: Express.Multer.File, uuid?: string, nick?: string, plan?: string): Promise<{
        data: any;
        statusCode: ResponseStatus;
        message: ResponseMessage;
    }>;
    updateHistory(key: string, dataRedis: any, currentData: any): Promise<{
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
            orden: number;
        }[];
    }>;
    getFormatImg(imageName: string): string;
    deleteHistory(historyUrl: string, uuid: string, nick: string): Promise<{
        data: {};
        statusCode: HttpStatus;
        message: string;
    }>;
    deleteHistoryBlob(keyUser: string, folder: string, historyUrl: string): Promise<string>;
}
