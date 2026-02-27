import { HttpException } from '@nestjs/common';
import { ResponseStatus } from '../enum/response.enums';

/**
 * Resuelve el límite de media para un plan y tipo de contenido.
 * 
 * Nueva estructura esperada en plansUniverse:
 * {
 *   "Nebulosa": { photos: 10, videos: 5, history: 20 },
 *   "Supernova": { photos: 25, videos: 10, history: 50 },
 *   "Big Bang": { photos: 50, videos: 20, history: 100 }
 * }
 */
export function resolveMediaLimit(
  plansUniverse: any,
  planName?: string,
  mediaType: 'photos' | 'videos' | 'history' = 'photos',
) {
  if (!plansUniverse || typeof plansUniverse !== 'object') {
    throw new HttpException(
      { 
        status: ResponseStatus.BAD_REQUEST, 
        error: 'Invalid plans config format. Expected object with plan names as keys.' 
      },
      ResponseStatus.BAD_REQUEST,
    );
  }

  // Resolver el nombre del plan (por defecto "Nebulosa" si no viene)
  const resolvedPlanName = planName || 'Nebulosa';
  const planLimits = plansUniverse[resolvedPlanName];

  if (!planLimits) {
    throw new HttpException(
      { 
        status: ResponseStatus.NOT_FOUND, 
        error: `Plan "${resolvedPlanName}" not found. Available plans: ${Object.keys(plansUniverse).join(', ')}` 
      },
      ResponseStatus.NOT_FOUND,
    );
  }

  const limit = planLimits[mediaType];
  
  if (typeof limit !== 'number' || limit < 0) {
    throw new HttpException(
      {
        status: ResponseStatus.BAD_REQUEST,
        error: `Missing or invalid mediaLimit.${mediaType} for plan "${resolvedPlanName}"`,
      },
      ResponseStatus.BAD_REQUEST,
    );
  }

  return { maxAllowed: limit, resolvedPlanId: resolvedPlanName };
}

