# Integration Example: Using Payments with Bookings

This shows how to integrate the Payments module with a Bookings module.

## 1. Create Bookings Module Structure

```
src/modules/bookings/
├── bookings.module.ts
├── bookings.controller.ts
├── bookings.service.ts
├── dto/
│   ├── create-booking.dto.ts
│   └── update-booking.dto.ts
└── entities/
    └── booking.entity.ts
```

## 2. Create Booking Entity

```typescript
// src/modules/bookings/entities/booking.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../../common/entity/user.entity';

@Entity('booking')
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userUuid: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userUuid' })
  user: UserEntity;

  @Column('varchar')
  serviceType: string; // e.g., 'standard', 'premium'

  @Column('date')
  date: string;

  @Column('time')
  startTime: string;

  @Column('time')
  endTime: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('varchar', { default: 'WAITING_PROVIDER' })
  status: string; // WAITING_PROVIDER, PAID, CONFIRMED, COMPLETED, CANCELLED

  @Column('uuid', { nullable: true })
  paymentId: string; // Link to Payment

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## 3. Integrate Payments in Bookings Service

```typescript
// src/modules/bookings/bookings.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from './entities/booking.entity';
import { PaymentsService } from '../payments/payments.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    private readonly paymentsService: PaymentsService,
  ) {}

  /**
   * Create a booking (sets status to WAITING_PROVIDER)
   */
  async createBooking(userId: string, dto: CreateBookingDto) {
    const booking = this.bookingRepository.create({
      userUuid: userId,
      serviceType: dto.serviceType,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      price: dto.price,
      status: 'WAITING_PROVIDER',
    });

    return this.bookingRepository.save(booking);
  }

  /**
   * Initiate payment for a booking
   */
  async initiatePayment(userId: string, bookingId: string) {
    const booking = await this.findById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userUuid !== userId) {
      throw new BadRequestException('Not authorized to pay this booking');
    }

    if (booking.status !== 'WAITING_PROVIDER') {
      throw new BadRequestException(
        `Cannot pay booking in status: ${booking.status}`,
      );
    }

    // Create payment through PaymentsService
    const payment = await this.paymentsService.createCheckout(userId, {
      externalReference: bookingId, // Link payment to booking
      amount: booking.price,
      currency: 'CLP',
      description: `LimpIA - ${booking.serviceType} on ${booking.date}`,
      provider: 'mercadopago',
      metadata: {
        bookingId,
        serviceType: booking.serviceType,
      },
    });

    // Store payment ID in booking
    booking.paymentId = payment.paymentId;
    await this.bookingRepository.save(booking);

    return payment; // Return { paymentId, initPoint, externalId }
  }

  /**
   * Update booking after payment is approved
   */
  async confirmPayment(bookingId: string) {
    const booking = await this.findById(bookingId);

    if (!booking.paymentId) {
      throw new BadRequestException('Booking has no payment');
    }

    // Verify payment status with provider
    const paymentStatus = await this.paymentsService.verifyPaymentStatus(
      booking.paymentId,
    );

    if (paymentStatus.status !== 'APPROVED') {
      throw new BadRequestException(
        `Payment not approved: ${paymentStatus.status}`,
      );
    }

    // Update booking status
    booking.status = 'PAID';
    return this.bookingRepository.save(booking);
  }

  /**
   * Cancel booking and refund payment if possible
   */
  async cancelBooking(bookingId: string) {
    const booking = await this.findById(bookingId);

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    // TODO: Implement refund logic if needed
    // if (booking.paymentId) {
    //   await this.paymentsService.refundPayment(booking.paymentId);
    // }

    booking.status = 'CANCELLED';
    return this.bookingRepository.save(booking);
  }

  async findById(bookingId: string) {
    return this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['user'],
    });
  }

  async findByUser(userId: string) {
    return this.bookingRepository.find({
      where: { userUuid: userId },
      order: { createdAt: 'DESC' },
    });
  }
}
```

## 4. Create Bookings Controller

```typescript
// src/modules/bookings/bookings.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtToken } from '../../common/decorators/jwt-token.decorator';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * Create a new booking
   * POST /bookings
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @JwtToken() userId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(userId, dto);
  }

  /**
   * Get booking details
   * GET /bookings/:bookingId
   */
  @Get(':bookingId')
  async getBooking(@Param('bookingId') bookingId: string) {
    return this.bookingsService.findById(bookingId);
  }

  /**
   * List user's bookings
   * GET /bookings
   */
  @Get()
  async listBookings(@JwtToken() userId: string) {
    return this.bookingsService.findByUser(userId);
  }

  /**
   * Initiate payment for a booking
   * POST /bookings/:bookingId/pay
   */
  @Post(':bookingId/pay')
  async initiatePayment(
    @JwtToken() userId: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.bookingsService.initiatePayment(userId, bookingId);
  }

  /**
   * Confirm payment and update booking status
   * POST /bookings/:bookingId/confirm-payment
   */
  @Post(':bookingId/confirm-payment')
  async confirmPayment(@Param('bookingId') bookingId: string) {
    return this.bookingsService.confirmPayment(bookingId);
  }

  /**
   * Cancel a booking
   * POST /bookings/:bookingId/cancel
   */
  @Post(':bookingId/cancel')
  async cancelBooking(@Param('bookingId') bookingId: string) {
    return this.bookingsService.cancelBooking(bookingId);
  }
}
```

## 5. Wire up Bookings Module

```typescript
// src/modules/bookings/bookings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingEntity } from './entities/booking.entity';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [TypeOrmModule.forFeature([BookingEntity]), PaymentsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
```

## 6. Payment Flow

### User Journey:

```
1. User creates booking
   POST /bookings
   → Status: WAITING_PROVIDER

