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
exports.CouponController = void 0;
const common_1 = require("@nestjs/common");
const coupon_service_1 = require("./coupon.service");
const generate_coupon_dto_1 = require("./dto/generate-coupon.dto");
const redeem_coupon_dto_1 = require("./dto/redeem-coupon.dto");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const RolesGuard_1 = require("../../guards/RolesGuard");
const roles_decorator_1 = require("../../decorators/roles.decorator");
const roles_enum_1 = require("../../enum/roles.enum");
const jwt_token_decorator_1 = require("../../common/decorators/jwt-token.decorator");
const couponStatus_enum_1 = require("../../enum/couponStatus.enum");
let CouponController = class CouponController {
    constructor(couponService) {
        this.couponService = couponService;
    }
    async generateCoupons(dto) {
        return this.couponService.generateCoupons(dto);
    }
    async redeemCoupon(dto, userUuid) {
        return this.couponService.redeemCoupon(dto, userUuid);
    }
    async findAll(status, idPlan) {
        return this.couponService.findAll({
            status,
            idPlan: idPlan ? parseInt(idPlan, 10) : undefined,
        });
    }
    async findByCode(code) {
        return this.couponService.findByCode(code);
    }
};
exports.CouponController = CouponController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.UseGuards)(RolesGuard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.Admin),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_coupon_dto_1.GenerateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "generateCoupons", null);
__decorate([
    (0, common_1.Post)('redeem'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, jwt_token_decorator_1.JwtToken)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [redeem_coupon_dto_1.RedeemCouponDto, String]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "redeemCoupon", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(RolesGuard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.Admin),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('idPlan')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':code'),
    (0, common_1.UseGuards)(RolesGuard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.Admin),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "findByCode", null);
exports.CouponController = CouponController = __decorate([
    (0, common_1.Controller)('coupon'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [coupon_service_1.CouponService])
], CouponController);
//# sourceMappingURL=coupon.controller.js.map