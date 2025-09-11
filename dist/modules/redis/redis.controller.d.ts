import { RedisService } from './redis.service';
import { UpdateProfileDto } from '../../common/dto/redis-updateOrder.dto';
import { JwtService } from '../../modules/jwt/jwt.service';
export declare class RedisController {
    private readonly redisService;
    private readonly jwtService;
    constructor(redisService: RedisService, jwtService: JwtService);
    getValue(req: Request): Promise<import("../../interfaces/response.interface").ServiceResponse<any>>;
    updateOrders(data: UpdateProfileDto, req: Request): Promise<import("../../interfaces/response.interface").ServiceResponse<void>>;
    getAllKeys(): Promise<import("../../interfaces/response.interface").ServiceResponse<any>>;
}
