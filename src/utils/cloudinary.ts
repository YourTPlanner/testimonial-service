import { v2 } from "cloudinary";
import { envLoader } from "./envLoader";

export const cloudinaryConfig = v2.config({
    cloud_name: envLoader.CLOUDINARY_CLOUD_NAME,
    api_key: envLoader.CLOUDINARY_API_KEY,
    api_secret: envLoader.CLOUDINARY_API_SECRET,
});
export const cloudinary = v2;