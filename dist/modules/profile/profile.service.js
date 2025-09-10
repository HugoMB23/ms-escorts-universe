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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const profile_entity_1 = require("../../common/entity/profile.entity");
const response_enums_1 = require("../../enum/response.enums");
const userPlan_entity_1 = require("../../common/entity/userPlan.entity");
const user_entity_1 = require("../../common/entity/user.entity");
const redis_service_1 = require("../redis/redis.service");
let ProfileService = class ProfileService {
    constructor(profileRepository, userPlanRepository, userRepository, redisServices) {
        this.profileRepository = profileRepository;
        this.userPlanRepository = userPlanRepository;
        this.userRepository = userRepository;
        this.redisServices = redisServices;
    }
    async createProfile(createProfileDto) {
        const user = await this.userRepository.findOne({ where: { uuid: createProfileDto.userUuid } });
        if (!user) {
            throw new common_1.HttpException({ statusCode: response_enums_1.ResponseStatus.NOT_FOUND, message: `User with UUID ${createProfileDto.userUuid} not found` }, response_enums_1.ResponseStatus.NOT_FOUND);
        }
        const newProfile = this.profileRepository.create(createProfileDto);
        newProfile.user = user;
        const savedProfile = await this.profileRepository.save(newProfile);
        return {
            statusCode: response_enums_1.ResponseStatus.SUCCESS,
            message: response_enums_1.ResponseMessage.PROFILE_CREATED,
            data: savedProfile,
        };
    }
    async getProfile(uuid) {
        const keyRedis = `profile_${uuid}`;
        const cachedProfile = await this.redisServices.getProfile(keyRedis);
        if (cachedProfile) {
            return {
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: 'Perfil encontrado rd',
                data: cachedProfile.data.data,
            };
        }
        const profile = await this.profileRepository.findOne({
            where: { userUuid: uuid },
            relations: ['user', 'user.userPlans', 'user.userPlans.plan', 'user.userPlans.plan.category'],
        });
        if (!profile) {
            throw new common_1.HttpException({ statusCode: response_enums_1.ResponseStatus.NOT_FOUND, message: `Profile with ID ${uuid} not found` }, response_enums_1.ResponseStatus.NOT_FOUND);
        }
        const plan = profile.user?.userPlans?.[0]?.plan;
        const planName = plan?.name || 'No Plan Assigned';
        const idCategory = plan?.idCategory || null;
        const categoryName = plan?.category?.name || 'No Category Assigned';
        const profileData = {
            statusCode: 201,
            message: 'Perfil encontrado pg',
            data: {
                age: profile.age,
                description: profile.description,
                nick: profile.user?.nick,
                birthDate: profile.user?.birthDate,
                plan: planName,
                categoryName: categoryName,
                idCategory: idCategory,
                characteristics: {
                    nationality: profile.nationality,
                    height: profile.height,
                    weight: profile.weight,
                    waist: profile.waist,
                    bust: profile.bust,
                    hips: profile.hips,
                    bodyType: profile.bodyType,
                    depilation: profile.depilation,
                    tattoos: profile.tattoos,
                    piercings: profile.piercings,
                    smoker: profile.smoker,
                    drinker: profile.drinker,
                    languages: profile.languages,
                    eyeColor: profile.eyeColor,
                    hairColor: profile.hairColor,
                },
                listService: profile.listService || [],
                listAdditionalService: profile.listService || [],
            },
        };
        await this.redisServices.setProfileInRedis(keyRedis, profileData);
        return profileData;
    }
    async updateProfile(updateProfileDto, userUuid) {
        const existingProfile = await this.profileRepository.findOne({
            where: { userUuid },
            relations: ['user'],
        });
        if (!existingProfile) {
            throw new common_1.HttpException({ statusCode: response_enums_1.ResponseStatus.NOT_FOUND, message: `Profile with UUID ${userUuid} not found` }, response_enums_1.ResponseStatus.NOT_FOUND);
        }
        Object.assign(existingProfile, updateProfileDto);
        const updatedProfile = await this.profileRepository.save(existingProfile);
        const keyRedis = `profile_${userUuid}`;
        await this.redisServices.deleteKey(keyRedis);
        return {
            statusCode: response_enums_1.ResponseStatus.SUCCESS,
            message: response_enums_1.ResponseMessage.PROFILE_UPDATED,
            data: updatedProfile,
        };
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(profile_entity_1.ProfileEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(userPlan_entity_1.UserPlanEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        redis_service_1.RedisService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map