export declare class MailService {
    private resend;
    constructor();
    sendResetPasswordEmail(email: string, token: string): Promise<void>;
}
