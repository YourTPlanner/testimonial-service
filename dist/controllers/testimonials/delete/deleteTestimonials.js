"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTestimonialById = void 0;
const supabase_1 = require("../../../lib/supabase");
const apiResponse_1 = require("../../../utils/apiResponse");
const cloudinary_1 = require("cloudinary");
const deleteTestimonialById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Validate ID
        if (!id) {
            return (0, apiResponse_1.apiResponse)({
                res,
                success: false,
                message: "Testimonial ID is required",
            });
        }
        // Fetch the testimonial to get media details
        const { data: testimonial, error: fetchError } = yield supabase_1.supabase
            .from("testimonials")
            .select("*")
            .eq("id", id)
            .single();
        if (fetchError || !testimonial) {
            return (0, apiResponse_1.apiResponse)({
                res,
                success: false,
                message: "Testimonial not found",
            });
        }
        // Delete media files from Cloudinary
        const { photos, videos } = testimonial.media || {};
        const cloudinaryDeletions = [];
        if (photos === null || photos === void 0 ? void 0 : photos.length) {
            photos.forEach((photo) => {
                if (photo.public_id) {
                    cloudinaryDeletions.push(cloudinary_1.v2.uploader.destroy(photo.public_id));
                }
            });
        }
        if (videos === null || videos === void 0 ? void 0 : videos.length) {
            videos.forEach((video) => {
                if (video.public_id) {
                    cloudinaryDeletions.push(cloudinary_1.v2.uploader.destroy(video.public_id, {
                        resource_type: "video",
                    }));
                }
            });
        }
        // Wait for all Cloudinary deletions to complete
        yield Promise.all(cloudinaryDeletions);
        // Delete the testimonial from Supabase
        const { error: deleteError } = yield supabase_1.supabase
            .from("testimonials")
            .delete()
            .eq("id", id);
        if (deleteError) {
            console.log("Testimonial Delete Error:", deleteError);
            return (0, apiResponse_1.apiResponse)({
                res,
                success: false,
                message: "Failed to delete testimonial",
            });
        }
        // Success response
        (0, apiResponse_1.apiResponse)({
            res,
            success: true,
            message: "Testimonial deleted successfully",
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.apiResponse)({
            res,
            success: false,
            message: "Error in deleteTestimonialById",
        });
    }
});
exports.deleteTestimonialById = deleteTestimonialById;
