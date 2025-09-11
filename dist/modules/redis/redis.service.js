"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const response_enums_1 = require("../../enum/response.enums");
const ioredis_1 = require("ioredis");
let RedisService = class RedisService {
    constructor(cacheManager, redis) {
        this.cacheManager = cacheManager;
        this.redis = redis;
    }
    async getValueRedis(uuid, nick) {
        const keyRedis = `${uuid}_${nick}`;
        const value = await this.cacheManager.get(keyRedis);
        if (value) {
            return {
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: response_enums_1.ResponseMessage.REDIS_KEY_FOUND,
                data: value,
            };
        }
        else {
            return {
                data: {
                    avatar: '',
                    cover: '',
                    videos: [],
                    histories: [],
                    photos: [],
                },
                statusCode: response_enums_1.ResponseStatus.NOT_FOUND,
                message: response_enums_1.ResponseMessage.REDIS_KEY_NOT_FOUND,
            };
        }
    }
    async getAllKey() {
        try {
            const keysToIgnore = [
                'mykey',
                'plansUniverse',
                'user_2030304',
                'nationalities_redis',
                'region_redis',
            ];
            const allKeys = await this.redis.keys('*');
            const filteredKeys = allKeys.filter((key) => !keysToIgnore.includes(key) &&
                !key.startsWith('profile_'));
            const results = [];
            for (const key of filteredKeys) {
                const jsonData = await this.redis.get(key);
                if (!jsonData)
                    continue;
                const data = JSON.parse(jsonData);
                results.push({ key, value: data });
            }
            return {
                statusCode: 201,
                message: 'Claves Redis encontradas',
                data: results,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                statusCode: 500,
                message: 'Error al obtener claves de Redis',
            }, 500);
        }
    }
    async updateValueRedis(uuid, nick, data) {
        const keyRedis = `${uuid}_${nick}`;
        await this.cacheManager.set(keyRedis, data);
        return {
            statusCode: response_enums_1.ResponseStatus.SUCCESS,
            message: response_enums_1.ResponseMessage.REDIS_KEY_UPDATED,
        };
    }
    async deleteKey(key) {
        await this.cacheManager.del(key);
    }
    async getProfile(key) {
        const cachedProfile = await this.cacheManager.get(key);
        if (cachedProfile) {
            return {
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: 'Perfil encontrado en rd',
                data: cachedProfile,
            };
        }
    }
    async setProfileInRedis(key, profileData) {
        try {
            const insertRedis = await this.cacheManager.set(key, profileData);
            console.log('inserRedsLog', key);
        }
        catch (error) {
            throw new common_1.HttpException({
                statusCode: response_enums_1.ResponseStatus.INTERNAL_SERVER_ERROR,
                message: 'Failed to cache profile data',
            }, response_enums_1.ResponseStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __param(1, (0, common_1.Inject)('REDIS')),
    __metadata("design:paramtypes", [Object, ioredis_1.default])
], RedisService);
//# sourceMappingURL=redis.service.js.map