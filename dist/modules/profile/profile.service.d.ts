import { Repository } from 'typeorm';
import { ProfileEntity } from '../../common/entity/profile.entity';
import { CreateProfileDto } from '../../common/dto/profile-create.dto';
import { ServiceResponse } from '../../interfaces/response.interface';
import { UserPlanEntity } from '../../common/entity/userPlan.entity';
import { UserEntity } from '../../common/entity/user.entity';
import { RedisService } from '../redis/redis.service';
import { UpdateProfileInformationDto } from '../../common/dto/profile-update.dto';
export declare class ProfileService {
    private readonly profileRepository;
    private readonly userPlanRepository;
    private readonly userRepository;
    private redisServices;
    constructor(profileRepository: Repository<ProfileEntity>, userPlanRepository: Repository<UserPlanEntity>, userRepository: Repository<UserEntity>, redisServices: RedisService);
    createProfile(createProfileDto: CreateProfileDto): Promise<ServiceResponse<ProfileEntity>>;
    getProfile(uuid: string): Promise<ServiceResponse<any>>;
    updateProfile(updateProfileDto: UpdateProfileInformationDto, userUuid: string): Promise<ServiceResponse<ProfileEntity>>;
}
