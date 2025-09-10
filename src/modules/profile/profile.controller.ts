import {
  UseGuards,
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from '../../common/dto/profile-create.dto';
import { UpdateProfileInformationDto } from '../../common/dto/profile-update.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtService } from '../../modules/jwt/jwt.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileSerivice: ProfileService,
    private readonly jwtService: JwtService
) {}

  @Post('register')
  async createProfile(@Body() profileUser: CreateProfileDto) {
    console.log('entre');
    return this.profileSerivice.createProfile(profileUser);
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    const {
      username: nick,
      sub: uuid,
      code,
      message,
    } = this.jwtService.decodeToken(token);

    if (code !== 200) {
      throw new UnauthorizedException(message);
    }
    return this.profileSerivice.getProfile(uuid);
  }
  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() updateProfile: UpdateProfileInformationDto,
    @Req() req: Request,
  ) {
    const token = req.headers['authorization'].split(' ')[1];
    const {
      username: nick,
      sub: uuid,
      code,
      message,
    } = this.jwtService.decodeToken(token);

    if (code !== 200) {
      throw new UnauthorizedException(message);
    }
    return this.profileSerivice.updateProfile(updateProfile,uuid);
  }
}
