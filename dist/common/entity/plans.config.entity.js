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
exports.PlansConfigEntity = void 0;
const typeorm_1 = require("typeorm");
let PlansConfigEntity = class PlansConfigEntity {
};
exports.PlansConfigEntity = PlansConfigEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlansConfigEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PlansConfigEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], PlansConfigEntity.prototype, "plans", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], PlansConfigEntity.prototype, "updatedAt", void 0);
exports.PlansConfigEntity = PlansConfigEntity = __decorate([
    (0, typeorm_1.Entity)('plans_config')
], PlansConfigEntity);
//# sourceMappingURL=plans.config.entity.js.map