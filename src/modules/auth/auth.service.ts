import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../../common/dto/auth-create.dto';
import { UserEntity } from '../../common/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../../common/dto/auth-login.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { DateTime } from 'luxon';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private mailerService: MailService,
  ) {}

  async createAccountUser(userData: CreateUserDto) {
    const exist = await this.findUser(userData.email);
    if (!exist) {
      userData.password = await this.encryPasswordUser(userData.password);
      const newUser: UserEntity = {
        uuid: uuidv4(),
        nick: userData.nick,
        email: userData.email,
        password: userData.password,
        rol: userData.rol,
        birthDate: userData.birthDate,
        userPlans: [],
        resetToken:null,
        resetTokenExpiration:null
      };
      await this.userRepository.save(newUser);
      return {
        data: {},
        statusCode: ResponseStatus.SUCCESS,
        message: ResponseMessage.ACCOUNT_CREATED,
      };
    } else {
      throw new HttpException(
        {
          status: ResponseStatus.CONFLICT,
          error: ResponseMessage.EMAIL_ALREADY_REGISTERED,
        },
        ResponseStatus.CONFLICT,
      );
    }
  }

  async loginUser(UserData: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: UserData.email },
      relations: ['userPlans', 'userPlans.plan'],
    });

    if (
      user &&
      (await this.decryptPassword(UserData.password, user.password))
    ) {
      const { password, ...userWithoutPassword } = user;

      // Si el usuario es administrador, omite la información de plan

      if (user.rol === 3) {
        const payload = { sub: user.uuid, username: user.nick, role: user.rol };
        return {
          ...userWithoutPassword,
          access_token: await this.jwtService.signAsync(payload),
          statusCode: ResponseStatus.SUCCESS,
          message: ResponseMessage.LOGIN_SUCCESS,
        };
      }

      const userPlan = user.userPlans.length > 0 ? user.userPlans[0] : null;
      console.log('data plan',user)
      const payload = {
        sub: user.uuid,
        username: user.nick,
        plan: userPlan.plan.name,
        roles: user.rol,
      };
      return {
        //...userWithoutPassword,
        access_token: await this.jwtService.signAsync(payload),
        // plan: userPlan ? {
        //   idPlan: userPlan.idPlan,
        //   startDate: userPlan.startDate,
        //   endDate: userPlan.endDate,
        // } : null,
        statusCode: ResponseStatus.SUCCESS,
        message: ResponseMessage.LOGIN_SUCCESS,
      };
    } else {
      throw new HttpException(
        {
          status: ResponseStatus.UNAUTHORIZED,
          error: ResponseMessage.INVALID_CREDENTIALS,
        },
        ResponseStatus.UNAUTHORIZED,
      );
    }
  }

  async encryPasswordUser(password: string) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  async decryptPassword(password: string, hash: string) {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  }

  async findUser(emailUser: string) {
    const user = await this.userRepository.findOneBy({ email: emailUser });
    return JSON.parse(JSON.stringify(user));
  }

  async validToken(token: string) {
    try {
      const decodedToken = await this.jwtService.verifyAsync(token);
      return {
        statusCode: ResponseStatus.SUCCESS,
        message: ResponseMessage.TOKEN_VALID,
        data: decodedToken,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: ResponseStatus.UNAUTHORIZED,
          error: ResponseMessage.TOKEN_INVALID,
        },
        ResponseStatus.UNAUTHORIZED,
      );
    }
  }
  async resetPasswordUser(data: any) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) {
      throw new HttpException(
        {
          data : {},
          statusCode: ResponseStatus.NO_CONTEXT,
          message: ResponseMessage.RESET_PASSWORD_EMAIL_SENT,
        },
        ResponseStatus.NO_CONTEXT,
      );
    }

    const resetToken = this.generateResetToken();
    const resetTokenExpiration = DateTime.now()
      .setZone('America/Santiago')
      .plus({ minutes: 30 })
      .toJSDate()

    // Guardar el token y su expiración en la base de datos
    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;
    await this.userRepository.save(user);

    // Enviar el token por correo electrónico
    await this.mailerService.sendResetPasswordEmail(user.email, resetToken);

    return {
      statusCode: ResponseStatus.SUCCESS,
      message: ResponseMessage.RESET_PASSWORD_EMAIL_SENT,
    };
  }
  async confirmPasswordReset(data: { token: string; newPassword: string }) {
    const user = await this.userRepository.findOne({
      where: { resetToken: data.token },
    });

    if (!user) {
      throw new HttpException(
        {
          data: {},
          statusCode: ResponseStatus.UNAUTHORIZED,
          message: ResponseMessage.INVALID_OR_EXPIRED_TOKEN,
        },
        ResponseStatus.NO_CONTEXT,
      );
    }

    const resetTokenExpiration = user.resetTokenExpiration
  
    if (resetTokenExpiration < DateTime.now().setZone('America/Santiago').toJSDate()) {
      throw new HttpException(
        {
          status: ResponseStatus.UNAUTHORIZED,
          error: ResponseMessage.INVALID_OR_EXPIRED_TOKEN,
        },
        ResponseStatus.UNAUTHORIZED,
      );
    }

    user.password = await this.encryPasswordUser(data.newPassword);
    user.resetToken = null;
    user.resetTokenExpiration = null;

    await this.userRepository.save(user);

    return {
      statusCode: ResponseStatus.SUCCESS,
      message: ResponseMessage.PASSWORD_RESET_SUCCESS,
    };
  }

  generateResetToken(): string {
    return crypto.randomBytes(14).toString('hex');
  }
}
