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
const typeorm_1 = require("@nestjs/typeorm");
const plans_config_entity_1 = require("../../common/entity/plans.config.entity");
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([
                plans_config_entity_1.PlansConfigEntity
            ]),
        ],
        providers: [
            redis_service_1.RedisService,
            jwt_service_1.JwtService,
            {
                provide: 'REDIS',
                useFactory: (config) => {
                    const url = config.get('REDIS_URL');
                    const u = new URL(url);
                    const isTls = u.protocol === 'rediss:';
                    console.log('[ioredis] URL:', url, '| TLS?', isTls, '| host:', u.hostname, '| port:', u.port);
                    const client = new ioredis_1.default(url, isTls ? {
                        tls: { servername: u.hostname },
                        maxRetriesPerRequest: 5,
                        connectTimeout: 5000,
                    } : {
                        maxRetriesPerRequest: 5,
                        connectTimeout: 5000,
                    });
                    client.on('connect', () => console.log('[ioredis] Connected to Redis'));
                    client.on('error', (e) => console.error('[ioredis] Redis error:', e?.message));
                    return client;
                },
                inject: [config_1.ConfigService],
            },
        ],
        controllers: [redis_controller_1.RedisController],
        exports: ['REDIS', redis_service_1.RedisService],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map