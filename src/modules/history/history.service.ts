import { Cache } from 'cache-manager';
import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { del, put } from '@vercel/blob';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';
import { DateTime } from 'luxon';
import { resolveMediaLimit } from '../../utils/plan-limits.util';

@Injectable()
export class HistoryService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async uploadHistory(file: Express.Multer.File, uuid?: string, nick?: string, plan?: string) {
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
    const { maxAllowed: maxHistoriesAllowed, resolvedPlanId } = resolveMediaLimit(plansUniverse,plan,'history',);


    const currentHistoryCount = currentData.histories.length;

    if (currentHistoryCount >= maxHistoriesAllowed) {
      // Eliminar la primera historia (la más antigua)
      currentData.histories.shift();
    }

    const getExtensionImg = this.getFormatImg(file.originalname);
    const path = `${nickUrl}/history/${'universe.' + getExtensionImg}`;
    const blob = await put(path, file.buffer, { access: 'public' });
    return await this.updateHistory(nickUrl, blob, currentData);
  }

  async updateHistory(key: string, dataRedis: any, currentData: any) {
    const jsonHistory: any = {
      url: dataRedis.url,
      dateExpired: DateTime.now().setZone('America/Santiago').plus({ hours: 24 }).toISO()
    };

    currentData.histories = [...currentData.histories, jsonHistory];
    await this.cacheManager.set(key, currentData);

    return {
      data: jsonHistory,
      statusCode: ResponseStatus.SUCCESS,
      message: ResponseMessage.HISTORY_UPDATED,
    };
  }

  async getDataRedis(key: string) {
    return await this.cacheManager.get<{
      avatar: string;
      cover: string;
      videos: any[];
      histories: any[];
      photos: { url: string; orden: number }[];
    }>(key);
  }

  getFormatImg(imageName: string) {
    const parts = imageName.split('.');
    const extension = parts[parts.length - 1];
    return extension;
  }

  async deleteHistory(historyUrl: string, uuid: string, nick: string) {
    const keyUser = `${uuid}_${nick}`;
    const pathHistoryDelete = await this.deleteHistoryBlob(keyUser, 'history', historyUrl);
    const currentData = await this.cacheManager.get<{
      avatar: string;
      cover: string;
      videos: any[];
      histories: { url: string }[];
      photos: any[];
    }>(keyUser);

    if (currentData) {
      currentData.histories = currentData.histories.filter(
        (history) => history.url !== pathHistoryDelete,
      );
      await this.cacheManager.set(keyUser, currentData);
      return {
        data : {},
        statusCode: HttpStatus.OK,
        message: 'Historia eliminada exitosamente',
      };
    } else {
      throw new HttpException('Historia no encontrada', HttpStatus.NOT_FOUND);
    }
  }

  async deleteHistoryBlob(keyUser: string, folder: string, historyUrl: string) {
    const pathHistory = `https://ffildowfyh8ojn5z.public.blob.vercel-storage.com/${keyUser}/${folder}/${historyUrl}`;
    await del(pathHistory);
    return pathHistory;
  }
}
