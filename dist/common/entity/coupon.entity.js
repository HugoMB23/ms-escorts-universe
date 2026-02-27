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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponEntity = void 0;
const typeorm_1 = require("typeorm");
const plan_entity_1 = require("./plan.entity");
const couponStatus_enum_1 = require("../../enum/couponStatus.enum");
let CouponEntity = class CouponEntity {
};
exports.CouponEntity = CouponEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], CouponEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true }),
    __metadata("design:type", String)
], CouponEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "idPlan", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => plan_entity_1.PlanEntity, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'idPlan' }),
    __metadata("design:type", plan_entity_1.PlanEntity)
], CouponEntity.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "durationDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], CouponEntity.prototype, "validFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], CouponEntity.prototype, "validUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: couponStatus_enum_1.CouponStatus,
        default: couponStatus_enum_1.CouponStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], CouponEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], CouponEntity.prototype, "usedByUserUuid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CouponEntity.prototype, "usedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], CouponEntity.prototype, "createdAt", void 0);
exports.CouponEntity = CouponEntity = __decorate([
    (0, typeorm_1.Entity)('coupon')
], CouponEntity);
//# sourceMappingURL=coupon.entity.js.map