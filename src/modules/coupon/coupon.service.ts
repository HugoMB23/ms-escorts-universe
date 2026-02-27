import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponEntity } from '../../common/entity/coupon.entity';
import { PlanEntity } from '../../common/entity/plan.entity';
import { UserPlanEntity } from '../../common/entity/userPlan.entity';
import { CouponStatus } from '../../enum/couponStatus.enum';
import { GenerateCouponDto } from './dto/generate-coupon.dto';
import { RedeemCouponDto } from './dto/redeem-coupon.dto';
import * as crypto from 'crypto';
import { DateTime } from 'luxon';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(CouponEntity)
    private couponRepository: Repository<CouponEntity>,
    @InjectRepository(PlanEntity)
    private planRepository: Repository<PlanEntity>,
    @InjectRepository(UserPlanEntity)
    private userPlanRepository: Repository<UserPlanEntity>,
  ) {}

  async generateCoupons(dto: GenerateCouponDto): Promise<{ codes: string[] }> {
    // Validar que el plan exista
    const plan = await this.planRepository.findOne({
      where: { idPlan: dto.idPlan },
    });

    if (!plan) {
      throw new HttpException(
        `Plan con id ${dto.idPlan} no encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Generar códigos únicos
    const coupons: CouponEntity[] = [];
    const codes: string[] = [];
    const validFrom = new Date(dto.validFrom);
    const validUntil = new Date(dto.validUntil);

    for (let i = 0; i < dto.quantity; i++) {
      let code: string;
      let existingCoupon: CouponEntity;

      // Asegurar que el código sea único con prefijo CUPON_
      do {
        const randomHex = crypto.randomBytes(8).toString('hex').toUpperCase();
        code = `CUPON_${randomHex}`;
        existingCoupon = await this.couponRepository.findOne({
          where: { code },
        });
      } while (existingCoupon);

      coupons.push(
        this.couponRepository.create({
          code,
          idPlan: dto.idPlan,
          durationDays: dto.durationDays,
          validFrom,
          validUntil,
          status: CouponStatus.ACTIVE,
        }),
      );
      codes.push(code);
    }

    // Guardar todos los cupones en batch
    await this.couponRepository.save(coupons);

    return { codes };
  }

  async redeemCoupon(
    dto: RedeemCouponDto,
    userUuid: string,
  ): Promise<{
    success: boolean;
    message: string;
    planName: string;
    planEndDate: string;
  }> {
    // Buscar el cupón por código
    const coupon = await this.couponRepository.findOne({
      where: { code: dto.code },
      relations: ['plan'],
    });

    if (!coupon) {
      throw new HttpException(
        'Cupón no encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    // Validar que el cupón no haya sido usado
    if (coupon.status !== CouponStatus.ACTIVE) {
      throw new HttpException(
        'Este cupón no está disponible (ya usado o expirado)',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validar vigencia con Luxon
    const now = DateTime.now().toJSDate();
    if (coupon.validFrom > now || coupon.validUntil < now) {
      throw new HttpException(
        'El cupón no está en su período válido',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Marcar como usado
    coupon.status = CouponStatus.USED;
    coupon.usedByUserUuid = userUuid;
    coupon.usedAt = now;
    await this.couponRepository.save(coupon);

    // Crear el user_plan
    const today = DateTime.now().startOf('day').toJSDate();
    const endDate = DateTime.now()
      .plus({ days: coupon.durationDays })
      .startOf('day')
      .toJSDate();

    const userPlan = this.userPlanRepository.create({
      userUuid,
      idPlan: coupon.idPlan,
      startDate: today.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });

    await this.userPlanRepository.save(userPlan);

    return {
      success: true,
      message: `Cupón canjeado exitosamente. Plan activado por ${coupon.durationDays} días.`,
      planName: coupon.plan.name,
      planEndDate: endDate.toISOString().split('T')[0],
    };
  }

  async findAll(filters?: {
    status?: CouponStatus;
    idPlan?: number;
  }): Promise<CouponEntity[]> {
    const query = this.couponRepository.createQueryBuilder('coupon')
      .leftJoinAndSelect('coupon.plan', 'plan');

    if (filters?.status) {
      query.where('coupon.status = :status', { status: filters.status });
    }

    if (filters?.idPlan) {
      query.andWhere('coupon.idPlan = :idPlan', { idPlan: filters.idPlan });
    }

    return query.orderBy('coupon.createdAt', 'DESC').getMany();
  }

  async findByCode(code: string): Promise<CouponEntity> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: ['plan'],
    });

    if (!coupon) {
      throw new HttpException(
        'Cupón no encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    return coupon;
  }
}
