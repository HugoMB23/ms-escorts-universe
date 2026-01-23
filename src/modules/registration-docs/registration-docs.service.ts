import { Injectable, HttpException } from '@nestjs/common';
import { put } from '@vercel/blob';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';

@Injectable()
export class RegistrationDocsService {
  async uploadDocuments(
    files: { [fieldname: string]: Express.Multer.File[] } | null | undefined,
    uuid: string,
    nick: string,
  ) {
    if (!files || Object.keys(files).length === 0) {
      return {
        statusCode: ResponseStatus.SUCCESS,
        message: 'No files to upload',
        data: [],
      };
    }

    const keyPath = `${uuid}_${nick}`;
    const uploads: any[] = [];

    try {
      for (const fieldname of Object.keys(files)) {
        const fileList = files[fieldname] || [];
        for (const file of fileList) {
          const path = `${keyPath}/documents/${fieldname}/${file.originalname}`;
          const blob = await put(path, file.buffer, { access: 'public' });
          uploads.push({
            fieldname,
            originalName: file.originalname,
            url: blob.url,
            size: file.size,
          });
          console.log(`Uploaded document: ${path} -> ${blob.url}`);
        }
      }

      return {
        statusCode: ResponseStatus.SUCCESS,
        message: 'Documents uploaded successfully',
        data: uploads,
      };
    } catch (error) {
      console.error('Error uploading documents', error);
      throw new HttpException(
        {
          status: ResponseStatus.BAD_REQUEST,
          error: 'Failed to upload documents',
        },
        ResponseStatus.BAD_REQUEST,
      );
    }
  }
}
