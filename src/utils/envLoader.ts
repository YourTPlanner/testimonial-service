import { configDotenv } from "dotenv";
configDotenv();

export const envLoader = {
    port : parseInt(process.env.PORT || "3000") || 3000,
    SUPABASE_URL : process.env.SUPABASE_URL as string,
    SUPABASE_ANON : process.env.SUPABASE_ANON as string,
    SUPABASE_SERVICE_ROLE : process.env.SUPABASE_SERVICE_ROLE as string,
    QSTASH_API_TOKEN : process.env.QSTASH_API_TOKEN as string,
    CLOUDINARY_API_KEY : process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET : process.env.CLOUDINARY_API_SECRET as string,
    CLOUDINARY_CLOUD_NAME : process.env.CLOUDINARY_CLOUD_NAME as string,
    PACKAGE_SERVICE_URL : process.env.PACKAGE_SERVICE_URL as string,
    TRIP_SERVICE_URL : process.env.TRIP_SERVICE_URL as string,
}