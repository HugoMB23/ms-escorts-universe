import { RegistrationDocsService } from './registration-docs.service';
export declare class RegistrationDocsController {
    private readonly docsService;
    constructor(docsService: RegistrationDocsService);
    upload(files: {
        [fieldname: string]: Express.Multer.File[];
    }, body: {
        uuid: string;
        nick: string;
    }): Promise<{
        statusCode: import("../../enum/response.enums").ResponseStatus;
        message: string;
        data: any[];
    }>;
}
