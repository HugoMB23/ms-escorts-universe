import { CreateUserDto } from '../../common/dto/auth-create.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../../common/dto/auth-login.dto';
import { TokenUserDto } from '../../common/dto/auth-token.dto';
import { ConfirmPasswordResetDto } from './dto/confirmPassword.dto';
import { ResetPasswordDto } from './dto/resetPass.dto';
import { RegisterDto } from './dto/registerPublic.dto';
export declare class AuthController {
    private readonly authSerivice;
    constructor(authSerivice: AuthService);
    login(loginUser: LoginUserDto): Promise<{
        access_token: string;
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
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
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
    }>;
    validToken(data: TokenUserDto): Promise<{
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
        data: any;
    }>;
    createAccount(createUser: CreateUserDto): Promise<any>;
    register(registerDto: RegisterDto, files: {
        photos?: Express.Multer.File[];
        photoProfile?: Express.Multer.File[];
        photoPayment?: Express.Multer.File[];
    }): Promise<{
        data: {};
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
    }>;
    registerPublicV1(bodyRaw: any, files: {
        [fieldname: string]: Express.Multer.File[];
    }): Promise<{
        data: {};
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
    }>;
    resetPassword(data: ResetPasswordDto): Promise<{
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
    }>;
    confirmPasswordReset(data: ConfirmPasswordResetDto): Promise<{
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: import("../../enum/response.enums").ResponseMessage;
    }>;
}
