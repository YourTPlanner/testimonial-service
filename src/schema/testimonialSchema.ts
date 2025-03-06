import { z, string, number, array, object } from "zod";

const testimonialCreateSchema = object({
    traveler_id: string().uuid(),
    traveler_profile_picture: string(),
    package_id: string().uuid(),
    booking_id: string().uuid(),
    vendor_id : string().uuid(),
    trip_id : string().uuid(),
    accomodations: string(),
    activites: array(string()),
    city_traveled: array(string()).min(1, "At least one city is required"),
    country: string(),
    customer_demographics: string(),
    duration: number().min(1, "Duration must be at least 1 day"),
    language: string(),
    transportation: string(),
    travel_tags: array(string()).min(1, "At least one tag is required"),
    travel_type: string(),
    traveler_name: string().min(3, "Traveler's name must be at least 3 characters"),
    testimonial: string(),
    media_type: z.enum(["images", "videos"]),
    suggestions_for_future_travellers: string(),
    favourite_experience: string(),
    rating: number().min(0).max(5, "Rating must be between 0 and 5"),
})

const testimonialUpdateSchema = object({
    testimonial_id : string().uuid(),
    country: string().optional(),
    customer_demographics: string().optional(),
    language: string().optional(),
    transportation: string().optional(),
    travel_tags: array(string()).min(1, "At least one tag is required").optional(),
    travel_type: string().optional(),
    traveler_name: string().min(3, "Traveler's name must be at least 3 characters").optional(),
    testimonial: string().optional(),
    media_type: z.enum(["images", "videos"]).optional(),
    suggestions_for_future_travellers: string().optional(),
    favourite_experience: string().optional(),
    rating: number().min(0).max(5, "Rating must be between 0 and 5").optional(),
    existing_media : object({
        photos : array(object({
            url : string(),
            public_id : string(),
            type : string()
        })).default([]),
        videos : array(object({
            url : string(),
            public_id : string(),
            type : string()
        })).default([]),
    })
})

export { testimonialCreateSchema, testimonialUpdateSchema };
export type Testimonial = z.infer<typeof testimonialCreateSchema>;
export type TestimonialUpdateTypes = z.infer<typeof testimonialUpdateSchema>;
