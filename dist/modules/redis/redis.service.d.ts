import { Cache } from 'cache-manager';
import { ServiceResponse } from '../../interfaces/response.interface';
import { PlansConfigEntity } from '../../common/entity/plans.config.entity';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
export declare class RedisService {
    private plansRepository;
    private cacheManager;
    private readonly redis;
    constructor(plansRepository: Repository<PlansConfigEntity>, cacheManager: Cache, redis: Redis);
    getValueRedis(uuid: string, nick: string): Promise<ServiceResponse<any>>;
    getPlans(): Promise<any>;
    getAllKey(): Promise<ServiceResponse<any>>;
    updateValueRedis(uuid: string, nick: string, data: any): Promise<ServiceResponse<void>>;
    deleteKey(key: string): Promise<void>;
    getProfile(key: string): Promise<ServiceResponse<any>>;
    setProfileInRedis(key: string, profileData: any): Promise<void>;
}
