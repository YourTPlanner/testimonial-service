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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadedImages = getUploadedImages;
const UploadToClodinary_1 = require("../../../../helpers/UploadToClodinary");
function getUploadedImages(photos, cloudinaryFolderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let imageUrls = [];
        let imageeErrors = [];
        for (const photo of photos) {
            const result = yield (0, UploadToClodinary_1.uploadImagesToClodinary)(photo, cloudinaryFolderPath);
            if (result.success && result.data)
                imageUrls.push(result.data);
            if (result.error || !result.success)
                imageeErrors.push(result.error);
        }
        return { imageUrls, imageeErrors };
    });
}
