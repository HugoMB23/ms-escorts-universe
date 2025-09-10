import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ImageValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files = request.files; // Para múltiples archivos
    const file = request.file; // Para un solo archivo

    const validImageMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      // Puedes agregar más tipos MIME válidos aquí
    ];

    if (files) {
      // Validar múltiples archivos
      for (const file of files) {
        if (!validImageMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(`File ${file.originalname} is not a valid image`);
        }
      }
    } else if (file && !validImageMimeTypes.includes(file.mimetype)) {
      // Validar un solo archivo
      throw new BadRequestException(`File ${file.originalname} is not a valid image`);
    }

    return next.handle();
  }
}
