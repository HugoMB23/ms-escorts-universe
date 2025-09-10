import { Cache } from 'cache-manager';
import { ServiceResponse } from '../../interfaces/response.interface';
import Redis from 'ioredis';
export declare class RedisService {
    private cacheManager;
    private readonly redis;
    constructor(cacheManager: Cache, redis: Redis);
    getValueRedis(uuid: string, nick: string): Promise<ServiceResponse<any>>;
    getAllKey(): Promise<ServiceResponse<any>>;
    updateValueRedis(uuid: string, nick: string, data: any): Promise<ServiceResponse<void>>;
    deleteKey(key: string): Promise<void>;
    getProfile(key: string): Promise<ServiceResponse<any>>;
    setProfileInRedis(key: string, profileData: any): Promise<void>;
}
