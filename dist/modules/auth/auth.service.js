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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../common/entity/user.entity");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const uuid_1 = require("uuid");
const response_enums_1 = require("../../enum/response.enums");
const crypto = require("crypto");
const mail_service_1 = require("../mail/mail.service");
const luxon_1 = require("luxon");
let AuthService = class AuthService {
    constructor(userRepository, jwtService, mailerService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.mailerService = mailerService;
    }
    async createAccountUser(userData) {
        const exist = await this.findUser(userData.email);
        if (!exist) {
            userData.password = await this.encryPasswordUser(userData.password);
            const newUser = {
                uuid: (0, uuid_1.v4)(),
                nick: userData.nick,
                email: userData.email,
                password: userData.password,
                rol: userData.rol,
                birthDate: userData.birthDate,
                userPlans: [],
                resetToken: null,
                resetTokenExpiration: null
            };
            await this.userRepository.save(newUser);
            return {
                data: {},
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: response_enums_1.ResponseMessage.ACCOUNT_CREATED,
            };
        }
        else {
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.CONFLICT,
                error: response_enums_1.ResponseMessage.EMAIL_ALREADY_REGISTERED,
            }, response_enums_1.ResponseStatus.CONFLICT);
        }
    }
    async loginUser(UserData) {
        const user = await this.userRepository.findOne({
            where: { email: UserData.email },
            relations: ['userPlans', 'userPlans.plan'],
        });
        if (user &&
            (await this.decryptPassword(UserData.password, user.password))) {
            const { password, ...userWithoutPassword } = user;
            if (user.rol === 3) {
                const payload = { sub: user.uuid, username: user.nick, role: user.rol };
                return {
                    ...userWithoutPassword,
                    access_token: await this.jwtService.signAsync(payload),
                    statusCode: response_enums_1.ResponseStatus.SUCCESS,
                    message: response_enums_1.ResponseMessage.LOGIN_SUCCESS,
                };
            }
            const userPlan = user.userPlans.length > 0 ? user.userPlans[0] : null;
            const payload = {
                sub: user.uuid,
                username: user.nick,
                plan: userPlan.plan.name,
                roles: user.rol,
            };
            return {
                access_token: await this.jwtService.signAsync(payload),
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: response_enums_1.ResponseMessage.LOGIN_SUCCESS,
            };
        }
        else {
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.UNAUTHORIZED,
                error: response_enums_1.ResponseMessage.INVALID_CREDENTIALS,
            }, response_enums_1.ResponseStatus.UNAUTHORIZED);
        }
    }
    async encryPasswordUser(password) {
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(password, saltOrRounds);
        return hash;
    }
    async decryptPassword(password, hash) {
        const isMatch = await bcrypt.compare(password, hash);
        return isMatch;
    }
    async findUser(emailUser) {
        const user = await this.userRepository.findOneBy({ email: emailUser });
        return JSON.parse(JSON.stringify(user));
    }
    async validToken(token) {
        try {
            const decodedToken = await this.jwtService.verifyAsync(token);
            return {
                statusCode: response_enums_1.ResponseStatus.SUCCESS,
                message: response_enums_1.ResponseMessage.TOKEN_VALID,
                data: decodedToken,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.UNAUTHORIZED,
                error: response_enums_1.ResponseMessage.TOKEN_INVALID,
            }, response_enums_1.ResponseStatus.UNAUTHORIZED);
        }
    }
    async resetPasswordUser(data) {
        const user = await this.userRepository.findOne({
            where: { email: data.email },
        });
        if (!user) {
            throw new common_1.HttpException({
                data: {},
                statusCode: response_enums_1.ResponseStatus.NO_CONTEXT,
                message: response_enums_1.ResponseMessage.RESET_PASSWORD_EMAIL_SENT,
            }, response_enums_1.ResponseStatus.NO_CONTEXT);
        }
        const resetToken = this.generateResetToken();
        const resetTokenExpiration = luxon_1.DateTime.now()
            .setZone('America/Santiago')
            .plus({ minutes: 30 })
            .toJSDate();
        user.resetToken = resetToken;
        user.resetTokenExpiration = resetTokenExpiration;
        await this.userRepository.save(user);
        await this.mailerService.sendResetPasswordEmail(user.email, resetToken);
        return {
            statusCode: response_enums_1.ResponseStatus.SUCCESS,
            message: response_enums_1.ResponseMessage.RESET_PASSWORD_EMAIL_SENT,
        };
    }
    async confirmPasswordReset(data) {
        const user = await this.userRepository.findOne({
            where: { resetToken: data.token },
        });
        if (!user) {
            throw new common_1.HttpException({
                data: {},
                statusCode: response_enums_1.ResponseStatus.UNAUTHORIZED,
                message: response_enums_1.ResponseMessage.INVALID_OR_EXPIRED_TOKEN,
            }, response_enums_1.ResponseStatus.NO_CONTEXT);
        }
        const resetTokenExpiration = user.resetTokenExpiration;
        if (resetTokenExpiration < luxon_1.DateTime.now().setZone('America/Santiago').toJSDate()) {
            throw new common_1.HttpException({
                status: response_enums_1.ResponseStatus.UNAUTHORIZED,
                error: response_enums_1.ResponseMessage.INVALID_OR_EXPIRED_TOKEN,
            }, response_enums_1.ResponseStatus.UNAUTHORIZED);
        }
        user.password = await this.encryPasswordUser(data.newPassword);
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await this.userRepository.save(user);
        return {
            statusCode: response_enums_1.ResponseStatus.SUCCESS,
            message: response_enums_1.ResponseMessage.PASSWORD_RESET_SUCCESS,
        };
    }
    generateResetToken() {
        return crypto.randomBytes(14).toString('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map