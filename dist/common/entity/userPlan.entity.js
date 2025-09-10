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
exports.UserPlanEntity = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const plan_entity_1 = require("./plan.entity");
let UserPlanEntity = class UserPlanEntity {
};
exports.UserPlanEntity = UserPlanEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], UserPlanEntity.prototype, "idUserPlan", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserPlanEntity.prototype, "userUuid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserPlanEntity.prototype, "idPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], UserPlanEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], UserPlanEntity.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (user) => user.userPlans, { nullable: false }),
    __metadata("design:type", user_entity_1.UserEntity)
], UserPlanEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => plan_entity_1.PlanEntity),
    (0, typeorm_1.JoinColumn)({ name: 'idPlan' }),
    __metadata("design:type", plan_entity_1.PlanEntity)
], UserPlanEntity.prototype, "plan", void 0);
exports.UserPlanEntity = UserPlanEntity = __decorate([
    (0, typeorm_1.Entity)('user_plan')
], UserPlanEntity);
//# sourceMappingURL=userPlan.entity.js.map