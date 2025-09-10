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
exports.PhotosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const photo_service_1 = require("./photo.service");
const profile_path_dto_1 = require("../../common/dto/profile-path.dto");
const image_validation_interceptor_1 = require("../../utils/image-validation.interceptor");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const jwt_service_1 = require("../../modules/jwt/jwt.service");
const jwt_exception_filter_1 = require("../../common/filters/jwt-exception.filter");
let PhotosController = class PhotosController {
    constructor(photosService, jwtService) {
        this.photosService = photosService;
        this.jwtService = jwtService;
    }
    async uploadPhotos(files, req) {
        const token = req.headers['authorization'].split(' ')[1];
        const { sub: uuid, username: nick, plan, code, message } = this.jwtService.decodeToken(token);
        if (code !== 200) {
            throw new common_1.UnauthorizedException(message);
        }
        return this.photosService.uploadPhotos(files, nick, uuid, plan);
    }
    async updatePhoto(data, req) {
        const token = req.headers['authorization'].split(' ')[1];
        const { sub: uuid, username: nick, plan, code, message } = this.jwtService.decodeToken(token);
        if (code !== 200) {
            throw new common_1.UnauthorizedException(message);
        }
        return this.photosService.updatePhotoHighlighted(uuid, nick, plan, data);
    }
    async deletePhoto(photoUrl, req) {
        const token = req.headers['authorization'].split(' ')[1];
        const { sub: uuid, username: nick, code, message } = this.jwtService.decodeToken(token);
        if (code !== 200) {
            throw new common_1.UnauthorizedException(message);
        }
        return this.photosService.deletePhoto(photoUrl, uuid, nick);
    }
};
exports.PhotosController = PhotosController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 30), image_validation_interceptor_1.ImageValidationInterceptor),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Request]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "uploadPhotos", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [profile_path_dto_1.UpdatePhotoHighlightedDto, Request]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "updatePhoto", null);
__decorate([
    (0, common_1.Delete)('delete/:photoUrl'),
    __param(0, (0, common_1.Param)('photoUrl')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Request]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "deletePhoto", null);
exports.PhotosController = PhotosController = __decorate([
    (0, common_1.Controller)('photos'),
    (0, common_1.UseFilters)(jwt_exception_filter_1.JwtExceptionFilter),
    __metadata("design:paramtypes", [photo_service_1.PhotosService, jwt_service_1.JwtService])
], PhotosController);
//# sourceMappingURL=photo.controller.js.map