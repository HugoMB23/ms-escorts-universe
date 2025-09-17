"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMediaLimit = resolveMediaLimit;
const common_1 = require("@nestjs/common");
const response_enums_1 = require("../enum/response.enums");
function resolveMediaLimit(plansUniverse, planOrId, mediaType = 'photos', categoryValue) {
    if (!Array.isArray(plansUniverse)) {
        throw new common_1.HttpException({ status: response_enums_1.ResponseStatus.BAD_REQUEST, error: 'Invalid plans config format' }, response_enums_1.ResponseStatus.BAD_REQUEST);
    }
    const categories = categoryValue
        ? plansUniverse.filter((c) => c?.value === categoryValue)
        : plansUniverse;
    for (const cat of categories) {
        const byId = cat?.plans?.find((p) => p?.id === planOrId);
        const byTitle = cat?.plans?.find((p) => (p?.title || '').toLowerCase() === (planOrId || '').toLowerCase());
        const found = byId || byTitle;
        if (found) {
            const limit = found?.mediaLimit?.[mediaType];
            if (typeof limit !== 'number') {
                throw new common_1.HttpException({
                    status: response_enums_1.ResponseStatus.BAD_REQUEST,
                    error: `Missing mediaLimit.${mediaType} for plan ${found?.id || found?.title}`,
                }, response_enums_1.ResponseStatus.BAD_REQUEST);
            }
            return { maxAllowed: limit, resolvedPlanId: found?.id || found?.title };
        }
    }
    throw new common_1.HttpException({ status: response_enums_1.ResponseStatus.NOT_FOUND, error: `Plan ${planOrId} not found` }, response_enums_1.ResponseStatus.NOT_FOUND);
}
//# sourceMappingURL=plan-limits.util.js.map