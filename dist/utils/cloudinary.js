"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.cloudinaryConfig = void 0;
const cloudinary_1 = require("cloudinary");
const envLoader_1 = require("./envLoader");
exports.cloudinaryConfig = cloudinary_1.v2.config({
    cloud_name: envLoader_1.envLoader.CLOUDINARY_CLOUD_NAME,
    api_key: envLoader_1.envLoader.CLOUDINARY_API_KEY,
    api_secret: envLoader_1.envLoader.CLOUDINARY_API_SECRET,
});
exports.cloudinary = cloudinary_1.v2;
