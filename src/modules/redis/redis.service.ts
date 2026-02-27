import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ServiceResponse } from '../../interfaces/response.interface';
import { ResponseMessage, ResponseStatus } from '../../enum/response.enums';
import { PlansConfigEntity } from '../../common/entity/plans.config.entity';
import { PlanEntity } from '../../common/entity/plan.entity';
import { ServiceCategoryEntity } from '../../common/entity/service-category.entity';
import { ServiceCategoryPlanEntity } from '../../common/entity/service-category-plan.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @InjectRepository(PlansConfigEntity)
    private plansRepository: Repository<PlansConfigEntity>,
    @InjectRepository(PlanEntity)
    private planRepository: Repository<PlanEntity>,
    @InjectRepository(ServiceCategoryEntity)
    private serviceCategoryRepository: Repository<ServiceCategoryEntity>,
    @InjectRepository(ServiceCategoryPlanEntity)
    private serviceCategoryPlanRepository: Repository<ServiceCategoryPlanEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('REDIS') private readonly redis: Redis
) {}

  async getValueRedis(
    uuid: string,
    nick: string,
  ): Promise<ServiceResponse<any>> {
    const keyRedis = `${uuid}_${nick}`;
    const value = await this.cacheManager.get(keyRedis);
    if (value) {
      return {
        statusCode: ResponseStatus.SUCCESS,
        message: ResponseMessage.REDIS_KEY_FOUND,
        data: value,
      };
    } else {
      return {
        data: {
          avatar: '',
          cover: '',
          videos: [],
          histories: [],
          photos: [],
        },
        statusCode: ResponseStatus.NOT_FOUND,
        message: ResponseMessage.REDIS_KEY_NOT_FOUND,
      };
    }
  }
  async getPlans(): Promise<any> {
    const key = process.env.KEY_REDIS_PLANS || 'plansUniverse';
    
    try {
      // Obtener todas las categorías de servicio
      const categories = await this.serviceCategoryRepository.find({
        order: { idCategory: 'ASC' },
      });

      if (!categories || categories.length === 0) {
        console.log('❌ No se encontraron categorías en la base de datos');
        return {
          statusCode: ResponseStatus.NOT_FOUND,
          message: 'No se encontraron categorías en la base de datos',
          data: null,
        };
      }

      // Obtener todas los planes
      const plans = await this.planRepository.find({
        order: { idPlan: 'ASC' },
      });

      if (!plans || plans.length === 0) {
        console.log('❌ No se encontraron planes en la base de datos');
        return {
          statusCode: ResponseStatus.NOT_FOUND,
          message: 'No se encontraron planes en la base de datos',
          data: null,
        };
      }

      // Obtener relaciones M:N con datos completos
      const categoryPlanRelations = await this.serviceCategoryPlanRepository.find({
        relations: ['serviceCategory', 'plan'],
        where: { available: true }, // Solo categorías disponibles
      });

      // Construir array con estructura que espera el frontend
      const result: any[] = [];

      for (const category of categories) {
        // Obtener todos los planes disponibles para esta categoría
        const plansForCategory = categoryPlanRelations
          .filter((cp) => cp.serviceCategory.idCategory === category.idCategory)
          .map((cp) => cp.plan)
          .filter((plan) => plan); // Filtrar nulos

        // Si no hay planes para esta categoría, omitirla
        if (plansForCategory.length === 0) continue;

        const categoryObject: any = {
          label: this.getCategoryLabel(category.name),
          value: category.slug,
          plans: plansForCategory.map((plan) =>
            this.buildPlanObject(category.slug, plan),
          ),
        };

        result.push(categoryObject);
      }

      console.log('✅ Planes construidos dinámicamente desde BD');

      // Cachear en Redis para rendimiento (pero BD es la verdad)
      // await this.cacheManager.set(key, result, 3600000); // 1 hora
      // console.log(`✅ Cache actualizado para key: ${key}`);

      return result;
    } catch (error) {
      console.error('❌ Error al obtener planes:', error);
      return {
        statusCode: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener planes',
        data: null,
      };
    }
  }

  /**
   * Construir objeto de plan con todos sus detalles
   */
  private buildPlanObject(categorySlug: string, plan: PlanEntity): any {
    const planId = `${categorySlug}-${plan.name.toLowerCase()}`;
    const { photos, videos, history } = this.getMediaLimitForPlan(plan.name);

    console.log(`📋 Plan: "${plan.name}" | mediaLimit: ${photos}/${videos}/${history}`);

    const planObject: any = {
      id: planId,
      icon: this.getIconForPlan(plan.name),
      price: this.getDefaultPriceDetails(plan.name),
      title: this.formatPlanTitle(plan.name),
      features: this.getFeaturesForPlan(plan.name, { photos, videos, history }),
      mediaLimit: {
        photos,
        videos,
        history,
      },
    };

    // Agregar customPrice si existe
    if (plan.customPrice) {
      planObject.customPrice = plan.customPrice;
    }

    return planObject;
  }

  /**
   * Formatear título del plan (nebulosa → Nebulosa, big-bang → Big Bang)
   */
  private formatPlanTitle(planName: string): string {
    const titleMap: Record<string, string> = {
      'nebulosa': 'Nebulosa',
      'supernova': 'Supernova',
      'big-bang': 'Big Bang',
    };
    return titleMap[planName.toLowerCase()] || planName;
  }

  /**
   * Obtener label de categoría basado en el nombre
   */
  private getCategoryLabel(categoryName: string): string {
    const labels: Record<string, string> = {
      'Escort': 'Escort Mujer',
      'Trans': 'Escort Trans',
      'Fantasía': 'Fantasías',
      'Masajista Mujer': 'Masajista Mujer',
      'Masajista Hombre': 'Masajista Hombre',
      'Publicidad': 'Publicidad',
    };
    return labels[categoryName] || categoryName;
  }

  /**
   * Obtener icono según el plan
   */
  private getIconForPlan(planName: string): string {
    const icons: Record<string, string> = {
      'nebulosa': 'plans/plan-diablo-bronce.svg',
      'supernova': 'plans/plan-diablo-silver.svg',
      'big-bang': 'plans/plan-diablo-gold.svg',
    };
    return icons[planName.toLowerCase()] || 'plans/plan-default.svg';
  }

  /**
   * Obtener features/características del plan
   */
  private getFeaturesForPlan(
    planName: string,
    mediaLimit: { photos: number; videos: number; history: number },
  ): string[] {
    const baseFeatures: Record<string, string[]> = {
      'nebulosa': [
        'Fotografía de portada de tamaño pequeño',
        'Listado en 3er grupo de portada y categoría',
        `Publicación de hasta {maxPhoto} fotografías en book`,
        `Carga de hasta {maxPhoto} fotos nuevas`,
        `Publicación de {maxVideo} video en book`,
        `Carga de {maxVideo} video en book`,
        `Publicación de {maxHistory} historia al día`,
        'Anuncio en promoción hasta por 7 días',
        'Acceso a plataforma de autoservicio 24hrs',
        'Asistencia telefónica en horario de oficina',
      ],
      'supernova': [
        'Fotografía de portada de tamaño mediano',
        'Listado en 2do grupo de portada y categoría',
        `Publicación de hasta {maxPhoto} fotografías en book`,
        `Carga de hasta {maxPhoto} fotos nuevas`,
        `Publicación de {maxVideo} videos en book`,
        `Carga de {maxVideo} videos en book`,
        `Publicación de {maxHistory} historias al día`,
        'Anuncio en promoción hasta por 15 días',
        'Acceso a plataforma de autoservicio 24hrs',
        'Asistencia telefónica en horario de oficina',
      ],
      'big-bang': [
        'Fotografía de portada de tamaño grande',
        'Listado en 1er grupo de portada y categoría',
        `Publicación de hasta {maxPhoto} fotografías en book`,
        `Carga de hasta {maxPhoto} fotos nuevas`,
        `Publicación de {maxVideo} videos en book`,
        `Carga de {maxVideo} videos en book`,
        `Publicación de {maxHistory} historias al día`,
        'Anuncio en promoción hasta por 30 días',
        'Acceso a plataforma de autoservicio 24hrs',
        'Asistencia telefónica en horario de oficina',
      ],
    };

    const features = baseFeatures[planName.toLowerCase()] || [];

    // Reemplazar placeholders con valores reales
    return features.map((feature) =>
      feature
        .replace('{maxPhoto}', mediaLimit.photos.toString())
        .replace('{maxVideo}', mediaLimit.videos.toString())
        .replace('{maxHistory}', mediaLimit.history.toString()),
    );
  }

  /**
   * Obtener límites de media para un plan específico
   * Retorna un objeto con fotos, videos e historias
   */
  private getMediaLimitForPlan(planName: string): {
    photos: number;
    videos: number;
    history: number;
  } {
    const limits: Record<string, { photos: number; videos: number; history: number }> = {
      'nebulosa': {
        photos: 4,
        videos: 1,
        history: 1,
      },
      'supernova': {
        photos: 3,
        videos: 2,
        history: 2,
      },
      'big-bang': {
        photos: 18,
        videos: 3,
        history: 3,
      },
    };

    return limits[planName.toLowerCase()] ?? { photos: 0, videos: 0, history: 0 };
  }
  async getAllKey(): Promise<ServiceResponse<any>> {
    try {
      const keysToIgnore = [
        'mykey',
        'plansUniverse',
        'user_2030304',
        'nationalities_redis',
        'region_redis',
      ];
  
      const allKeys = await this.redis.keys('*');
  
      const filteredKeys = allKeys.filter(
        (key) =>
          !keysToIgnore.includes(key) &&         // ❌ no está en la lista de claves ignoradas
          !key.startsWith('profile_')            // ❌ no comienza con "profile_"
      );
  
      const results: { key: string; value: any }[] = [];
  
      for (const key of filteredKeys) {
        const jsonData = await this.redis.get(key);
        if (!jsonData) continue;
  
        const data = JSON.parse(jsonData);
        results.push({ key, value: data });
      }
  
      return {
        statusCode: 201,
        message: 'Claves Redis encontradas',
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: 500,
          message: 'Error al obtener claves de Redis',
        },
        500,
      );
    }
  }

  async updateValueRedis(
    uuid: string,
    nick: string,
    data: any,
  ): Promise<ServiceResponse<void>> {
    const keyRedis = `${uuid}_${nick}`;
    await this.cacheManager.set(keyRedis, data);
    return {
      statusCode: ResponseStatus.SUCCESS,
      message: ResponseMessage.REDIS_KEY_UPDATED,
    };
  }
  async deleteKey(key: string) {
  await this.cacheManager.del(key);
  
  }

  async getProfile(key: string): Promise<ServiceResponse<any>> {
    const cachedProfile = await this.cacheManager.get(key);
    if (cachedProfile) {
      return {
        statusCode: ResponseStatus.SUCCESS,
        message: 'Perfil encontrado en rd',
        data: cachedProfile,
      };
    }
  }
  async setProfileInRedis(key: string, profileData: any): Promise<void> {
    try {
      const insertRedis = await this.cacheManager.set(key, profileData);
      console.log('inserRedsLog', key);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: ResponseStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to cache profile data',
        },
        ResponseStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener precios por defecto si no están en BD
   */
  private getDefaultPriceDetails(planName: string): any[] {
    const priceMap: Record<string, any[]> = {
      'nebulosa': [
        { label: '7 días', price: '$20.000', value: '7d' },
        { label: '15 días', price: '$30.000', value: '15d' },
        { label: '30 días', price: '$50.000', value: '30d' },
      ],
      'supernova': [
        { label: '7 días', price: '$50', value: '7d' },
        { label: '15 días', price: '$90', value: '15d' },
        { label: '30 días', price: '$150', value: '30d' },
      ],
      'big-bang': [
        { label: '7 días', price: '$50', value: '7d' },
        { label: '15 días', price: '$90', value: '15d' },
        { label: '30 días', price: '$150', value: '30d' },
      ],
    };

    return priceMap[planName.toLowerCase()] || [];
  }
  
}
