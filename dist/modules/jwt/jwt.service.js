"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const constants_1 = require("../../utils/constants");
const jsonwebtoken_1 = require("jsonwebtoken");
let JwtService = class JwtService {
    constructor() {
        this.JWT_SECRET = constants_1.jwtConstants.secretUser;
    }
    decodeToken(token) {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET);
            return { ...decoded, code: 200, message: 'Token válido' };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.TokenExpiredError) {
                return { sub: '', username: '', plan: '', code: 401, message: 'Token caducado' };
            }
            return { sub: '', username: '', plan: '', code: 400, message: 'Token no válido' };
        }
    }
};
exports.JwtService = JwtService;
exports.JwtService = JwtService = __decorate([
    (0, common_1.Injectable)()
], JwtService);
//# sourceMappingURL=jwt.service.js.map