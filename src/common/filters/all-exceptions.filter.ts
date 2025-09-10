import { Catch, ExceptionFilter, HttpException, ArgumentsHost } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    
    // Puedes agregar lógica específica para manejar errores de Redis
    if (exception instanceof Error && exception.message.includes('max daily request limit exceeded')) {
      response
        .status(429)
        .json({
          statusCode: 429,
          message: 'Request limit exceeded, please try again later.',
        });
      return;
    }

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
