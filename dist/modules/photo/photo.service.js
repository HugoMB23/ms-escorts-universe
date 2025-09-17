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
exports.PhotosService = void 0;
const common_1 = require("@nestjs/common");
const blob_1 = require("@vercel/blob");
const cache_manager_1 = require("@nestjs/cache-manager");
const response_enums_1 = require("../../enum/response.enums");
const photoState_enum_1 = require("../../enum/photoState.enum");
const plan_limits_util_1 = require("../../utils/plan-limits.util");
let PhotosService = class PhotosService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }
    async uploadPhotos(files, nick, uuid, plan) {
        console.log('plan', plan);
        console.log('files', files);
        if (!files || files.length === 0) {
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.BAD_REQUEST,
                error: 'No files provided or cannot be processed',
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
        const { maxAllowed: maxPhotosAllowed, resolvedPlanId } = (0, plan_limits_util_1.resolveMediaLimit)(plansUniverse, plan, 'photos');
        console.log('response maximo', maxPhotosAllowed);
        const currentPhotoCount = currentData.photos.length;
        if (currentPhotoCount + files.length > maxPhotosAllowed) {
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.BAD_REQUEST,
                error: `Cannot upload photos. The plan ${resolvedPlanId} allows a maximum of ${maxPhotosAllowed} photos.`,
            }, response_enums_1.ResponseStatus.BAD_REQUEST);
        }
        console.log('log reduce', currentData);
        const highestOrder = currentData.photos.reduce((max, photo) => Math.max(max, Number(photo.orden)), 0) || 0;
        const uploadPromises = files.map((file, index) => {
            const getExtensionImg = this.getFomartImg(file.originalname);
            const path = `${nickUrl}/photo/${'universe.' + getExtensionImg}`;
            return (0, blob_1.put)(path, file.buffer, { access: 'public' }).then((blob) => ({
                url: blob.url,
                orden: highestOrder + index + 1,
                highlighted: false,
                state: photoState_enum_1.PhotoState.ENABLE
            }));
        });
        const blobs = await Promise.all(uploadPromises);
        await this.updateAndSaveCache(nickUrl, blobs);
        return {
            statusCode: response_enums_1.ResponseStatus.SUCCESS,
            message: response_enums_1.ResponseMessage.PHOTOS_UPLOADED,
            data: blobs,
        };
    }
    getFomartImg(imageName) {
        const parts = imageName.split('.');
        const extension = parts[parts.length - 1];
        return extension;
    }
    async updatePhotoHighlighted(uuid, nick, plan, data) {
        const keyRedis = `${uuid}_${nick}`;
        const getRedis = await this.cacheManager.get(keyRedis);
        if (getRedis && getRedis.photos) {
            getRedis.photos = getRedis.photos.map((photo) => {
                if (photo.url === data.url) {
                    return { ...photo, highlighted: data.highlighted };
                }
                return photo;
            });
            await this.cacheManager.set(keyRedis, getRedis);
            return {
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: response_enums_1.ResponseMessage.PHOTO_UPDATED,
                data: getRedis,
            };
        }
        else {
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.NOT_FOUND,
                error: 'Key not found or no photos in data',
            }, response_enums_1.ResponseStatus.NOT_FOUND);
        }
    }
    async deletePhoto(photoUrl, uuid, nick) {
        const keyUser = `${uuid}_${nick}`;
        const pathPhotoDelete = await this.deletePhotoBlob(keyUser, 'photo', photoUrl);
        const currentData = await this.cacheManager.get(keyUser);
        if (currentData) {
            currentData.photos = currentData.photos.filter((photo) => photo.url !== pathPhotoDelete);
            currentData.photos = currentData.photos.map((photo, index) => ({
                ...photo,
                orden: index + 1,
            }));
            await this.cacheManager.set(keyUser, currentData);
            return {
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: response_enums_1.ResponseMessage.PHOTO_DELETED,
            };
        }
        else {
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.NOT_FOUND,
                error: 'Key not found or no photos in data',
            }, response_enums_1.ResponseStatus.NOT_FOUND);
        }
    }
    async updateAndSaveCache(key, dataRedis) {
        let currentData = await this.getDataRedis(key);
        if (!currentData) {
            currentData = {
                avatar: '',
                cover: '',
                videos: [],
                histories: [],
                photos: [],
            };
        }
        currentData.photos = [...currentData.photos, ...dataRedis];
        await this.cacheManager.set(key, currentData);
    }
    async getDataRedis(key) {
        return await this.cacheManager.get(key);
    }
    async deletePhotoBlob(keyUser, folder, photoUrl) {
        const pathPhoto = `https://ffildowfyh8ojn5z.public.blob.vercel-storage.com/${keyUser}/${folder}/${photoUrl}`;
        await (0, blob_1.del)(pathPhoto);
        return pathPhoto;
    }
};
exports.PhotosService = PhotosService;
exports.PhotosService = PhotosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], PhotosService);
//# sourceMappingURL=photo.service.js.map