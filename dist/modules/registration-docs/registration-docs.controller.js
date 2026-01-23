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
exports.RegistrationDocsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const registration_docs_service_1 = require("./registration-docs.service");
let RegistrationDocsController = class RegistrationDocsController {
    constructor(docsService) {
        this.docsService = docsService;
    }
    async upload(files, body) {
        return await this.docsService.uploadDocuments(files, body.uuid, body.nick);
    }
};
exports.RegistrationDocsController = RegistrationDocsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'fotoProfile', maxCount: 1 },
        { name: 'fotoCarnet', maxCount: 1 },
        { name: 'fotoPago', maxCount: 2 },
    ])),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RegistrationDocsController.prototype, "upload", null);
exports.RegistrationDocsController = RegistrationDocsController = __decorate([
    (0, common_1.Controller)('registration-docs'),
    __metadata("design:paramtypes", [registration_docs_service_1.RegistrationDocsService])
], RegistrationDocsController);
//# sourceMappingURL=registration-docs.controller.js.map