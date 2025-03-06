"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = require("dotenv");
const multer_1 = __importDefault(require("multer"));
(0, dotenv_1.configDotenv)();
const envLoader_1 = require("./utils/envLoader");
const testimonialRouter_1 = __importDefault(require("./routes/testimonialRouter"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: "*" }));
app.use(body_parser_1.default.json());
app.use("/testimonials", testimonialRouter_1.default);
app.use((err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        return res.status(400).json({
            success: false,
            message: err.code === "LIMIT_UNEXPECTED_FILE" ? "Invalid file type. Only PNG, JPG, JPEG, WEBP, and MP4 are allowed." : err.message,
            error: err.code === "LIMIT_UNEXPECTED_FILE" ? "Invalid file type. Only PNG, JPG, JPEG, WEBP, and MP4 are allowed." : err.message
        });
    }
    else if (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
    next();
});
app.listen(envLoader_1.envLoader.port, () => console.log(`Testimonial Service Running On Port : ${envLoader_1.envLoader.port}`));
