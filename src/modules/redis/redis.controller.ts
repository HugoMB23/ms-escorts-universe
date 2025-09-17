import { Body, Controller, Get, Param, Post, Put, Req, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { RedisService } from './redis.service';
import { UpdateProfileDto } from '../../common/dto/redis-updateOrder.dto';
import { JwtService } from '../../modules/jwt/jwt.service';
import { JwtExceptionFilter } from '../../common/filters/jwt-exception.filter';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
@Controller('redis')
@UseFilters(JwtExceptionFilter)
export class RedisController {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  async getValue(@Req() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    const { sub: uuid, username: nick, code, message } = this.jwtService.decodeToken(token);

    if (code !== 200) {
      throw new UnauthorizedException(message);
    }

    return this.redisService.getValueRedis(uuid, nick);
  }

  @Put()
  async updateOrders(@Body() data: UpdateProfileDto, @Req() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    const { sub: uuid, username: nick, code, message } = this.jwtService.decodeToken(token);

    if (code !== 200) {
      throw new UnauthorizedException(message);
    }

    return this.redisService.updateValueRedis(uuid, nick, data);
  }
  @Get('plans')
  async getPlans (){
   return this.redisService.getPlans()
  }

  @Get('all')
  async getAllKeys (){
   return this.redisService.getAllKey()
  }
}
