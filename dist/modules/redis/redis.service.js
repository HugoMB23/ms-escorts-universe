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
exports.RedisService = void 0;
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const response_enums_1 = require("../../enum/response.enums");
const plans_config_entity_1 = require("../../common/entity/plans.config.entity");
const plan_entity_1 = require("../../common/entity/plan.entity");
const service_category_entity_1 = require("../../common/entity/service-category.entity");
const service_category_plan_entity_1 = require("../../common/entity/service-category-plan.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const ioredis_1 = require("ioredis");
let RedisService = class RedisService {
    constructor(plansRepository, planRepository, serviceCategoryRepository, serviceCategoryPlanRepository, cacheManager, redis) {
        this.plansRepository = plansRepository;
        this.planRepository = planRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.serviceCategoryPlanRepository = serviceCategoryPlanRepository;
        this.cacheManager = cacheManager;
        this.redis = redis;
    }
    async getValueRedis(uuid, nick) {
        const keyRedis = `${uuid}_${nick}`;
        const value = await this.cacheManager.get(keyRedis);
        if (value) {
            return {
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: response_enums_1.ResponseMessage.REDIS_KEY_FOUND,
                data: value,
            };
        }
        else {
            return {
                data: {
                    avatar: '',
                    cover: '',
                    videos: [],
                    histories: [],
                    photos: [],
                },
                statusCode: response_enums_1.ResponseStatus.NOT_FOUND,
                message: response_enums_1.ResponseMessage.REDIS_KEY_NOT_FOUND,
            };
        }
    }
    async getPlans() {
        const key = process.env.KEY_REDIS_PLANS || 'plansUniverse';
        try {
            const categories = await this.serviceCategoryRepository.find({
                order: { idCategory: 'ASC' },
            });
            if (!categories || categories.length === 0) {
                console.log('❌ No se encontraron categorías en la base de datos');
                return {
                    statusCode: response_enums_1.ResponseStatus.NOT_FOUND,
                    message: 'No se encontraron categorías en la base de datos',
                    data: null,
                };
            }
            const plans = await this.planRepository.find({
                order: { idPlan: 'ASC' },
            });
            if (!plans || plans.length === 0) {
                console.log('❌ No se encontraron planes en la base de datos');
                return {
                    statusCode: response_enums_1.ResponseStatus.NOT_FOUND,
                    message: 'No se encontraron planes en la base de datos',
                    data: null,
                };
            }
            const categoryPlanRelations = await this.serviceCategoryPlanRepository.find({
                relations: ['serviceCategory', 'plan'],
                where: { available: true },
            });
            const result = [];
            for (const category of categories) {
                const plansForCategory = categoryPlanRelations
                    .filter((cp) => cp.serviceCategory.idCategory === category.idCategory)
                    .map((cp) => cp.plan)
                    .filter((plan) => plan);
                if (plansForCategory.length === 0)
                    continue;
                const categoryObject = {
                    label: this.getCategoryLabel(category.name),
                    value: category.slug,
                    plans: plansForCategory.map((plan) => this.buildPlanObject(category.slug, plan)),
                };
                result.push(categoryObject);
            }
            console.log('✅ Planes construidos dinámicamente desde BD');
            return result;
        }
        catch (error) {
            console.error('❌ Error al obtener planes:', error);
            return {
                statusCode: response_enums_1.ResponseStatus.INTERNAL_SERVER_ERROR,
                message: 'Error al obtener planes',
                data: null,
            };
        }
    }
    buildPlanObject(categorySlug, plan) {
        const planId = `${categorySlug}-${plan.name.toLowerCase()}`;
        const { photos, videos, history } = this.getMediaLimitForPlan(plan.name);
        return {
            id: planId,
            icon: this.getIconForPlan(plan.name),
            price: this.getDefaultPriceDetails(plan.name),
            title: plan.name,
            features: this.getFeaturesForPlan(plan.name, { photos, videos, history }),
            mediaLimit: {
                photos,
                videos,
                history,
            },
        };
    }
    getCategoryLabel(categoryName) {
        const labels = {
            'Escort': 'Escort Mujer',
            'Trans': 'Escort Trans',
            'Fantasía': 'Fantasías',
            'Masajista Mujer': 'Masajista Mujer',
            'Masajista Hombre': 'Masajista Hombre',
            'Publicidad': 'Publicidad',
        };
        return labels[categoryName] || categoryName;
    }
    getIconForPlan(planName) {
        const icons = {
            'Nebulosa': 'plans/plan-diablo-bronce.svg',
            'Supernova': 'plans/plan-diablo-silver.svg',
            'Big Bang': 'plans/plan-diablo-gold.svg',
        };
        return icons[planName] || 'plans/plan-default.svg';
    }
    getFeaturesForPlan(planName, mediaLimit) {
        const baseFeatures = {
            'Nebulosa': [
                'Fotografía de portada de tamaño pequeño',
                'Listado en 3er grupo de portada y categoría',
                `Publicación de hasta {maxPhoto} fotografías en book`,
                `Carga de hasta {maxPhoto} fotos nuevas`,
                `Publicación de {maxVideo} video en book`,
                `Carga de {maxVideo} video en book`,
                `Publicación de {maxHistory} historia al día`,
                'Anuncio en promoción hasta por 7 días',
                'Acceso a plataforma de autoservicio 24hrs',
                'Asistencia telefónica en horario de oficina',
            ],
            'Supernova': [
                'Fotografía de portada de tamaño mediano',
                'Listado en 2do grupo de portada y categoría',
                `Publicación de hasta {maxPhoto} fotografías en book`,
                `Carga de hasta {maxPhoto} fotos nuevas`,
                `Publicación de {maxVideo} videos en book`,
                `Carga de {maxVideo} videos en book`,
                `Publicación de {maxHistory} historias al día`,
                'Anuncio en promoción hasta por 15 días',
                'Acceso a plataforma de autoservicio 24hrs',
                'Asistencia telefónica en horario de oficina',
            ],
            'Big Bang': [
                'Fotografía de portada de tamaño grande',
                'Listado en 1er grupo de portada y categoría',
                `Publicación de hasta {maxPhoto} fotografías en book`,
                `Carga de hasta {maxPhoto} fotos nuevas`,
                `Publicación de {maxVideo} video en book`,
                `Carga de {maxVideo} videos en book`,
                `Publicación de {maxHistory} historias al día`,
                'Anuncio en promoción hasta por 30 días',
                'Acceso a plataforma de autoservicio 24hrs',
                'Asistencia telefónica en horario de oficina',
            ],
        };
        const features = baseFeatures[planName] || [];
        return features.map((feature) => feature
            .replace('{maxPhoto}', mediaLimit.photos.toString())
            .replace('{maxVideo}', mediaLimit.videos.toString())
            .replace('{maxHistory}', mediaLimit.history.toString()));
    }
    getMediaLimitForPlan(planName) {
        const limits = {
            'Nebulosa': {
                photos: 4,
                videos: 1,
                history: 1,
            },
            'Supernova': {
                photos: 3,
                videos: 2,
                history: 2,
            },
            'Big Bang': {
                photos: 18,
                videos: 3,
                history: 3,
            },
        };
        return limits[planName] ?? { photos: 0, videos: 0, history: 0 };
    }
    async getAllKey() {
        try {
            const keysToIgnore = [
                'mykey',
                'plansUniverse',
                'user_2030304',
                'nationalities_redis',
                'region_redis',
            ];
            const allKeys = await this.redis.keys('*');
            const filteredKeys = allKeys.filter((key) => !keysToIgnore.includes(key) &&
                !key.startsWith('profile_'));
            const results = [];
            for (const key of filteredKeys) {
                const jsonData = await this.redis.get(key);
                if (!jsonData)
                    continue;
                const data = JSON.parse(jsonData);
                results.push({ key, value: data });
            }
            return {
                statusCode: 201,
                message: 'Claves Redis encontradas',
                data: results,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                statusCode: 500,
                message: 'Error al obtener claves de Redis',
            }, 500);
        }
    }
    async updateValueRedis(uuid, nick, data) {
        const keyRedis = `${uuid}_${nick}`;
        await this.cacheManager.set(keyRedis, data);
        return {
            statusCode: response_enums_1.ResponseStatus.SUCCESS,
            message: response_enums_1.ResponseMessage.REDIS_KEY_UPDATED,
        };
    }
    async deleteKey(key) {
        await this.cacheManager.del(key);
    }
    async getProfile(key) {
        const cachedProfile = await this.cacheManager.get(key);
        if (cachedProfile) {
            return {
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: 'Perfil encontrado en rd',
                data: cachedProfile,
            };
        }
    }
    async setProfileInRedis(key, profileData) {
        try {
            const insertRedis = await this.cacheManager.set(key, profileData);
            console.log('inserRedsLog', key);
        }
        catch (error) {
            throw new common_1.HttpException({
                statusCode: response_enums_1.ResponseStatus.INTERNAL_SERVER_ERROR,
                message: 'Failed to cache profile data',
            }, response_enums_1.ResponseStatus.INTERNAL_SERVER_ERROR);
        }
    }
    getDefaultPriceDetails(planName) {
        const priceMap = {
            'Nebulosa': [
                { label: '7 días', price: '$20.000', value: '7d' },
                { label: '15 días', price: '$30.000', value: '15d' },
                { label: '30 días', price: '$50.000', value: '30d' },
            ],
            'Supernova': [
                { label: '7 días', price: '$50', value: '7d' },
                { label: '15 días', price: '$90', value: '15d' },
                { label: '30 días', price: '$150', value: '30d' },
            ],
            'Big Bang': [
                { label: '7 días', price: '$50', value: '7d' },
                { label: '15 días', price: '$90', value: '15d' },
                { label: '30 días', price: '$150', value: '30d' },
            ],
        };
        return priceMap[planName] || [];
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(plans_config_entity_1.PlansConfigEntity)),
    __param(1, (0, typeorm_2.InjectRepository)(plan_entity_1.PlanEntity)),
    __param(2, (0, typeorm_2.InjectRepository)(service_category_entity_1.ServiceCategoryEntity)),
    __param(3, (0, typeorm_2.InjectRepository)(service_category_plan_entity_1.ServiceCategoryPlanEntity)),
    __param(4, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __param(5, (0, common_1.Inject)('REDIS')),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository, Object, ioredis_1.default])
], RedisService);
//# sourceMappingURL=redis.service.js.map