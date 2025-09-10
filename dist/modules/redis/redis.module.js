"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
const redis_controller_1 = require("./redis.controller");
const jwt_service_1 = require("../jwt/jwt.service");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            redis_service_1.RedisService,
            jwt_service_1.JwtService,
            {
                provide: 'REDIS',
                useFactory: (configService) => {
                    const redisUrl = configService.get('REDIS_URL');
                    const redis = new ioredis_1.default(redisUrl, {
                        tls: redisUrl.startsWith('rediss://') ? {} : undefined,
                        maxRetriesPerRequest: 5,
                        connectTimeout: 5000,
                    });
                    redis.on('connect', () => {
                        console.log('[ioredis] Connected to Redis');
                    });
                    redis.on('error', (err) => {
                        console.error('[ioredis] Redis error:', err.message);
                    });
                    return redis;
                },
                inject: [config_1.ConfigService],
            },
        ],
        controllers: [redis_controller_1.RedisController],
        exports: ['REDIS', redis_service_1.RedisService],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map