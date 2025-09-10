import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  Param,
  UseInterceptors,
  Req,
  UseFilters,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HistoryService } from './history.service';
import { FileValidationInterceptor } from '../../utils/file-validation.interceptor';
import { JwtService } from '../../modules/jwt/jwt.service';
import { JwtExceptionFilter } from '../../common/filters/jwt-exception.filter';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('history')
@UseFilters(JwtExceptionFilter)
export class HistoryController {
  constructor(
    private readonly historyService: HistoryService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('historyUpload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'), FileValidationInterceptor)
  async uploadHistory(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const token = req.headers['authorization'].split(' ')[1];
    const { username: nick, sub: uuid, plan: plan, code, message } = this.jwtService.decodeToken(token);

    if (code !== 200) {
      throw new UnauthorizedException(message);
    }

    return this.historyService.uploadHistory(file, uuid, nick, plan);
  }

  @Delete('delete/:historyUrl')
  @UseGuards(JwtAuthGuard)
  async deleteHistory(@Param('historyUrl') historyUrl: string, @Req() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    const { username: nick, sub: uuid, code, message } = this.jwtService.decodeToken(token);

    if (code !== 200) {
      throw new UnauthorizedException(message);
    }

    return this.historyService.deleteHistory(historyUrl, uuid, nick);
  }
}
