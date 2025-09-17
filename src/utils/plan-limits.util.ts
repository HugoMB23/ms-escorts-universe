import { HttpException } from '@nestjs/common';
import { ResponseStatus } from '../enum/response.enums';

export function resolveMediaLimit(
  plansUniverse: any[],
  planOrId?: string,
  mediaType: 'photos' | 'videos' | 'history' = 'photos',
  categoryValue?: string,
) {
  if (!Array.isArray(plansUniverse)) {
    throw new HttpException(
      { status: ResponseStatus.BAD_REQUEST, error: 'Invalid plans config format' },
      ResponseStatus.BAD_REQUEST,
    );
  }

  // Si viene categoryValue, filtra primero
  const categories = categoryValue
    ? plansUniverse.filter((c: any) => c?.value === categoryValue)
    : plansUniverse;

  for (const cat of categories) {
    const byId = cat?.plans?.find((p: any) => p?.id === planOrId);
    const byTitle = cat?.plans?.find(
      (p: any) => (p?.title || '').toLowerCase() === (planOrId || '').toLowerCase(),
    );
    const found = byId || byTitle;

    if (found) {
      const limit = found?.mediaLimit?.[mediaType];
      if (typeof limit !== 'number') {
        throw new HttpException(
          {
            status: ResponseStatus.BAD_REQUEST,
            error: `Missing mediaLimit.${mediaType} for plan ${found?.id || found?.title}`,
          },
          ResponseStatus.BAD_REQUEST,
        );
      }
      return { maxAllowed: limit, resolvedPlanId: found?.id || found?.title };
    }
  }

  throw new HttpException(
    { status: ResponseStatus.NOT_FOUND, error: `Plan ${planOrId} not found` },
    ResponseStatus.NOT_FOUND,
  );
}
