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
exports.HistoryService = void 0;
const common_1 = require("@nestjs/common");
const blob_1 = require("@vercel/blob");
const cache_manager_1 = require("@nestjs/cache-manager");
const response_enums_1 = require("../../enum/response.enums");
const luxon_1 = require("luxon");
let HistoryService = class HistoryService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }
    async uploadHistory(file, uuid, nick, plan) {
        if (!file) {
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.BAD_REQUEST,
                error: 'No file provided or cannot be processed',
            }, response_enums_1.ResponseStatus.BAD_REQUEST);
        }
        const nickUrl = `${uuid}_${nick}`;
        let currentData = await this.getDataRedis(nickUrl);
        const plansUniverseKey = 'plansUniverse';
        const plansUniverse = await this.cacheManager.get(plansUniverseKey);
        if (!currentData) {
            currentData = {
                avatar: '',
                cover: '',
                videos: [],
                histories: [],
                photos: [],
            };
        }
        const currentPlan = plansUniverse.plansScort.find(p => p.namePlan === plan);
        if (!currentPlan) {
            throw new common_1.HttpException({ status: response_enums_1.ResponseStatus.NOT_FOUND, error: 'Plan not found' }, response_enums_1.ResponseStatus.NOT_FOUND);
        }
        const currentHistoryCount = currentData.histories.length;
        const maxHistoriesAllowed = currentPlan.maximoHistory;
        if (currentHistoryCount >= maxHistoriesAllowed) {
            currentData.histories.shift();
        }
        const getExtensionImg = this.getFormatImg(file.originalname);
        const path = `${nickUrl}/history/${'universe.' + getExtensionImg}`;
        const blob = await (0, blob_1.put)(path, file.buffer, { access: 'public' });
        return await this.updateHistory(nickUrl, blob, currentData);
    }
    async updateHistory(key, dataRedis, currentData) {
        const jsonHistory = {
            url: dataRedis.url,
            dateExpired: luxon_1.DateTime.now().setZone('America/Santiago').plus({ hours: 24 }).toISO()
        };
        currentData.histories = [...currentData.histories, jsonHistory];
        await this.cacheManager.set(key, currentData);
        return {
            data: jsonHistory,
            statusCode: response_enums_1.ResponseStatus.SUCCESS,
            message: response_enums_1.ResponseMessage.HISTORY_UPDATED,
        };
    }
    async getDataRedis(key) {
        return await this.cacheManager.get(key);
    }
    getFormatImg(imageName) {
        const parts = imageName.split('.');
        const extension = parts[parts.length - 1];
        return extension;
    }
    async deleteHistory(historyUrl, uuid, nick) {
        const keyUser = `${uuid}_${nick}`;
        const pathHistoryDelete = await this.deleteHistoryBlob(keyUser, 'history', historyUrl);
        const currentData = await this.cacheManager.get(keyUser);
        if (currentData) {
            currentData.histories = currentData.histories.filter((history) => history.url !== pathHistoryDelete);
            await this.cacheManager.set(keyUser, currentData);
            return {
                data: {},
                statusCode: common_1.HttpStatus.OK,
                message: 'Historia eliminada exitosamente',
            };
        }
        else {
            throw new common_1.HttpException('Historia no encontrada', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async deleteHistoryBlob(keyUser, folder, historyUrl) {
        const pathHistory = `https://ffildowfyh8ojn5z.public.blob.vercel-storage.com/${keyUser}/${folder}/${historyUrl}`;
        await (0, blob_1.del)(pathHistory);
        return pathHistory;
    }
};
exports.HistoryService = HistoryService;
exports.HistoryService = HistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], HistoryService);
//# sourceMappingURL=history.service.js.map