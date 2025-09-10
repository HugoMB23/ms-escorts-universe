import { Injectable, HttpException, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { put, del } from '@vercel/blob';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';

@Injectable()
export class CoverService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async uploadCover(file: Express.Multer.File, uuid: string, nick: string) {
    if (!file) {
      throw new HttpException(
        {
          status: ResponseStatus.BAD_REQUEST,
          error: 'No file provided or cannot be processed',
        },
        ResponseStatus.BAD_REQUEST,
      );
    }

    const nickUrl = `${uuid}_${nick}`;
    const path = `${nickUrl}/cover/${file.originalname}`;
    const blob = await put(path, file.buffer, { access: 'public' });
    return await this.updateCover(nickUrl, blob);
  }

  async updateCover(key: string, dataRedis: any) {
    const currentData = await this.getDataRedis(key);
    if (currentData) {
      const coverLast = currentData.cover ? currentData.cover : '';
      currentData.cover = dataRedis.url;
      await this.cacheManager.set(key, currentData);
      if (coverLast !== '') {
        await del(coverLast);
      }
      return {
        data: dataRedis.url,
        statusCode: ResponseStatus.SUCCESS,
        message: ResponseMessage.COVER_UPDATED,
      };
    } else {
      throw new HttpException(
        { status: ResponseStatus.NOT_FOUND, error: 'Key not found' },
        ResponseStatus.NOT_FOUND,
      );
    }
  }

  async getDataRedis(key: string) {
    return await this.cacheManager.get<{
      avatar: string;
      cover: string;
      videos: any[];
      histories: any[];
      photos: { url: string }[];
    }>(key);
  }
}
