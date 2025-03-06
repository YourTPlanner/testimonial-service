import { uploadVideoToCloudinary } from "../../../../helpers/UploadToClodinary";

export async function getUploadedVideos(videos: Express.Multer.File[], cloudinaryFolderPath : string) {
    
    let videoUrls : { public_id: string; url: string }[] = [];
    let vidoeErrors = [];

    for (const photo of videos) {
        const result = await uploadVideoToCloudinary(photo, cloudinaryFolderPath);
        
        if(result.success && result.data) videoUrls.push(result.data);
        if (result.error || !result.success) vidoeErrors.push(result.error);
    }

    return { videoUrls, vidoeErrors };
}