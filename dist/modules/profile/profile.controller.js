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
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
const profile_service_1 = require("./profile.service");
const profile_create_dto_1 = require("../../common/dto/profile-create.dto");
const profile_update_dto_1 = require("../../common/dto/profile-update.dto");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const jwt_service_1 = require("../../modules/jwt/jwt.service");
let ProfileController = class ProfileController {
    constructor(profileSerivice, jwtService) {
        this.profileSerivice = profileSerivice;
        this.jwtService = jwtService;
    }
    async createProfile(profileUser) {
        console.log('entre');
        return this.profileSerivice.createProfile(profileUser);
    }
    async getProfile(req) {
        const token = req.headers['authorization'].split(' ')[1];
        const { username: nick, sub: uuid, code, message, } = this.jwtService.decodeToken(token);
        if (code !== 200) {
            throw new common_1.UnauthorizedException(message);
        }
        return this.profileSerivice.getProfile(uuid);
    }
    async updateProfile(updateProfile, req) {
        const token = req.headers['authorization'].split(' ')[1];
        const { username: nick, sub: uuid, code, message, } = this.jwtService.decodeToken(token);
        if (code !== 200) {
            throw new common_1.UnauthorizedException(message);
        }
        return this.profileSerivice.updateProfile(updateProfile, uuid);
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [profile_create_dto_1.CreateProfileDto]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('update'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [profile_update_dto_1.UpdateProfileInformationDto,
        Request]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "updateProfile", null);
exports.ProfileController = ProfileController = __decorate([
    (0, common_1.Controller)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [profile_service_1.ProfileService,
        jwt_service_1.JwtService])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map