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
exports.HistoryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const history_service_1 = require("./history.service");
const file_validation_interceptor_1 = require("../../utils/file-validation.interceptor");
const jwt_service_1 = require("../../modules/jwt/jwt.service");
const jwt_exception_filter_1 = require("../../common/filters/jwt-exception.filter");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
let HistoryController = class HistoryController {
    constructor(historyService, jwtService) {
        this.historyService = historyService;
        this.jwtService = jwtService;
    }
    async uploadHistory(file, req) {
        const token = req.headers['authorization'].split(' ')[1];
        const { username: nick, sub: uuid, plan: plan, code, message } = this.jwtService.decodeToken(token);
        if (code !== 200) {
            throw new common_1.UnauthorizedException(message);
        }
        return this.historyService.uploadHistory(file, uuid, nick, plan);
    }
    async deleteHistory(historyUrl, req) {
        const token = req.headers['authorization'].split(' ')[1];
        const { username: nick, sub: uuid, code, message } = this.jwtService.decodeToken(token);
        if (code !== 200) {
            throw new common_1.UnauthorizedException(message);
        }
        return this.historyService.deleteHistory(historyUrl, uuid, nick);
    }
};
exports.HistoryController = HistoryController;
__decorate([
    (0, common_1.Post)('historyUpload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file'), file_validation_interceptor_1.FileValidationInterceptor),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", Promise)
], HistoryController.prototype, "uploadHistory", null);
__decorate([
    (0, common_1.Delete)('delete/:historyUrl'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('historyUrl')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Request]),
    __metadata("design:returntype", Promise)
], HistoryController.prototype, "deleteHistory", null);
exports.HistoryController = HistoryController = __decorate([
    (0, common_1.Controller)('history'),
    (0, common_1.UseFilters)(jwt_exception_filter_1.JwtExceptionFilter),
    __metadata("design:paramtypes", [history_service_1.HistoryService,
        jwt_service_1.JwtService])
], HistoryController);
//# sourceMappingURL=history.controller.js.map