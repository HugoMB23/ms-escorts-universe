import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ServiceResponse } from '../../interfaces/response.interface';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';

import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('REDIS') private readonly redis: Redis
) {}

  async getValueRedis(
    uuid: string,
    nick: string,
  ): Promise<ServiceResponse<any>> {
    const keyRedis = `${uuid}_${nick}`;
    const value = await this.cacheManager.get(keyRedis);
    if (value) {
      return {
        statusCode: ResponseStatus.SUCCESS,
        message: ResponseMessage.REDIS_KEY_FOUND,
        data: value,
      };
    } else {
      return {
        data: {
          avatar: '',
          cover: '',
          videos: [],
          histories: [],
          photos: [],
        },
        statusCode: ResponseStatus.NOT_FOUND,
        message: ResponseMessage.REDIS_KEY_NOT_FOUND,
      };
    }
  }
  async getAllKey(): Promise<ServiceResponse<any>> {
    try {
      const keysToIgnore = [
        'mykey',
        'plansUniverse',
        'user_2030304',
        'nationalities_redis',
        'region_redis',
      ];
  
      const allKeys = await this.redis.keys('*');
  
      const filteredKeys = allKeys.filter(
        (key) =>
          !keysToIgnore.includes(key) &&         // ❌ no está en la lista de claves ignoradas
          !key.startsWith('profile_')            // ❌ no comienza con "profile_"
      );
  
      const results: { key: string; value: any }[] = [];
  
      for (const key of filteredKeys) {
        const jsonData = await this.redis.get(key);
        if (!jsonData) continue;
  
        const data = JSON.parse(jsonData);
        results.push({ key, value: data });
      }
  
      return {
        statusCode: 201,
        message: 'Claves Redis encontradas',
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: 500,
          message: 'Error al obtener claves de Redis',
        },
        500,
      );
    }
  }

  async updateValueRedis(
    uuid: string,
    nick: string,
    data: any,
  ): Promise<ServiceResponse<void>> {
    const keyRedis = `${uuid}_${nick}`;
    await this.cacheManager.set(keyRedis, data);
    return {
      statusCode: ResponseStatus.SUCCESS,
      message: ResponseMessage.REDIS_KEY_UPDATED,
    };
  }
  async deleteKey(key: string) {
  await this.cacheManager.del(key);
  
  }

  async getProfile(key: string): Promise<ServiceResponse<any>> {
    const cachedProfile = await this.cacheManager.get(key);
    if (cachedProfile) {
      return {
        statusCode: ResponseStatus.SUCCESS,
        message: 'Perfil encontrado en rd',
        data: cachedProfile,
      };
    }
  }
  async setProfileInRedis(key: string, profileData: any): Promise<void> {
    try {
      const insertRedis = await this.cacheManager.set(key, profileData);
      console.log('inserRedsLog', key);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: ResponseStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to cache profile data',
        },
        ResponseStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
}
