"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../common/entity/user.entity");
const jwt_1 = require("@nestjs/jwt");
const constants_1 = require("../../utils/constants");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const jwt_strategy_1 = require("../../guards/jwt.strategy");
const userPlan_entity_1 = require("../../common/entity/userPlan.entity");
const plan_entity_1 = require("../../common/entity/plan.entity");
const planCategory_entity_1 = require("../../common/entity/planCategory.entity");
const profile_entity_1 = require("../../common/entity/profile.entity");
const api_key_middleware_1 = require("../../middlewares/api-key.middleware");
const mail_service_1 = require("../mail/mail.service");
let AuthModule = class AuthModule {
    configure(consumer) {
        consumer
            .apply(api_key_middleware_1.ApiKeyMiddleware)
            .forRoutes('auth/register');
    }
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.UserEntity,
                userPlan_entity_1.UserPlanEntity,
                plan_entity_1.PlanEntity,
                planCategory_entity_1.PlanCategoryEntity,
                profile_entity_1.ProfileEntity,
            ]),
            jwt_1.JwtModule.register({
                global: true,
                secret: constants_1.jwtConstants.secretUser,
                signOptions: { expiresIn: process.env.TIME_TOKEN_USER ? String(process.env.TIME_TOKEN_USER + 'min') : '30min' },
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 10,
                    limit: 2,
                }]),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, mail_service_1.MailService, {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard
            }, jwt_strategy_1.JwtStrategy],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map