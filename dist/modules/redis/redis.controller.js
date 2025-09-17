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
exports.RedisController = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
const redis_updateOrder_dto_1 = require("../../common/dto/redis-updateOrder.dto");
const jwt_service_1 = require("../../modules/jwt/jwt.service");
const jwt_exception_filter_1 = require("../../common/filters/jwt-exception.filter");
let RedisController = class RedisController {
    constructor(redisService, jwtService) {
        this.redisService = redisService;
        this.jwtService = jwtService;
    }
    async getValue(req) {
        const token = req.headers['authorization'].split(' ')[1];
        const { sub: uuid, username: nick, code, message } = this.jwtService.decodeToken(token);
        if (code !== 200) {
            throw new common_1.UnauthorizedException(message);
        }
        return this.redisService.getValueRedis(uuid, nick);
    }
    async updateOrders(data, req) {
        const token = req.headers['authorization'].split(' ')[1];
        const { sub: uuid, username: nick, code, message } = this.jwtService.decodeToken(token);
        if (code !== 200) {
            throw new common_1.UnauthorizedException(message);
        }
        return this.redisService.updateValueRedis(uuid, nick, data);
    }
    async getPlans() {
        return this.redisService.getPlans();
    }
    async getAllKeys() {
        return this.redisService.getAllKey();
    }
};
exports.RedisController = RedisController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], RedisController.prototype, "getValue", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [redis_updateOrder_dto_1.UpdateProfileDto, Request]),
    __metadata("design:returntype", Promise)
], RedisController.prototype, "updateOrders", null);
__decorate([
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RedisController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RedisController.prototype, "getAllKeys", null);
exports.RedisController = RedisController = __decorate([
    (0, common_1.Controller)('redis'),
    (0, common_1.UseFilters)(jwt_exception_filter_1.JwtExceptionFilter),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        jwt_service_1.JwtService])
], RedisController);
//# sourceMappingURL=redis.controller.js.map