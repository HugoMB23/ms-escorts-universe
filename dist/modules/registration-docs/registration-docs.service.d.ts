import { ResponseStatus } from '../../enum/response.enums';
export declare class RegistrationDocsService {
    uploadDocuments(files: {
        [fieldname: string]: Express.Multer.File[];
    } | null | undefined, uuid: string, nick: string): Promise<{
        statusCode: ResponseStatus;
        message: string;
        data: any[];
    }>;
}
