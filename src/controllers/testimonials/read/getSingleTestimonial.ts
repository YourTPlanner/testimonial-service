import { Request, Response } from "express";
import { supabase } from "../../../lib/supabase";
import { apiErrorResponse, apiResponse } from "../../../utils/apiResponse";

export const getSingleTestimonial = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return apiResponse({
                res,
                success: false,
                message: "Testimonial ID is required",
            })
        }

        const { data: testimonial, error, status, statusText } = await supabase
            .from("testimonials")
            .select("*,  testimonial_media(photos, videos), testimonial_activities(activities), testimonial_tags(travel_tags)")
            .eq("testimonial_id", id)
            .single();

        if (error) {
            return apiErrorResponse({
                res,
                success: false,
                message: statusText,
                reason : error,
                statusCode : status
            })
        }

        if (!testimonial) {
            return apiErrorResponse({
                res,
                success: false,
                message: statusText,
                reason : error,
                statusCode : 404
            })
        }

        const { testimonial_activities, testimonial_tags, testimonial_media, ...filteredTestimonial } = testimonial as any;

        apiResponse({
            res,
            success: true,
            message: "Testimonial fetched successfully",
            data: {
                ...filteredTestimonial,
                media: testimonial.testimonial_media[0],
                activities: testimonial.testimonial_activities[0].activities,
                travel_tags: testimonial.testimonial_tags[0].travel_tags
            },
        })
    }
    catch (error) {
        console.log(error);
        apiErrorResponse({
            res,
            success: false,
            message: "Internal Server Error",
            reason : error,
            statusCode : 500
        })
    }
}
