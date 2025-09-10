import { Cache } from 'cache-manager';
import { Inject, Injectable, HttpException } from '@nestjs/common';
import { put, del } from '@vercel/blob';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';

@Injectable()
export class VideoService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async uploadVideo(
    file: Express.Multer.File,
    nick?: string,
    uuid?: string,
    plan?: string,
  ) {
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
    let currentData = await this.getDataRedis(nickUrl);
    const plansUniverseKey = 'plansUniverse';
    const plansUniverse: any = await this.cacheManager.get(plansUniverseKey);

    if (!currentData) {
      currentData = {
        avatar: '',
        cover: '',
        videos: [],
        histories: [],
        photos: [],
      };
    }

    const currentPlan = plansUniverse.plansScort.find(
      (p) => p.namePlan === plan,
    );
    if (!currentPlan) {
      throw new HttpException(
        { status: ResponseStatus.NOT_FOUND, error: 'Plan not found' },
        ResponseStatus.NOT_FOUND,
      );
    }

    const currentVideoCount = currentData.videos.length;
    const maxVideosAllowed = currentPlan.maximoVideo;

    if (currentVideoCount >= maxVideosAllowed) {
      throw new HttpException(
        {
          status: ResponseStatus.BAD_REQUEST,
          error: `Cannot upload video. The plan ${plan} allows a maximum of ${maxVideosAllowed} videos.`,
        },
        ResponseStatus.BAD_REQUEST,
      );
    }

    const getExtensionVid = this.getFormatVid(file.originalname);
    const path = `${nickUrl}/video/${'universe.' + getExtensionVid}`;
    const blob = await put(path, file.buffer, { access: 'public' });

    const newVideo = { url: blob.url };
    currentData.videos.push(newVideo);

    await this.updateAndSaveCache(nickUrl, currentData);
    return {
      statusCode: ResponseStatus.SUCCESS,
      message: ResponseMessage.VIDEO_UPLOADED,
      data: newVideo,
    };
  }

  getFormatVid(videoName: string) {
    const parts = videoName.split('.');
    const extension = parts[parts.length - 1];
    return extension;
  }

  async updateAndSaveCache(key: string, data: any) {
    await this.cacheManager.set(key, data);
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

  async deleteVideo(videoUrl: string, uuid: string, nick: string) {
    const keyUser = `${uuid}_${nick}`;
    const pathVideoDelete = await this.deleteVideoBlob(keyUser, 'video', videoUrl);
    const currentData = await this.cacheManager.get<{
      avatar: string;
      cover: string;
      videos: any[];
      histories: any[];
      photos: { url: string }[];
    }>(keyUser);

    if (currentData) {
      currentData.videos = currentData.videos.filter(
        (video) => video.url !== pathVideoDelete,
      );
      await this.cacheManager.set(keyUser, currentData);
      return {
        statusCode: ResponseStatus.SUCCESS,
        message: ResponseMessage.VIDEO_DELETED,
      };
    } else {
      throw new HttpException(
        {
          status: ResponseStatus.NOT_FOUND,
          error: 'Key not found or no videos in data',
        },
        ResponseStatus.NOT_FOUND,
      );
    }
  }

  async deleteVideoBlob(keyUser: string, folder: string, videoUrl: string) {
    const pathVideo = `https://ffildowfyh8ojn5z.public.blob.vercel-storage.com/${keyUser}/${folder}/${videoUrl}`;
    await del(pathVideo);
    return pathVideo;
  }
}
