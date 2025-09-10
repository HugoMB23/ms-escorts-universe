import { ProfileService } from './profile.service';
import { CreateProfileDto } from '../../common/dto/profile-create.dto';
import { UpdateProfileInformationDto } from '../../common/dto/profile-update.dto';
import { JwtService } from '../../modules/jwt/jwt.service';
export declare class ProfileController {
    private readonly profileSerivice;
    private readonly jwtService;
    constructor(profileSerivice: ProfileService, jwtService: JwtService);
    createProfile(profileUser: CreateProfileDto): Promise<import("../../interfaces/response.interface").ServiceResponse<import("../../common/entity/profile.entity").ProfileEntity>>;
    getProfile(req: Request): Promise<import("../../interfaces/response.interface").ServiceResponse<any>>;
    updateProfile(updateProfile: UpdateProfileInformationDto, req: Request): Promise<import("../../interfaces/response.interface").ServiceResponse<import("../../common/entity/profile.entity").ProfileEntity>>;
}
