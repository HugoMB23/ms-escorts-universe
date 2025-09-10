import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileEntity } from '../../common/entity/profile.entity';
import { CreateProfileDto } from '../../common/dto/profile-create.dto';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';
import { ServiceResponse } from '../../interfaces/response.interface';
import { UserPlanEntity } from '../../common/entity/userPlan.entity';
import { UserEntity } from '../../common/entity/user.entity';
import { RedisService } from '../redis/redis.service';
import { UpdateProfileInformationDto } from '../../common/dto/profile-update.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    @InjectRepository(UserPlanEntity)
    private readonly userPlanRepository: Repository<UserPlanEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private redisServices : RedisService
  ) {}

  async createProfile(createProfileDto: CreateProfileDto): Promise<ServiceResponse<ProfileEntity>> {
    const user = await this.userRepository.findOne({ where: { uuid: createProfileDto.userUuid } });

    if (!user) {
      throw new HttpException(
        { statusCode: ResponseStatus.NOT_FOUND, message: `User with UUID ${createProfileDto.userUuid} not found` },
        ResponseStatus.NOT_FOUND,
      );
    }

    const newProfile = this.profileRepository.create(createProfileDto);
    newProfile.user = user; // Asignar el usuario al perfil

    const savedProfile = await this.profileRepository.save(newProfile);

    // const newUserPlan = this.userPlanRepository.create({
    //   user: user,
    //   idPlan: createProfileDto.idPlan,
    //   startDate: createProfileDto.startDate,
    //   endDate: createProfileDto.endDate,
    // });

   // await this.userPlanRepository.save(newUserPlan);

    return {
      statusCode: ResponseStatus.SUCCESS,
      message: ResponseMessage.PROFILE_CREATED,
      data: savedProfile,
    };
  }
  async getProfile(uuid: string): Promise<ServiceResponse<any>> {

    const keyRedis = `profile_${uuid}`;
    const cachedProfile = await this.redisServices.getProfile(keyRedis)

    if (cachedProfile) {
      return {
        statusCode: ResponseStatus.SUCCESS,
        message: 'Perfil encontrado rd',
        data: cachedProfile.data.data,
      };
    }

    const profile = await this.profileRepository.findOne({
      where: { userUuid: uuid },
      relations: ['user', 'user.userPlans', 'user.userPlans.plan', 'user.userPlans.plan.category'], // Cargar las relaciones necesarias
    });
  
    if (!profile) {
      throw new HttpException(
        { statusCode: ResponseStatus.NOT_FOUND, message: `Profile with ID ${uuid} not found` },
        ResponseStatus.NOT_FOUND,
      );
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
        listAdditionalService: profile.listService || [], // Asumiendo que listAdditionalService es igual a listService por ahora
      },
    };

    await this.redisServices.setProfileInRedis(keyRedis,profileData)
  
    return profileData;
  }

  async updateProfile(updateProfileDto: UpdateProfileInformationDto, userUuid:string): Promise<ServiceResponse<ProfileEntity>> { 
  
    // Buscar el perfil existente en la base de datos
    const existingProfile = await this.profileRepository.findOne({
      where: { userUuid },
      relations: ['user'],
    });
  
    if (!existingProfile) {
      throw new HttpException(
        { statusCode: ResponseStatus.NOT_FOUND, message: `Profile with UUID ${userUuid} not found` },
        ResponseStatus.NOT_FOUND,
      );
    }
  
    // Usar Object.assign para actualizar solo los campos definidos en el DTO
    Object.assign(existingProfile, updateProfileDto);
  
    // Guardar el perfil actualizado en la base de datos
    const updatedProfile = await this.profileRepository.save(existingProfile);
  
    // Eliminar la clave en Redis
    const keyRedis = `profile_${userUuid}`;
    await this.redisServices.deleteKey(keyRedis);
  
    return {
      statusCode: ResponseStatus.SUCCESS,
      message: ResponseMessage.PROFILE_UPDATED,
      data: updatedProfile,
    };
  }
  
  
}
