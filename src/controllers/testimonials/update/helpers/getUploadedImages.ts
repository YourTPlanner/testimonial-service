import { uploadImagesToClodinary } from "../../../../helpers/UploadToClodinary";

export async function getUploadedImages(photos: Express.Multer.File[], cloudinaryFolderPath : string) {
    
    let imageUrls : { public_id: string; url: string }[] = [];
    let imageeErrors = [];

    for (const photo of photos) {
        const result = await uploadImagesToClodinary(photo, cloudinaryFolderPath);
        
        if(result.success && result.data) imageUrls.push(result.data);
        if (result.error || !result.success) imageeErrors.push(result.error);
    }

    return { imageUrls, imageeErrors };
}