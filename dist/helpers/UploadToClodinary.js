"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImagesToClodinary = uploadImagesToClodinary;
exports.uploadVideoToCloudinary = uploadVideoToCloudinary;
const promises_1 = __importDefault(require("fs/promises"));
const sharp_1 = __importDefault(require("sharp"));
const stream_1 = require("stream");
const cloudinary_1 = require("../utils/cloudinary");
function uploadImagesToClodinary(file, cloudinaryFolderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Uploading images to Cloudinary...");
            const image = yield promises_1.default.readFile(file.path);
            const compressedBuffer = yield (0, sharp_1.default)(image.buffer)
                .resize({
                width: 800,
                height: 600,
                fit: "inside"
            })
                .jpeg({ quality: 70, progressive: true })
                .toBuffer();
            yield promises_1.default.unlink(file.path);
            const base64 = `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`;
            const result = yield cloudinary_1.cloudinary.uploader.upload(base64, {
                folder: cloudinaryFolderPath,
            });
            console.log("Image uploaded:", result.secure_url);
            return {
                error: null,
                data: {
                    url: result.secure_url,
                    public_id: result.public_id,
                },
                success: true,
            };
        }
        catch (error) {
            console.log("Error uploading images:", error);
            return {
                error: error,
                data: null,
                success: false,
            };
        }
    });
}
function uploadVideoToCloudinary(file, cloudinaryFolderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Uploading video to Cloudinary...");
            const videoBuffer = yield promises_1.default.readFile(file.path);
            const fileStream = stream_1.Readable.from(videoBuffer);
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.cloudinary
                    .uploader
                    .upload_stream({
                    resource_type: "video",
                    folder: cloudinaryFolderPath,
                    transformation: { width: 600, height: 400, crop: "fit", quality: 75 }
                }, (error, result) => __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        console.log("Error during upload:", error);
                        reject({
                            success: false,
                            data: null,
                            error
                        });
                    }
                    else {
                        if (result) {
                            yield promises_1.default.unlink(file.path).catch((err) => console.error("Error deleting file:", err));
                            resolve({
                                success: true,
                                data: { url: result.secure_url, public_id: result.public_id }
                            });
                        }
                        else {
                            yield promises_1.default.unlink(file.path).catch((err) => console.error("Error deleting file:", err));
                            reject({
                                success: false,
                                data: [],
                                error: "Cloudinary upload result is null"
                            });
                        }
                    }
                }));
                fileStream.pipe(uploadStream);
            });
        }
        catch (error) {
            console.log("Error uploading video:", error);
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : error
            };
        }
    });
}
