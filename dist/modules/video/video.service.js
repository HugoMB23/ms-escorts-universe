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
exports.VideoService = void 0;
const common_1 = require("@nestjs/common");
const blob_1 = require("@vercel/blob");
const cache_manager_1 = require("@nestjs/cache-manager");
const response_enums_1 = require("../../enum/response.enums");
const plan_limits_util_1 = require("../../utils/plan-limits.util");
let VideoService = class VideoService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }
    async uploadVideo(file, nick, uuid, plan) {
        if (!file) {
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.BAD_REQUEST,
                error: 'No file provided or cannot be processed',
            }, response_enums_1.ResponseStatus.BAD_REQUEST);
        }
        const nickUrl = `${uuid}_${nick}`;
        let currentData = await this.getDataRedis(nickUrl);
        const key_plans = process.env.KEY_REDIS_PLANS || 'plansUniverse';
        const plansUniverse = await this.cacheManager.get(key_plans);
        if (!currentData) {
            currentData = {
                avatar: '',
                cover: '',
                videos: [],
                histories: [],
                photos: [],
            };
        }
        const { maxAllowed: maxVideosAllowed, resolvedPlanId } = (0, plan_limits_util_1.resolveMediaLimit)(plansUniverse, plan, 'videos');
        const currentVideoCount = currentData.videos.length;
        if (currentVideoCount >= maxVideosAllowed) {
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.BAD_REQUEST,
                error: `Cannot upload video. The plan ${resolvedPlanId} allows a maximum of ${maxVideosAllowed} videos.`,
            }, response_enums_1.ResponseStatus.BAD_REQUEST);
        }
        const getExtensionVid = this.getFormatVid(file.originalname);
        const path = `${nickUrl}/video/${'universe.' + getExtensionVid}`;
        const blob = await (0, blob_1.put)(path, file.buffer, { access: 'public' });
        const newVideo = { url: blob.url };
        currentData.videos.push(newVideo);
        await this.updateAndSaveCache(nickUrl, currentData);
        return {
            statusCode: response_enums_1.ResponseStatus.SUCCESS,
            message: response_enums_1.ResponseMessage.VIDEO_UPLOADED,
            data: newVideo,
        };
    }
    getFormatVid(videoName) {
        const parts = videoName.split('.');
        const extension = parts[parts.length - 1];
        return extension;
    }
    async updateAndSaveCache(key, data) {
        await this.cacheManager.set(key, data);
    }
    async getDataRedis(key) {
        return await this.cacheManager.get(key);
    }
    async deleteVideo(videoUrl, uuid, nick) {
        const keyUser = `${uuid}_${nick}`;
        const pathVideoDelete = await this.deleteVideoBlob(keyUser, 'video', videoUrl);
        const currentData = await this.cacheManager.get(keyUser);
        if (currentData) {
            currentData.videos = currentData.videos.filter((video) => video.url !== pathVideoDelete);
            await this.cacheManager.set(keyUser, currentData);
            return {
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: response_enums_1.ResponseMessage.VIDEO_DELETED,
            };
        }
        else {
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.NOT_FOUND,
                error: 'Key not found or no videos in data',
            }, response_enums_1.ResponseStatus.NOT_FOUND);
        }
    }
    async deleteVideoBlob(keyUser, folder, videoUrl) {
        const pathVideo = `https://ffildowfyh8ojn5z.public.blob.vercel-storage.com/${keyUser}/${folder}/${videoUrl}`;
        await (0, blob_1.del)(pathVideo);
        return pathVideo;
    }
};
exports.VideoService = VideoService;
exports.VideoService = VideoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], VideoService);
//# sourceMappingURL=video.service.js.map