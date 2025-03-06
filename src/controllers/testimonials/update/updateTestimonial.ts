import { Request, Response } from "express";
import { supabase } from "../../../lib/supabase";
import { apiErrorResponse, apiResponse } from "../../../utils/apiResponse";
import { TestimonialUpdateTypes, testimonialUpdateSchema } from "../../../schema/testimonialSchema";
import { getUploadedImages } from "./helpers/getUploadedImages";
import { getUploadedVideos } from "./helpers/getUploadedVideos";
import { deleteFiles } from "./helpers/deleteFiles";
import { cloudinary } from "../../../utils/cloudinary";

const ReturnError = (res : Response, message : string, error : any) => {
    if(error) {
        console.log(error)
        return apiErrorResponse({
            res,
            success: false,
            message: message,
            reason: error,
        })
    }
}

export const updateTestimonial = async (req: Request, res: Response) => {
    try {
        
        const formData = JSON.parse(req.body.testimonial_data);

        const rawFormData = testimonialUpdateSchema.safeParse(formData);
        const parsedFormData : TestimonialUpdateTypes = rawFormData.data as TestimonialUpdateTypes;
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
            .select(`testimonial_id, traveler_id, package_id, testimonial_media(photos, videos)`)
            .eq("testimonial_id", parsedFormData.testimonial_id)
            .single();

        if(!existingTestimonial.data || existingTestimonial.status !== 200) {
            await deleteFiles(photos);
            await deleteFiles(videos);

            console.log(existingTestimonial.error)
            return apiErrorResponse({
                res,
                success: false,
                message: "Testimonial does not exists",
                reason: existingTestimonial.count === 0 ? "Testimonial does not exists" : existingTestimonial.error,
                statusCode: 404
            })
        }
        
        const { existing_media, media_type, travel_tags, testimonial_id, ...coreTestimonialUpdateData } = parsedFormData;

        const testimonialCoreUpdateResult = await supabase
            .from("testimonials")
            .update(coreTestimonialUpdateData)
            .eq("testimonial_id", parsedFormData.testimonial_id);
        
        ReturnError(res, "Error updating testimonial core data into Supabase", testimonialCoreUpdateResult.error);

        const cloudinaryFolderPath = `testimonials/${existingTestimonial.data.traveler_id}/${existingTestimonial.data.testimonial_id}`;

        const existingPhotosIds = parsedFormData.existing_media.photos.map(photo => photo.public_id);
        const existingVideosIds = parsedFormData.existing_media.videos.map(video => video.public_id);
        const existingResources = [...existingPhotosIds, ...existingVideosIds];

        const supabaseImagesIds = existingTestimonial.data.testimonial_media[0].photos.map((photo : any) => photo);
        const supabaseVideosIds = existingTestimonial.data.testimonial_media[0].videos.map((video : any) => video);
        const supabaseAssets = [...supabaseImagesIds, ...supabaseVideosIds];

        const folderContent = await cloudinary.api.resources_by_asset_folder(cloudinaryFolderPath).catch((error) => {;
            ReturnError(res, "Error fetching folder content from Cloudinary", error);
        });

        const resourcesToDeleteCloudinary = folderContent!.resources.filter((resource) => resource.public_id && !existingResources.includes(resource.public_id));
        const resourcesToDeleteSupabase = supabaseAssets.filter((asset) => asset && !existingResources.includes(asset.public_id));
        const resoursesPublicIds = resourcesToDeleteCloudinary.map((resource) => resource.public_id);
        
        try {
            const result = await cloudinary.api.delete_resources(resoursesPublicIds);   
        }
        catch (error) {
            console.log(error);
        }
        
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

        const structuredAssets = [parsedFormData.existing_media, testimonialMediaData]
        const mergedAssets = structuredAssets.reduce(
            (acc, curr) => {
              acc.photos.push(...(curr?.photos ?? []));
              acc.videos.push(...(curr?.videos ?? []));
              return acc;
            },
            { photos: [], videos: [] }
        )

        const testimonialUpdateResult = await supabase
            .from("testimonial_media")
            .update({photos : mergedAssets.photos, videos : mergedAssets.videos})
            .eq("testimonial_id", parsedFormData.testimonial_id);
        
        ReturnError(res, "Error updating testimonial media data into Supabase", testimonialUpdateResult.error);

        apiResponse({
            res,
            success: true,
            message: "Testimonial created successfully",
            data: {
                resourcesToDeleteCloudinary,
                resourcesToDeleteSupabase,
                mergedAssets
            },
        })
    }
    catch (error : any) {
        console.log(error)
        apiErrorResponse({
            res,
            success: false,
            message: "Internal server error",
            reason : error.message,
            statusCode : 500
        })
    }
}
