"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyMiddleware = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../utils/constants");
let ApiKeyMiddleware = class ApiKeyMiddleware {
    constructor() {
        this.apiKey = constants_1.jwtConstants.secretAdmin;
    }
    use(req, res, next) {
        const apiKey = req.headers['x-api-key'];
        if (apiKey && apiKey === this.apiKey) {
            next();
        }
        else {
            throw new common_1.UnauthorizedException('Invalid API Key');
        }
    }
};
exports.ApiKeyMiddleware = ApiKeyMiddleware;
exports.ApiKeyMiddleware = ApiKeyMiddleware = __decorate([
    (0, common_1.Injectable)()
], ApiKeyMiddleware);
//# sourceMappingURL=api-key.middleware.js.map