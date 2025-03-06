import { Request, Response } from "express";
import { supabase } from "../../../lib/supabase";
import { apiErrorResponse, apiResponse } from "../../../utils/apiResponse";
import { Testimonial, testimonialCreateSchema } from "../../../schema/testimonialSchema";
import { v4 as uuid } from "uuid";
import { getUploadedImages } from "./helpers/getUploadedImages";
import { getUploadedVideos } from "./helpers/getUploadedVideos";
import { deleteFiles } from "./helpers/deleteFiles";

const ReturnError = (res : Response, message : string, error : any) => {
    if(error) {
        return apiErrorResponse({
            res,
            success: false,
            message: message,
            reason: error,
        })
    }
}

export const createTestimonial = async (req: Request, res: Response) => {
    try {
        
        const formData = JSON.parse(req.body.testimonial_data);

        const rawFormData = testimonialCreateSchema.safeParse(formData);
        const parsedFormData : Testimonial = rawFormData.data as Testimonial;
        const files = req.files as {[fieldname: string]: Express.Multer.File[]};

        let photos: Express.Multer.File[] = files["photos"] || [];
        let videos: Express.Multer.File[] = files["videos"] || [];

        if (!rawFormData.success) {
            await deleteFiles(photos);
            await deleteFiles(videos);

            return apiErrorResponse({
                message: "Invalid Testimonial Form Data",
                success: false,
                res,
                reason: rawFormData.error,
            })
        }

        const existingTestimonial = await supabase
            .from("testimonials")
            .select("traveler_id, package_id, trip_id")
            .eq("traveler_id", parsedFormData.traveler_id)
            .eq("package_id", parsedFormData.package_id)
            .eq("trip_id", parsedFormData.trip_id).single();


        if(existingTestimonial.data && existingTestimonial.status === 200) {
            await deleteFiles(photos);
            await deleteFiles(videos);

            return apiErrorResponse({
                res,
                success: false,
                message: "Testimonial already exists",
                reason: {english : "Testimonial already exists", error : existingTestimonial.statusText},
                statusCode: 409
            })
        }

        const testimonialId = uuid();

        const cloudinaryFolderPath = `testimonials/${parsedFormData?.traveler_id}/${testimonialId}`;

        const [images_data, videos_data] = await Promise.all([
            (await getUploadedImages(photos, cloudinaryFolderPath)),
            (await getUploadedVideos(videos, cloudinaryFolderPath))
        ])

        const vidoesErrors = videos_data.vidoeErrors;
        const imagesErrors = images_data.imageeErrors;

        if (imagesErrors.length > 0 || vidoesErrors.length > 0) {
            return apiErrorResponse({
                res,
                success: false,
                message: "Error uploading media to Cloudinary",
                reason: { imagesErrors : imagesErrors.concat(vidoesErrors), vidoesErrors : imagesErrors.concat(vidoesErrors) }
            })
        }

        const images_url = images_data.imageUrls;
        const videos_url = videos_data.videoUrls;

        const testimonialMediaData = {
            photos: images_url.map((image: { url: string; public_id: string }) => ({
                    url: image.url,
                    public_id: image.public_id,
                    type: "image",
                })
            ),
            videos: videos_url.map((video: { url: string; public_id: string }) => ({
                    url: video.url,
                    public_id: video.public_id,
                    type: "video",
                })
            )
        }

        const { activites, media_type, travel_tags, ...testimonialCoreData } = parsedFormData;

        const testimonialCoreResult = await supabase.from("testimonials").insert({...testimonialCoreData, testimonial_id : testimonialId});
        ReturnError(res, "Error inserting testimonial core data into Supabase", testimonialCoreResult.error);

        const testimonialMediaUploadResult = await supabase.from("testimonial_media").insert({...testimonialMediaData, testimonial_id : testimonialId});
        ReturnError(res, "Error inserting testimonial media data into Supabase", testimonialMediaUploadResult.error);

        const testimonialActivityResult = await supabase.from("testimonial_activities").insert({activities : activites, testimonial_id : testimonialId});
        ReturnError(res, "Error inserting testimonial activity data into Supabase", testimonialActivityResult.error);

        const testimonialTagsResult = await supabase.from("testimonial_tags").insert({travel_tags : travel_tags, testimonial_id : testimonialId});
        ReturnError(res, "Error inserting testimonial tag data into Supabase", testimonialTagsResult.error);

        apiResponse({
            res,
            success: true,
            message: "Testimonial created successfully",
            data: testimonialId,
        })
    }
    catch (error : any) {
        apiErrorResponse({
            res,
            success: false,
            message: "Internal server error",
            reason : error.message,
            statusCode : 500
        })
    }
}
