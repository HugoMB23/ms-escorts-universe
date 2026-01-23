import { CreateUserDto, CreateProfilPublicDto } from '../../common/dto/auth-create.dto';
import { UserEntity } from '../../common/entity/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from '../../common/dto/auth-login.dto';
import { JwtService } from '@nestjs/jwt';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';
import { MailService } from '../mail/mail.service';
import { ProfileEntity } from '../../common/entity/profile.entity';
import { CreateProfileDto } from '../../common/dto/profile-create.dto';
import { RegisterPublicV1Dto } from './dto/registerPublicV1.dto';
import { RegistrationDocsService } from '../registration-docs/registration-docs.service';
export declare class AuthService {
    private userRepository;
    private readonly profileRepository;
    private jwtService;
    private mailerService;
    private registrationDocsService;
    constructor(userRepository: Repository<UserEntity>, profileRepository: Repository<ProfileEntity>, jwtService: JwtService, mailerService: MailService, registrationDocsService: RegistrationDocsService);
    createAccountUser(userData: CreateUserDto): Promise<{
        data: {};
        statusCode: ResponseStatus;
        message: ResponseMessage;
    }>;
    createAccountUserPublicv1(userPublicData: RegisterPublicV1Dto, files?: {
        [fieldname: string]: Express.Multer.File[];
    }): Promise<{
        data: {};
        statusCode: ResponseStatus;
        message: ResponseMessage;
    }>;
    createAccountUserPublic(userPublicData: CreateProfilPublicDto): Promise<{
        data: {};
        statusCode: ResponseStatus;
        message: ResponseMessage;
    }>;
    createRegisterUser(createProfileDto: CreateProfileDto): Promise<ProfileEntity>;
    loginUser(UserData: LoginUserDto): Promise<{
        access_token: string;
        statusCode: ResponseStatus;
        message: ResponseMessage;
        uuid: string;
        nick: string;
        email: string;
        rol: number;
        birthDate: string;
        resetToken: string;
        resetTokenExpiration: Date;
        profile?: ProfileEntity;
        userPlans: import("../../common/entity/userPlan.entity").UserPlanEntity[];
    } | {
        access_token: string;
        statusCode: ResponseStatus;
        message: ResponseMessage;
    }>;
    encryPasswordUser(password: string): Promise<any>;
    decryptPassword(password: string, hash: string): Promise<any>;
    findUser(emailUser: string): Promise<any>;
    calculateAge(birthDate: string): Promise<number>;
    validToken(token: string): Promise<{
        statusCode: ResponseStatus;
        message: ResponseMessage;
        data: any;
    }>;
    resetPasswordUser(data: any): Promise<{
        statusCode: ResponseStatus;
        message: ResponseMessage;
    }>;
    confirmPasswordReset(data: {
        token: string;
        newPassword: string;
    }): Promise<{
        statusCode: ResponseStatus;
        message: ResponseMessage;
    }>;
    generateResetToken(): string;
}
