import fs from "fs/promises";
import sharp from "sharp";
import { Readable } from "stream";
import { cloudinary } from "../utils/cloudinary";

interface IUploadImageToCloudinaryOutput {
    success: boolean;
    data: { url: string; public_id: string } | null;
    error?: any;
}

export async function uploadImagesToClodinary(file: Express.Multer.File, cloudinaryFolderPath: string): Promise<IUploadImageToCloudinaryOutput> {
    try {
        
        console.log("Uploading images to Cloudinary...");
        
        const image = await fs.readFile(file.path);
        
        const compressedBuffer = await sharp(image.buffer)
            .resize({
                width: 800,
                height: 600,
                fit: "inside"
            })
            .jpeg({ quality: 70, progressive: true })
            .toBuffer();

        await fs.unlink(file.path);

        const base64 = `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`;
        const result = await cloudinary.uploader.upload(base64, {
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
        }
    }
    catch (error) {
        console.log("Error uploading images:", error);
        return {
            error: error,
            data: null,
            success: false,
        }
    }
}

interface IGetUploadedImagesOutput {
    success: boolean;
    data: { url: string; public_id: string } | null;
    error?: any;
}

export async function uploadVideoToCloudinary(file: Express.Multer.File, cloudinaryFolderPath: string): Promise<IGetUploadedImagesOutput> {
    try {
        console.log("Uploading video to Cloudinary...")

        const videoBuffer = await fs.readFile(file.path)
        const fileStream = Readable.from(videoBuffer)

        return new Promise<IGetUploadedImagesOutput>((resolve, reject) => {
            const uploadStream = cloudinary
                .uploader
                .upload_stream({
                    resource_type: "video",
                    folder: cloudinaryFolderPath,
                    transformation : { width : 600, height : 400, crop : "fit", quality : 75 }
                }, async (error, result) => {
                
                    if (error) {
                        console.log("Error during upload:", error)
                        reject({
                            success: false,
                            data: null,
                            error
                        })
                    }
                    else {
                        if (result) {
                            await fs.unlink(file.path).catch((err) =>
                                console.error("Error deleting file:", err)
                            );
                            resolve({
                                success: true,
                                data: {url: result.secure_url, public_id: result.public_id}
                            })
                        }
                        else {
                            await fs.unlink(file.path).catch((err) =>
                                console.error("Error deleting file:", err)
                            );
                            reject({
                                success: false,
                                data: [],
                                error: "Cloudinary upload result is null"
                            })
                        }
                    }
                }
            )
                fileStream.pipe(uploadStream)
            }
        )
    }
    catch (error) {
        console.log("Error uploading video:", error)
        return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : error
        }
    }
}
