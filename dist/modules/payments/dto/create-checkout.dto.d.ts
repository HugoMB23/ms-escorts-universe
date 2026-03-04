export declare class CreateCheckoutDto {
    externalReference: string;
    amount: number;
    currency: string;
    description?: string;
    provider?: string;
    metadata?: Record<string, any>;
    planName?: string;
    planDays?: number;
}
