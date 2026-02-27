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
exports.CouponService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coupon_entity_1 = require("../../common/entity/coupon.entity");
const plan_entity_1 = require("../../common/entity/plan.entity");
const userPlan_entity_1 = require("../../common/entity/userPlan.entity");
const couponStatus_enum_1 = require("../../enum/couponStatus.enum");
const crypto = require("crypto");
const luxon_1 = require("luxon");
let CouponService = class CouponService {
    constructor(couponRepository, planRepository, userPlanRepository) {
        this.couponRepository = couponRepository;
        this.planRepository = planRepository;
        this.userPlanRepository = userPlanRepository;
    }
    async generateCoupons(dto) {
        const plan = await this.planRepository.findOne({
            where: { idPlan: dto.idPlan },
        });
        if (!plan) {
            throw new common_1.HttpException(`Plan con id ${dto.idPlan} no encontrado`, common_1.HttpStatus.NOT_FOUND);
        }
        const coupons = [];
        const codes = [];
        const validFrom = new Date(dto.validFrom);
        const validUntil = new Date(dto.validUntil);
        for (let i = 0; i < dto.quantity; i++) {
            let code;
            let existingCoupon;
            do {
                const randomHex = crypto.randomBytes(8).toString('hex').toUpperCase();
                code = `CUPON_${randomHex}`;
                existingCoupon = await this.couponRepository.findOne({
                    where: { code },
                });
            } while (existingCoupon);
            coupons.push(this.couponRepository.create({
                code,
                idPlan: dto.idPlan,
                durationDays: dto.durationDays,
                validFrom,
                validUntil,
                status: couponStatus_enum_1.CouponStatus.ACTIVE,
            }));
            codes.push(code);
        }
        await this.couponRepository.save(coupons);
        return { codes };
    }
    async redeemCoupon(dto, userUuid) {
        const coupon = await this.couponRepository.findOne({
            where: { code: dto.code },
            relations: ['plan'],
        });
        if (!coupon) {
            throw new common_1.HttpException('Cupón no encontrado', common_1.HttpStatus.NOT_FOUND);
        }
        if (coupon.status !== couponStatus_enum_1.CouponStatus.ACTIVE) {
            throw new common_1.HttpException('Este cupón no está disponible (ya usado o expirado)', common_1.HttpStatus.BAD_REQUEST);
        }
        const now = luxon_1.DateTime.now().toJSDate();
        if (coupon.validFrom > now || coupon.validUntil < now) {
            throw new common_1.HttpException('El cupón no está en su período válido', common_1.HttpStatus.BAD_REQUEST);
        }
        coupon.status = couponStatus_enum_1.CouponStatus.USED;
        coupon.usedByUserUuid = userUuid;
        coupon.usedAt = now;
        await this.couponRepository.save(coupon);
        const today = luxon_1.DateTime.now().startOf('day').toJSDate();
        const endDate = luxon_1.DateTime.now()
            .plus({ days: coupon.durationDays })
            .startOf('day')
            .toJSDate();
        const userPlan = this.userPlanRepository.create({
            userUuid,
            idPlan: coupon.idPlan,
            startDate: today.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        });
        await this.userPlanRepository.save(userPlan);
        return {
            success: true,
            message: `Cupón canjeado exitosamente. Plan activado por ${coupon.durationDays} días.`,
            planName: coupon.plan.name,
            planEndDate: endDate.toISOString().split('T')[0],
        };
    }
    async findAll(filters) {
        const query = this.couponRepository.createQueryBuilder('coupon')
            .leftJoinAndSelect('coupon.plan', 'plan');
        if (filters?.status) {
            query.where('coupon.status = :status', { status: filters.status });
        }
        if (filters?.idPlan) {
            query.andWhere('coupon.idPlan = :idPlan', { idPlan: filters.idPlan });
        }
        return query.orderBy('coupon.createdAt', 'DESC').getMany();
    }
    async findByCode(code) {
        const coupon = await this.couponRepository.findOne({
            where: { code },
            relations: ['plan'],
        });
        if (!coupon) {
            throw new common_1.HttpException('Cupón no encontrado', common_1.HttpStatus.NOT_FOUND);
        }
        return coupon;
    }
};
exports.CouponService = CouponService;
exports.CouponService = CouponService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.CouponEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(plan_entity_1.PlanEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(userPlan_entity_1.UserPlanEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CouponService);
//# sourceMappingURL=coupon.service.js.map