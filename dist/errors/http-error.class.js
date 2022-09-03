"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTTPError = void 0;
class HTTTPError extends Error {
    constructor(statusCode, message, context) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.context = context;
    }
}
exports.HTTTPError = HTTTPError;
//# sourceMappingURL=http-error.class.js.map