"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envLoader = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
exports.envLoader = {
    port: parseInt(process.env.PORT || "3000") || 3000,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON: process.env.SUPABASE_ANON,
    SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE,
    QSTASH_API_TOKEN: process.env.QSTASH_API_TOKEN,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    PACKAGE_SERVICE_URL: process.env.PACKAGE_SERVICE_URL,
    TRIP_SERVICE_URL: process.env.TRIP_SERVICE_URL,
};
