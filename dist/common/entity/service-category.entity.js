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
exports.ServiceCategoryEntity = void 0;
const typeorm_1 = require("typeorm");
const service_category_plan_entity_1 = require("./service-category-plan.entity");
let ServiceCategoryEntity = class ServiceCategoryEntity {
};
exports.ServiceCategoryEntity = ServiceCategoryEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { name: 'id_category' }),
    __metadata("design:type", Number)
], ServiceCategoryEntity.prototype, "idCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], ServiceCategoryEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], ServiceCategoryEntity.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ServiceCategoryEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => service_category_plan_entity_1.ServiceCategoryPlanEntity, (serviceCategoryPlan) => serviceCategoryPlan.serviceCategory),
    __metadata("design:type", Array)
], ServiceCategoryEntity.prototype, "serviceCategoryPlans", void 0);
exports.ServiceCategoryEntity = ServiceCategoryEntity = __decorate([
    (0, typeorm_1.Entity)('service_category')
], ServiceCategoryEntity);
//# sourceMappingURL=service-category.entity.js.map