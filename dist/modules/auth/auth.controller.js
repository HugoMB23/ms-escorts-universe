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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_create_dto_1 = require("../../common/dto/auth-create.dto");
const auth_service_1 = require("./auth.service");
const auth_login_dto_1 = require("../../common/dto/auth-login.dto");
const throttler_1 = require("@nestjs/throttler");
const auth_token_dto_1 = require("../../common/dto/auth-token.dto");
const confirmPassword_dto_1 = require("./dto/confirmPassword.dto");
const resetPass_dto_1 = require("./dto/resetPass.dto");
let AuthController = class AuthController {
    constructor(authSerivice) {
        this.authSerivice = authSerivice;
    }
    async login(loginUser) {
        return this.authSerivice.loginUser(loginUser);
    }
    async validToken(data) {
        return await this.authSerivice.validToken(data.token);
    }
    async createAccount(createUser) {
        return this.authSerivice.createAccountUser(createUser);
    }
    async resetPassword(data) {
        return this.authSerivice.resetPasswordUser(data);
    }
    async confirmPasswordReset(data) {
        return this.authSerivice.confirmPasswordReset(data);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_login_dto_1.LoginUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('validToken'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_token_dto_1.TokenUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validToken", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_create_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createAccount", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    (0, common_1.Post)('resetPassword'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resetPass_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    (0, common_1.Post)('confirmPasswordReset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirmPassword_dto_1.ConfirmPasswordResetDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "confirmPasswordReset", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map