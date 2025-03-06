"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testimonialUpdateSchema = exports.testimonialCreateSchema = void 0;
const zod_1 = require("zod");
const testimonialCreateSchema = (0, zod_1.object)({
    traveler_id: (0, zod_1.string)().uuid(),
    traveler_profile_picture: (0, zod_1.string)(),
    package_id: (0, zod_1.string)().uuid(),
    booking_id: (0, zod_1.string)().uuid(),
    vendor_id: (0, zod_1.string)().uuid(),
    trip_id: (0, zod_1.string)().uuid(),
    accomodations: (0, zod_1.string)(),
    activites: (0, zod_1.array)((0, zod_1.string)()),
    city_traveled: (0, zod_1.array)((0, zod_1.string)()).min(1, "At least one city is required"),
    country: (0, zod_1.string)(),
    customer_demographics: (0, zod_1.string)(),
    duration: (0, zod_1.number)().min(1, "Duration must be at least 1 day"),
    language: (0, zod_1.string)(),
    transportation: (0, zod_1.string)(),
    travel_tags: (0, zod_1.array)((0, zod_1.string)()).min(1, "At least one tag is required"),
    travel_type: (0, zod_1.string)(),
    traveler_name: (0, zod_1.string)().min(3, "Traveler's name must be at least 3 characters"),
    testimonial: (0, zod_1.string)(),
    media_type: zod_1.z.enum(["images", "videos"]),
    suggestions_for_future_travellers: (0, zod_1.string)(),
    favourite_experience: (0, zod_1.string)(),
    rating: (0, zod_1.number)().min(0).max(5, "Rating must be between 0 and 5"),
});
exports.testimonialCreateSchema = testimonialCreateSchema;
const testimonialUpdateSchema = (0, zod_1.object)({
    testimonial_id: (0, zod_1.string)().uuid(),
    country: (0, zod_1.string)().optional(),
    customer_demographics: (0, zod_1.string)().optional(),
    language: (0, zod_1.string)().optional(),
    transportation: (0, zod_1.string)().optional(),
    travel_tags: (0, zod_1.array)((0, zod_1.string)()).min(1, "At least one tag is required").optional(),
    travel_type: (0, zod_1.string)().optional(),
    traveler_name: (0, zod_1.string)().min(3, "Traveler's name must be at least 3 characters").optional(),
    testimonial: (0, zod_1.string)().optional(),
    media_type: zod_1.z.enum(["images", "videos"]).optional(),
    suggestions_for_future_travellers: (0, zod_1.string)().optional(),
    favourite_experience: (0, zod_1.string)().optional(),
    rating: (0, zod_1.number)().min(0).max(5, "Rating must be between 0 and 5").optional(),
    existing_media: (0, zod_1.object)({
        photos: (0, zod_1.array)((0, zod_1.object)({
            url: (0, zod_1.string)(),
            public_id: (0, zod_1.string)(),
            type: (0, zod_1.string)()
        })).default([]),
        videos: (0, zod_1.array)((0, zod_1.object)({
            url: (0, zod_1.string)(),
            public_id: (0, zod_1.string)(),
            type: (0, zod_1.string)()
        })).default([]),
    })
});
exports.testimonialUpdateSchema = testimonialUpdateSchema;
