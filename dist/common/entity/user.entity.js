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
exports.UserEntity = void 0;
const typeorm_1 = require("typeorm");
const profile_entity_1 = require("./profile.entity");
const userPlan_entity_1 = require("./userPlan.entity");
let UserEntity = class UserEntity {
};
exports.UserEntity = UserEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserEntity.prototype, "uuid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "nick", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], UserEntity.prototype, "rol", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "birthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "resetToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], UserEntity.prototype, "resetTokenExpiration", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => profile_entity_1.ProfileEntity, (profile) => profile.user),
    __metadata("design:type", profile_entity_1.ProfileEntity)
], UserEntity.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => userPlan_entity_1.UserPlanEntity, (userPlan) => userPlan.user),
    __metadata("design:type", Array)
], UserEntity.prototype, "userPlans", void 0);
exports.UserEntity = UserEntity = __decorate([
    (0, typeorm_1.Entity)('user')
], UserEntity);
//# sourceMappingURL=user.entity.js.map