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
exports.PlanCategoryEntity = void 0;
const typeorm_1 = require("typeorm");
const plan_entity_1 = require("./plan.entity");
let PlanCategoryEntity = class PlanCategoryEntity {
};
exports.PlanCategoryEntity = PlanCategoryEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], PlanCategoryEntity.prototype, "idCategory", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlanCategoryEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PlanCategoryEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => plan_entity_1.PlanEntity, (plan) => plan.category),
    __metadata("design:type", Array)
], PlanCategoryEntity.prototype, "plans", void 0);
exports.PlanCategoryEntity = PlanCategoryEntity = __decorate([
    (0, typeorm_1.Entity)('plan_category')
], PlanCategoryEntity);
//# sourceMappingURL=planCategory.entity.js.map