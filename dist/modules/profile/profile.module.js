"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileModule = void 0;
const common_1 = require("@nestjs/common");
const profile_controller_1 = require("./profile.controller");
const profile_service_1 = require("./profile.service");
const typeorm_1 = require("@nestjs/typeorm");
const profile_entity_1 = require("../../common/entity/profile.entity");
const api_key_middleware_1 = require("../../middlewares/api-key.middleware");
const user_entity_1 = require("../../common/entity/user.entity");
const userPlan_entity_1 = require("../../common/entity/userPlan.entity");
const redis_module_1 = require("../redis/redis.module");
const jwt_service_1 = require("../jwt/jwt.service");
let ProfileModule = class ProfileModule {
    configure(consumer) {
        consumer.apply(api_key_middleware_1.ApiKeyMiddleware).forRoutes('profile/register');
    }
};
exports.ProfileModule = ProfileModule;
exports.ProfileModule = ProfileModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                profile_entity_1.ProfileEntity,
                user_entity_1.UserEntity,
                userPlan_entity_1.UserPlanEntity,
            ]),
            redis_module_1.RedisModule,
        ],
        controllers: [profile_controller_1.ProfileController],
        providers: [profile_service_1.ProfileService, jwt_service_1.JwtService],
    })
], ProfileModule);
//# sourceMappingURL=profile.module.js.map