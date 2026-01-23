"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationDocsService = void 0;
const common_1 = require("@nestjs/common");
const blob_1 = require("@vercel/blob");
const response_enums_1 = require("../../enum/response.enums");
let RegistrationDocsService = class RegistrationDocsService {
    async uploadDocuments(files, uuid, nick) {
        if (!files || Object.keys(files).length === 0) {
            return {
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: 'No files to upload',
                data: [],
            };
        }
        const keyPath = `${uuid}_${nick}`;
        const uploads = [];
        try {
            for (const fieldname of Object.keys(files)) {
                const fileList = files[fieldname] || [];
                for (const file of fileList) {
                    const path = `${keyPath}/documents/${fieldname}/${file.originalname}`;
                    const blob = await (0, blob_1.put)(path, file.buffer, { access: 'public' });
                    uploads.push({
                        fieldname,
                        originalName: file.originalname,
                        url: blob.url,
                        size: file.size,
                    });
                    console.log(`Uploaded document: ${path} -> ${blob.url}`);
                }
            }
            return {
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: 'Documents uploaded successfully',
                data: uploads,
            };
        }
        catch (error) {
            console.error('Error uploading documents', error);
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.BAD_REQUEST,
                error: 'Failed to upload documents',
            }, response_enums_1.ResponseStatus.BAD_REQUEST);
        }
    }
};
exports.RegistrationDocsService = RegistrationDocsService;
exports.RegistrationDocsService = RegistrationDocsService = __decorate([
    (0, common_1.Injectable)()
], RegistrationDocsService);
//# sourceMappingURL=registration-docs.service.js.map