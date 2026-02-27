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
exports.ServiceCategoryPlanEntity = void 0;
const typeorm_1 = require("typeorm");
const service_category_entity_1 = require("./service-category.entity");
const plan_entity_1 = require("./plan.entity");
let ServiceCategoryPlanEntity = class ServiceCategoryPlanEntity {
};
exports.ServiceCategoryPlanEntity = ServiceCategoryPlanEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { name: 'id_service_category_plan' }),
    __metadata("design:type", Number)
], ServiceCategoryPlanEntity.prototype, "idServiceCategoryPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_service_category' }),
    __metadata("design:type", Number)
], ServiceCategoryPlanEntity.prototype, "idServiceCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_plan' }),
    __metadata("design:type", Number)
], ServiceCategoryPlanEntity.prototype, "idPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ServiceCategoryPlanEntity.prototype, "available", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_category_entity_1.ServiceCategoryEntity, (serviceCategory) => serviceCategory.serviceCategoryPlans, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'id_service_category' }),
    __metadata("design:type", service_category_entity_1.ServiceCategoryEntity)
], ServiceCategoryPlanEntity.prototype, "serviceCategory", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => plan_entity_1.PlanEntity, (plan) => plan.serviceCategoryPlans, {
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'id_plan' }),
    __metadata("design:type", plan_entity_1.PlanEntity)
], ServiceCategoryPlanEntity.prototype, "plan", void 0);
exports.ServiceCategoryPlanEntity = ServiceCategoryPlanEntity = __decorate([
    (0, typeorm_1.Entity)('service_category_plan')
], ServiceCategoryPlanEntity);
//# sourceMappingURL=service-category-plan.entity.js.map