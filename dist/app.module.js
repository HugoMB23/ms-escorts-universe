"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const database_module_1 = require("./database/database.module");
const profile_module_1 = require("./modules/profile/profile.module");
const photo_module_1 = require("./modules/photo/photo.module");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const config_1 = require("@nestjs/config");
const redis_module_1 = require("./modules/redis/redis.module");
const jwt_module_1 = require("./modules/jwt/jwt.module");
const history_module_1 = require("./modules/history/history.module");
const cronjob_module_1 = require("./modules/cronjob/cronjob.module");
const video_module_1 = require("./modules/video/video.module");
const avatar_service_1 = require("./modules/avatar/avatar.service");
const avatar_module_1 = require("./modules/avatar/avatar.module");
const cover_module_1 = require("./modules/cover/cover.module");
const mail_module_1 = require("./modules/mail/mail.module");
const coupon_module_1 = require("./modules/coupon/coupon.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            cache_manager_1.CacheModule.registerAsync({
                imports: [config_1.ConfigModule],
                isGlobal: true,
                useFactory: async (config) => {
                    const url = config.get('REDIS_URL');
                    const u = new URL(url);
                    const isTls = u.protocol === 'rediss:';
                    console.log('[CacheModule] URL:', url, '| TLS?', isTls, '| host:', u.hostname, '| port:', u.port);
                    return {
                        store: await (0, cache_manager_redis_yet_1.redisStore)({
                            url,
                            socket: isTls ? { tls: true, servername: u.hostname } : undefined,
                        }),
                    };
                },
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            database_module_1.DatabaseModule,
            profile_module_1.ProfileModule,
            photo_module_1.PhotoModule,
            redis_module_1.RedisModule,
            history_module_1.HistoryModule,
            cronjob_module_1.CronjobModule,
            jwt_module_1.JwtModule,
            video_module_1.VideoModule,
            avatar_module_1.AvatarModule,
            cover_module_1.CoverModule,
            mail_module_1.MailModule,
            coupon_module_1.CouponModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, avatar_service_1.AvatarService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map