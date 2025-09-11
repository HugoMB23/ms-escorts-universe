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
exports.CoverService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const blob_1 = require("@vercel/blob");
const response_enums_1 = require("../../enum/response.enums");
let CoverService = class CoverService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }
    async uploadCover(file, uuid, nick) {
        if (!file) {
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.BAD_REQUEST,
                error: 'No file provided or cannot be processed',
            }, response_enums_1.ResponseStatus.BAD_REQUEST);
        }
        const nickUrl = `${uuid}_${nick}`;
        const path = `${nickUrl}/cover/${file.originalname}`;
        const blob = await (0, blob_1.put)(path, file.buffer, { access: 'public' });
        return await this.updateCover(nickUrl, blob);
    }
    async updateCover(key, dataRedis) {
        const currentData = await this.getDataRedis(key);
        if (currentData) {
            const coverLast = currentData.cover ? currentData.cover : '';
            currentData.cover = dataRedis.url;
            await this.cacheManager.set(key, currentData);
            if (coverLast !== '') {
                await (0, blob_1.del)(coverLast);
            }
            return {
                data: dataRedis.url,
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: response_enums_1.ResponseMessage.COVER_UPDATED,
            };
        }
        else {
            throw new common_1.HttpException({ status: response_enums_1.ResponseStatus.NOT_FOUND, error: 'Key not found' }, response_enums_1.ResponseStatus.NOT_FOUND);
        }
    }
    async getDataRedis(key) {
        return await this.cacheManager.get(key);
    }
};
exports.CoverService = CoverService;
exports.CoverService = CoverService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [cache_manager_1.Cache])
], CoverService);
//# sourceMappingURL=cover.service.js.map