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
exports.VideoController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const video_service_1 = require("./video.service");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const jwt_service_1 = require("../../modules/jwt/jwt.service");
const video_validation_interceptor_1 = require("../../utils/video-validation.interceptor");
let VideoController = class VideoController {
    constructor(videoService, jwtService) {
        this.videoService = videoService;
        this.jwtService = jwtService;
    }
    async uploadVideo(file, req) {
        const token = req.headers['authorization'].split(' ')[1];
        const { sub: uuid, username: nick, plan, code, message } = this.jwtService.decodeToken(token);
        if (code !== 200) {
            throw new common_1.UnauthorizedException(message);
        }
        return this.videoService.uploadVideo(file, nick, uuid, plan);
    }
    async deleteVideo(videoUrl, req) {
        const token = req.headers['authorization'].split(' ')[1];
        const { sub: uuid, username: nick, code, message } = this.jwtService.decodeToken(token);
        if (code !== 200) {
            throw new common_1.UnauthorizedException(message);
        }
        return this.videoService.deleteVideo(videoUrl, uuid, nick);
    }
};
exports.VideoController = VideoController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file'), video_validation_interceptor_1.VideoValidationInterceptor),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "uploadVideo", null);
__decorate([
    (0, common_1.Delete)('delete/:videoUrl'),
    __param(0, (0, common_1.Param)('videoUrl')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Request]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "deleteVideo", null);
exports.VideoController = VideoController = __decorate([
    (0, common_1.Controller)('videos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [video_service_1.VideoService,
        jwt_service_1.JwtService])
], VideoController);
//# sourceMappingURL=video.controller.js.map