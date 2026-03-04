import { UserEntity } from './user.entity';
import { PaymentStatus } from '../../enum/paymentStatus.enum';
export declare class PaymentEntity {
    id: string;
    userUuid: string;
    user: UserEntity;
    provider: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    externalId: string;
    externalReference: string;
    metadata: Record<string, any>;
    errorMessage: string;
    createdAt: Date;
    updatedAt: Date;
}
