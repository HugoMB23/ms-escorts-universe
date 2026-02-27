"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMediaLimit = resolveMediaLimit;
const common_1 = require("@nestjs/common");
const response_enums_1 = require("../enum/response.enums");
function resolveMediaLimit(plansUniverse, planName, mediaType = 'photos') {
    if (!plansUniverse || typeof plansUniverse !== 'object') {
        throw new common_1.HttpException({
            status: response_enums_1.ResponseStatus.BAD_REQUEST,
            error: 'Invalid plans config format. Expected object with plan names as keys.'
        }, response_enums_1.ResponseStatus.BAD_REQUEST);
    }
    const resolvedPlanName = planName || 'Nebulosa';
    const planLimits = plansUniverse[resolvedPlanName];
    if (!planLimits) {
        throw new common_1.HttpException({
            status: response_enums_1.ResponseStatus.NOT_FOUND,
            error: `Plan "${resolvedPlanName}" not found. Available plans: ${Object.keys(plansUniverse).join(', ')}`
        }, response_enums_1.ResponseStatus.NOT_FOUND);
    }
    const limit = planLimits[mediaType];
    if (typeof limit !== 'number' || limit < 0) {
        throw new common_1.HttpException({
            status: response_enums_1.ResponseStatus.BAD_REQUEST,
            error: `Missing or invalid mediaLimit.${mediaType} for plan "${resolvedPlanName}"`,
        }, response_enums_1.ResponseStatus.BAD_REQUEST);
    }
    return { maxAllowed: limit, resolvedPlanId: resolvedPlanName };
}
//# sourceMappingURL=plan-limits.util.js.map