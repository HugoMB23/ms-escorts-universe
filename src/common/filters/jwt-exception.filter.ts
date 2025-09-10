import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums'

@Catch(UnauthorizedException)
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        data: {},
        message: ResponseMessage.TOKEN_CADUCADO,
        statusCode: ResponseStatus.EXPIRED_TOKEN,
      });
  }
}
