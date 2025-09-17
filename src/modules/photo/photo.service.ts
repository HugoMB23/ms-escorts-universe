import { Cache } from 'cache-manager';
import { Inject, Injectable, HttpException } from '@nestjs/common';
import { put, del } from '@vercel/blob';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UpdatePhotoHighlightedDto } from '../../common/dto/profile-path.dto';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';
import { PhotoState } from '../../enum/photoState.enum';
import { resolveMediaLimit } from '../../utils/plan-limits.util';

@Injectable()
export class PhotosService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async uploadPhotos(
    files: Express.Multer.File[],
    nick?: string,
    uuid?: string,
    plan?: string,
  ) {
    console.log('plan',plan)
    console.log('files',files)
    if (!files || files.length === 0) {
      throw new HttpException(
        {
          status: ResponseStatus.BAD_REQUEST,
          error: 'No files provided or cannot be processed',
        },
        ResponseStatus.BAD_REQUEST,
      );
    }

    const nickUrl = `${uuid}_${nick}`;
    let currentData = await this.getDataRedis(nickUrl);
    const key_plans = process.env.KEY_REDIS_PLANS || 'plansUniverse';
    const plansUniverse: any = await this.cacheManager.get(key_plans);

    if (!currentData) {
      currentData = {
        avatar: '',
        cover: '',
        videos: [],
        histories: [],
        photos: [],
      };
    }
    const { maxAllowed: maxPhotosAllowed, resolvedPlanId } = resolveMediaLimit(plansUniverse, plan,'photos');
    console.log('response maximo',maxPhotosAllowed)

    const currentPhotoCount = currentData.photos.length;

    if (currentPhotoCount + files.length > maxPhotosAllowed) {
      throw new HttpException(
        {
          status: ResponseStatus.BAD_REQUEST,
          error: `Cannot upload photos. The plan ${resolvedPlanId} allows a maximum of ${maxPhotosAllowed} photos.`,
        },
        ResponseStatus.BAD_REQUEST,
      );
    }
    console.log('log reduce',currentData);
    const highestOrder =
      currentData.photos.reduce(
        (max, photo) => Math.max(max, Number(photo.orden)),
        0,
      ) || 0;

    const uploadPromises = files.map((file, index) => {
      const getExtensionImg = this.getFomartImg(file.originalname);
      const path = `${nickUrl}/photo/${'universe.'+getExtensionImg}`;
      return put(path, file.buffer, { access: 'public' }).then((blob) => ({
        url: blob.url,
        orden: highestOrder + index + 1,
        highlighted: false,
        state: PhotoState.ENABLE
      }));
    });

    const blobs = await Promise.all(uploadPromises);
    await this.updateAndSaveCache(nickUrl, blobs);
    return {
      statusCode: ResponseStatus.SUCCESS,
      message: ResponseMessage.PHOTOS_UPLOADED,
      data: blobs,
    };
  }

  getFomartImg(imageName: string) {
    const parts = imageName.split('.');
    const extension = parts[parts.length - 1];
    return extension;
  }

  async updatePhotoHighlighted(
    uuid: string,
    nick: string,
    plan: string,
    data: UpdatePhotoHighlightedDto,
  ) {
    const keyRedis = `${uuid}_${nick}`;
    const getRedis: any = await this.cacheManager.get(keyRedis);

    if (getRedis && getRedis.photos) {
      getRedis.photos = getRedis.photos.map((photo) => {
        if (photo.url === data.url) {
          return { ...photo, highlighted: data.highlighted };
        }
        return photo;
      });

      await this.cacheManager.set(keyRedis, getRedis);
      return {
        statusCode: ResponseStatus.SUCCESS,
        message: ResponseMessage.PHOTO_UPDATED,
        data: getRedis,
      };
    } else {
      throw new HttpException(
        {
          status: ResponseStatus.NOT_FOUND,
          error: 'Key not found or no photos in data',
        },
        ResponseStatus.NOT_FOUND,
      );
    }
  }

  async deletePhoto(photoUrl: string, uuid: string, nick: string) {
    const keyUser = `${uuid}_${nick}`;
    const pathPhotoDelete = await this.deletePhotoBlob(
      keyUser,
      'photo',
      photoUrl,
    );
    const currentData = await this.cacheManager.get<{
      avatar: string;
      cover: string;
      videos: any[];
      histories: any[];
      photos: { url: string; orden: number }[];
    }>(keyUser);

    if (currentData) {
      currentData.photos = currentData.photos.filter(
        (photo) => photo.url !== pathPhotoDelete,
      );
      currentData.photos = currentData.photos.map((photo, index) => ({
        ...photo,
        orden: index + 1,
      }));
      await this.cacheManager.set(keyUser, currentData);
      return {
        statusCode: ResponseStatus.SUCCESS,
        message: ResponseMessage.PHOTO_DELETED,
      };
    } else {
      throw new HttpException(
        {
          status: ResponseStatus.NOT_FOUND,
          error: 'Key not found or no photos in data',
        },
        ResponseStatus.NOT_FOUND,
      );
    }
  }

  async updateAndSaveCache(key: string, dataRedis: any) {
    let currentData = await this.getDataRedis(key);
    if (!currentData) {
      currentData = {
        avatar: '',
        cover: '',
        videos: [],
        histories: [],
        photos: [],
      };
    }

    currentData.photos = [...currentData.photos, ...dataRedis];
    await this.cacheManager.set(key, currentData);
  }

  async getDataRedis(key: string) {
    return await this.cacheManager.get<{
      avatar: string;
      cover: string;
      videos: any[];
      histories: any[];
      photos: { url: string; orden: number, state:string }[];
    }>(key);
  }

  async deletePhotoBlob(keyUser: string, folder: string, photoUrl: string) {
    const pathPhoto = `https://ffildowfyh8ojn5z.public.blob.vercel-storage.com/${keyUser}/${folder}/${photoUrl}`;
    await del(pathPhoto);
    return pathPhoto;
  }
}
