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
exports.CoverController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const cover_service_1 = require("./cover.service");
const image_validation_interceptor_1 = require("../../utils/image-validation.interceptor");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const jwt_service_1 = require("../../modules/jwt/jwt.service");
const jwt_exception_filter_1 = require("../../common/filters/jwt-exception.filter");
let CoverController = class CoverController {
    constructor(coverService, jwtService) {
        this.coverService = coverService;
        this.jwtService = jwtService;
    }
    async uploadCover(file, req) {
        const token = req.headers['authorization'].split(' ')[1];
        const { sub: uuid, username: nick, code, message } = this.jwtService.decodeToken(token);
        console.log('code log');
        if (code !== 200) {
            throw new common_1.UnauthorizedException(message);
        }
        return this.coverService.uploadCover(file, uuid, nick);
    }
};
exports.CoverController = CoverController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file'), image_validation_interceptor_1.ImageValidationInterceptor),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", Promise)
], CoverController.prototype, "uploadCover", null);
exports.CoverController = CoverController = __decorate([
    (0, common_1.Controller)('cover'),
    (0, common_1.UseFilters)(jwt_exception_filter_1.JwtExceptionFilter),
    __metadata("design:paramtypes", [cover_service_1.CoverService,
        jwt_service_1.JwtService])
], CoverController);
//# sourceMappingURL=cover.controller.js.map