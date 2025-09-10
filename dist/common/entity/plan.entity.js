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
exports.PlanEntity = void 0;
const typeorm_1 = require("typeorm");
const userPlan_entity_1 = require("./userPlan.entity");
const planCategory_entity_1 = require("./planCategory.entity");
let PlanEntity = class PlanEntity {
};
exports.PlanEntity = PlanEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], PlanEntity.prototype, "idPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PlanEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PlanEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric' }),
    __metadata("design:type", Number)
], PlanEntity.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PlanEntity.prototype, "idCategory", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => planCategory_entity_1.PlanCategoryEntity, (category) => category.plans, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'idCategory' }),
    __metadata("design:type", planCategory_entity_1.PlanCategoryEntity)
], PlanEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => userPlan_entity_1.UserPlanEntity, (userPlan) => userPlan.plan),
    __metadata("design:type", Array)
], PlanEntity.prototype, "userPlans", void 0);
exports.PlanEntity = PlanEntity = __decorate([
    (0, typeorm_1.Entity)('plan')
], PlanEntity);
//# sourceMappingURL=plan.entity.js.map