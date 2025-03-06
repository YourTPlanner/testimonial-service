import { Request, Response } from "express";
import { supabase } from "../../../lib/supabase";
import { apiErrorResponse, apiResponse } from "../../../utils/apiResponse";

export const getTestimonials = async (req: Request, res: Response) => {
    try {
        
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string): 10;
        
        const testimonialName = req?.query?.title as string ?? "";
        const travelTags : any = req?.query?.travel_tags ? req.query.travel_tags : null;
        const transportation = req?.query?.transportation as string ?? null;
        const accomodations = req?.query?.accomodations as string ?? null;
        const rating = req?.query?.rating as string ?? null;
        
        const offset = (page - 1) * limit;

        const { count } = await supabase.from("testimonials").select("id", { count : "exact" });
        let query = supabase.from("testimonials").select("*, testimonial_media(photos, videos), testimonial_activities(activities), testimonial_tags(travel_tags)");

        if (accomodations && accomodations !== "*") {
            query = query.ilike("accomodations", `%${accomodations}%`);
        }

        if (rating && rating !== "*") {
            query = query.eq("rating", parseInt(rating));
        }

        if (travelTags && Array.isArray(travelTags) && travelTags.length > 0) {
            query = query.contains("testimonial_tags.travel_tags", travelTags);
        }

        query = query.range(offset, offset + limit - 1);

        const testimonialsResult = await query;

       
        if (testimonialsResult.error) {
            console.log("Testimonial Fetch Error:", testimonialsResult.error);
            return apiErrorResponse({
                res,
                success: false,
                message: testimonialsResult.statusText,
                reason : testimonialsResult.error,
                statusCode : testimonialsResult.status
            });
        }

        const structuredData = testimonialsResult.data.map((testimonial) => {

            const { testimonial_activities, testimonial_tags, testimonial_media, ...filteredTestimonial } = testimonial as any;

            return {
                ...filteredTestimonial,
                media: testimonial.testimonial_media[0],
                activities: testimonial.testimonial_activities[0].activities,
                travel_tags: testimonial.testimonial_tags[0].travel_tags,
            }
        })

        apiResponse({
            res,
            success: true,
            message: "Testimonials fetched successfully",
            data: {
                testimonials : structuredData,
                pagination: {
                    totalItems : count,
                    currentPage: page,
                    totalPages : Math.ceil(count! / limit),
                    itemsPerPage: limit
                }
            }
        })
    }
    catch (error) {
        console.log(error);
        apiResponse({
            res,
            success: false,
            message: "Error in getTestimonials",
        })
    }
}
