import { CreateUserDto } from '../../common/dto/auth-create.dto';
import { UserEntity } from '../../common/entity/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from '../../common/dto/auth-login.dto';
import { JwtService } from '@nestjs/jwt';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private mailerService;
    constructor(userRepository: Repository<UserEntity>, jwtService: JwtService, mailerService: MailService);
    createAccountUser(userData: CreateUserDto): Promise<{
        data: {};
        statusCode: ResponseStatus;
        message: ResponseMessage;
    }>;
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
        profile?: import("../../common/entity/profile.entity").ProfileEntity;
        userPlans: import("../../common/entity/userPlan.entity").UserPlanEntity[];
    } | {
        access_token: string;
        statusCode: ResponseStatus;
        message: ResponseMessage;
    }>;
    encryPasswordUser(password: string): Promise<any>;
    decryptPassword(password: string, hash: string): Promise<any>;
    findUser(emailUser: string): Promise<any>;
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
