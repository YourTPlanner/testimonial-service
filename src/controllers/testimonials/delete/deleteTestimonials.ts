import { Request, Response } from "express";
import { supabase } from "../../../lib/supabase";
import { apiResponse } from "../../../utils/apiResponse";
import { v2 as cloudinary } from "cloudinary";

export const deleteTestimonialById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            return apiResponse({
                res,
                success: false,
                message: "Testimonial ID is required",
            });
        }

        // Fetch the testimonial to get media details
        const { data: testimonial, error: fetchError } = await supabase
            .from("testimonials")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !testimonial) {
            return apiResponse({
                res,
                success: false,
                message: "Testimonial not found",
            });
        }

        // Delete media files from Cloudinary
        const { photos, videos } = testimonial.media || {};
        const cloudinaryDeletions: Promise<any>[] = [];

        if (photos?.length) {
            photos.forEach((photo: { public_id: string }) => {
                if (photo.public_id) {
                    cloudinaryDeletions.push(
                        cloudinary.uploader.destroy(photo.public_id)
                    );
                }
            });
        }

        if (videos?.length) {
            videos.forEach((video: { public_id: string }) => {
                if (video.public_id) {
                    cloudinaryDeletions.push(
                        cloudinary.uploader.destroy(video.public_id, {
                            resource_type: "video",
                        })
                    );
                }
            });
        }

        // Wait for all Cloudinary deletions to complete
        await Promise.all(cloudinaryDeletions);

        // Delete the testimonial from Supabase
        const { error: deleteError } = await supabase
            .from("testimonials")
            .delete()
            .eq("id", id);

        if (deleteError) {
            console.log("Testimonial Delete Error:", deleteError);
            return apiResponse({
                res,
                success: false,
                message: "Failed to delete testimonial",
            });
        }

        // Success response
        apiResponse({
            res,
            success: true,
            message: "Testimonial deleted successfully",
        });
    } catch (error) {
        console.log(error);
        apiResponse({
            res,
            success: false,
            message: "Error in deleteTestimonialById",
        });
    }
};
