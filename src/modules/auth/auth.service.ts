import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto,CreateProfilPublicDto } from '../../common/dto/auth-create.dto';
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
import { ProfileEntity } from '../../common/entity/profile.entity';
import { CreateProfileDto } from '../../common/dto/profile-create.dto';
import { RegisterPublicV1Dto } from './dto/registerPublicV1.dto'
import { RegistrationDocsService } from '../registration-docs/registration-docs.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private jwtService: JwtService,
    private mailerService: MailService,
    private registrationDocsService: RegistrationDocsService,
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
  async createAccountUserPublicv1(userPublicData: RegisterPublicV1Dto, files?: { [fieldname: string]: Express.Multer.File[] }) {
    const exist = await this.findUser(userPublicData.step2.email);
    if (!exist) {
      // encrypt password
      userPublicData.step2.password = await this.encryPasswordUser(userPublicData.step2.password);

      const newUser: UserEntity = {
        uuid: uuidv4(),
        nick: userPublicData.step2.nickname,
        email: userPublicData.step2.email,
        password: userPublicData.step2.password,
        rol: 1,
        birthDate: userPublicData.step2.birthdate,
        userPlans: [],
        resetToken: null,
        resetTokenExpiration: null,
      };

      const createdUser = await this.userRepository.save(newUser);

      // If user created, map profile information from the multi-step payload
      if (createdUser?.uuid) {
        // compute age from ISO birthdate if provided
        let age = null;
        try {
          const birth = new Date(userPublicData.step2.birthdate);
          const today = new Date();
          let computed = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            computed--;
          }
          age = computed;
        } catch (e) {
          age = null;
        }

        // Map services (strings) to the expected shape used elsewhere
        const listService = (userPublicData.step3?.services || []).map((s) => ({
          serviceName: s,
          serviceDescription: '',
        }));

        // Map smoking to boolean (simple heuristic)
        const smoker = !!userPublicData.step3?.smoking &&
          String(userPublicData.step3.smoking).toLowerCase().includes('no')
          ? false
          : !!userPublicData.step3?.smoking && String(userPublicData.step3.smoking).toLowerCase() !== 'no';

        const informationProfile: any = {
          age: age,
          description: userPublicData.step2.description,
          nationality: userPublicData.step2.nationality,
          height: userPublicData.step3 ? String(userPublicData.step3.height) : '',
          weight: userPublicData.step3 ? String((userPublicData.step3 as any).weight ?? 0) : '0',
          waist: userPublicData.step3 ? String(userPublicData.step3.measurementWaist) : '',
          bust: userPublicData.step3 ? String(userPublicData.step3.measurementBust) : '',
          hips: userPublicData.step3 ? String(userPublicData.step3.measurementHips) : '',
          bodyType: userPublicData.step3?.bodyType || '',
          depilation: false,
          listService: listService,
          tattoos: false,
          piercings: false,
          smoker: smoker,
          drinker: false,
          languages: '',
          eyeColor: '',
          hairColor: '',
          parking: !!userPublicData.step2.hasParking,
          startDate: null,
          endDate: null,
        };

        const bodyProfile: CreateProfileDto = {
          userUuid: createdUser.uuid,
          informationProfile,
        };

        // create profile record
        await this.createRegisterUser(bodyProfile);

        // Upload registration documents (photos, payment docs, etc) associated with this user
        try {
          if (files && Object.keys(files).length > 0) {
            const uploadResult = await this.registrationDocsService.uploadDocuments(
              files,
              createdUser.uuid,
              createdUser.nick,
            );
            console.log('Registration documents uploaded:', uploadResult);
          }
        } catch (error) {
          // Non-blocking error: log but don't fail registration
          console.warn('Warning: Failed to upload registration documents', error);
        }
      }

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
  async createAccountUserPublic (userPublicData : CreateProfilPublicDto){
  
  const exist = await this.findUser(userPublicData.email);

  if (!exist) {
      userPublicData.password = await this.encryPasswordUser(userPublicData.password);
      const newUser: UserEntity = {
        uuid: uuidv4(),
        nick: userPublicData.nick,
        email: userPublicData.email,
        password: userPublicData.password,
        rol: 1,
        birthDate: userPublicData.birthDate,
        userPlans: [],
        resetToken:null,
        resetTokenExpiration:null
      };
      const creataeUser = await this.userRepository.save(newUser);
      if(creataeUser?.uuid){
        
        const bodyProfile : CreateProfileDto = {
          userUuid: creataeUser.uuid,
          informationProfile : {
          age: await this.calculateAge(userPublicData.birthDate),
          description : "test",
          nationality: userPublicData.nationality,
          height: userPublicData.height,
          waist: userPublicData.waist,
          bust: userPublicData.bust,
          hips: userPublicData.hips,
          bodyType: userPublicData.bodyType,
          depilation: userPublicData.depilation,
          listService: userPublicData.listService,
          tattoos: userPublicData.tattoos,
          piercings: userPublicData.piercings,
          smoker: userPublicData.smoker,
          drinker: userPublicData.drinker,
          languages: userPublicData.languages,
          eyeColor: userPublicData.eyeColor,
          hairColor: userPublicData.hairColor,
          parking: userPublicData.parking,
          startDate: null,
          endDate : null, 
          weight: userPublicData.weight 
         }      
          
        }
        console.log('entre al if',bodyProfile)
        await this.createRegisterUser(bodyProfile)

      }
      
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
  async createRegisterUser(createProfileDto : CreateProfileDto){
    const { userUuid, informationProfile } = createProfileDto;
    console.log('log test',informationProfile)
    const newProfile = await this.profileRepository.create({userUuid,...informationProfile});
    
    const savedProfile = await this.profileRepository.save(newProfile);
    console.log('respuesta create',savedProfile)
    return savedProfile
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
  async calculateAge(birthDate: string) {
    
    const normalized = birthDate.replace(/-/g, '/'); 
    const [day, month, year] = normalized.split('/').map(Number);

    if (!day || !month || !year) {
      throw new Error('Formato de fecha inválido. Usa dd-MM-yyyy o dd/MM/yyyy');
    }

    const birth = new Date(year, month - 1, day);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    // Si aún no ha cumplido años este año, restamos 1
    const hasBirthdayPassed =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

    if (!hasBirthdayPassed) {
      age--;
    }

    return age;
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