2. User initiates payment
   POST /bookings/:bookingId/pay
   → Returns { initPoint, paymentId, externalId }
   → Redirects to MercadoPago checkout

3. User completes payment in MercadoPago
   → Payment provider processes transaction

4. Webhook received
   POST /payments/webhook/mercadopago
   → Payment status updated to APPROVED

5. User or system confirms payment
   POST /bookings/:bookingId/confirm-payment
   → Booking status: PAID
```

## 7. Database Flow

```
booking table:
├── id (uuid)
├── userUuid (FK to user)
├── serviceType (standard, premium)
├── price (50000)
├── status (WAITING_PROVIDER → PAID → CONFIRMED → COMPLETED)
└── paymentId (FK to payment.id)

payment table:
├── id (uuid)
├── userUuid (FK to user)
├── provider (mercadopago)
├── amount (50000)
├── currency (CLP)
├── status (PENDING → APPROVED)
├── externalId (mp_preference_id)
├── externalReference (booking_id) ← Links back to booking
└── metadata { bookingId, serviceType }
```

## 8. Update app.module.ts

```typescript
import { BookingsModule } from './modules/bookings/bookings.module';

@Module({
  imports: [
    // ...
    PaymentsModule,
    BookingsModule,
  ],
})
export class AppModule {}
```

## 9. Migration

Don't forget to create the booking table migration:

```sql
CREATE TABLE booking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uuid UUID NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'WAITING_PROVIDER',
  payment_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_booking_user FOREIGN KEY (user_uuid) REFERENCES "user"(uuid),
  CONSTRAINT fk_booking_payment FOREIGN KEY (payment_id) REFERENCES payment(id)
);

CREATE INDEX idx_booking_user_uuid ON booking(user_uuid);
CREATE INDEX idx_booking_status ON booking(status);
```

## Complete Flow Example

```bash
# 1. User logs in and gets JWT token
curl -X POST http://localhost:3000/auth/login ...

# 2. Create a booking
curl -X POST http://localhost:3000/bookings \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{
    "serviceType": "standard",
    "date": "2025-03-15",
    "startTime": "10:00",
    "endTime": "11:00",
    "price": 50000
  }'
# Response: { id: "booking-uuid", status: "WAITING_PROVIDER", price: 50000 }

# 3. Initiate payment
curl -X POST http://localhost:3000/bookings/booking-uuid/pay \
  -H "Authorization: Bearer JWT_TOKEN"
# Response: { paymentId: "...", initPoint: "https://checkout.mercadopago.com/...", externalId: "..." }

# 4. User visits initPoint and completes payment in MercadoPago

# 5. Webhook is received by backend (automatic)
# POST /payments/webhook/mercadopago
# → Payment status updated to APPROVED

# 6. Frontend calls confirm payment (optional, can be automatic)
curl -X POST http://localhost:3000/bookings/booking-uuid/confirm-payment
# Response: { status: "PAID" }

# 7. Service provider accepts/completes booking
# Status flow: PAID → CONFIRMED → COMPLETED
```

This integration ensures:
- ✅ Clean separation of concerns
- ✅ Idempotent payment creation (same booking won't create multiple payments)
- ✅ Single source of truth (provider status is authoritative)
- ✅ Easy to add other payment methods (just change provider in payments.module.ts)
