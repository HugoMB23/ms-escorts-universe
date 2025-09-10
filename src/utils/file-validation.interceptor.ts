import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files = request.files; // Para múltiples archivos
    const file = request.file; // Para un solo archivo

    const validMimeTypes = [
      // Tipos MIME válidos para imágenes
      'image/jpeg',
      'image/png',
      'image/gif',
      // Tipos MIME válidos para videos
      'video/mp4',
      'video/avi',
      'video/mpeg',
      'video/quicktime',
      'video/x-ms-wmv'
      // Puedes agregar más tipos MIME válidos aquí
    ];

    if (files) {
      // Validar múltiples archivos
      for (const file of files) {
        if (!validMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(`File ${file.originalname} is not a valid image or video`);
        }
      }
    } else if (file && !validMimeTypes.includes(file.mimetype)) {
      // Validar un solo archivo
      throw new BadRequestException(`File ${file.originalname} is not a valid image or video`);
    }

    return next.handle();
  }
}
