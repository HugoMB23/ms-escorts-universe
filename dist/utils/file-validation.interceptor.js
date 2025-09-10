"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileValidationInterceptor = void 0;
const common_1 = require("@nestjs/common");
let FileValidationInterceptor = class FileValidationInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const files = request.files;
        const file = request.file;
        const validMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'video/avi',
            'video/mpeg',
            'video/quicktime',
            'video/x-ms-wmv'
        ];
        if (files) {
            for (const file of files) {
                if (!validMimeTypes.includes(file.mimetype)) {
                    throw new common_1.BadRequestException(`File ${file.originalname} is not a valid image or video`);
                }
            }
        }
        else if (file && !validMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File ${file.originalname} is not a valid image or video`);
        }
        return next.handle();
    }
};
exports.FileValidationInterceptor = FileValidationInterceptor;
exports.FileValidationInterceptor = FileValidationInterceptor = __decorate([
    (0, common_1.Injectable)()
], FileValidationInterceptor);
//# sourceMappingURL=file-validation.interceptor.js.map