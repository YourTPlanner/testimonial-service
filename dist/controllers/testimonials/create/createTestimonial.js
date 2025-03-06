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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestimonial = void 0;
const supabase_1 = require("../../../lib/supabase");
const apiResponse_1 = require("../../../utils/apiResponse");
const testimonialSchema_1 = require("../../../schema/testimonialSchema");
const uuid_1 = require("uuid");
const getUploadedImages_1 = require("./helpers/getUploadedImages");
const getUploadedVideos_1 = require("./helpers/getUploadedVideos");
const deleteFiles_1 = require("./helpers/deleteFiles");
const ReturnError = (res, message, error) => {
    if (error) {
        return (0, apiResponse_1.apiErrorResponse)({
            res,
            success: false,
            message: message,
            reason: error,
        });
    }
};
const createTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formData = JSON.parse(req.body.testimonial_data);
        const rawFormData = testimonialSchema_1.testimonialCreateSchema.safeParse(formData);
        const parsedFormData = rawFormData.data;
        const files = req.files;
        let photos = files["photos"] || [];
        let videos = files["videos"] || [];
        if (!rawFormData.success) {
            yield (0, deleteFiles_1.deleteFiles)(photos);
            yield (0, deleteFiles_1.deleteFiles)(videos);
            return (0, apiResponse_1.apiErrorResponse)({
                message: "Invalid Testimonial Form Data",
                success: false,
                res,
                reason: rawFormData.error,
            });
        }
        const existingTestimonial = yield supabase_1.supabase
            .from("testimonials")
            .select("traveler_id, package_id, trip_id")
            .eq("traveler_id", parsedFormData.traveler_id)
            .eq("package_id", parsedFormData.package_id)
            .eq("trip_id", parsedFormData.trip_id).single();
        if (existingTestimonial.data && existingTestimonial.status === 200) {
            yield (0, deleteFiles_1.deleteFiles)(photos);
            yield (0, deleteFiles_1.deleteFiles)(videos);
            return (0, apiResponse_1.apiErrorResponse)({
                res,
                success: false,
                message: "Testimonial already exists",
                reason: { english: "Testimonial already exists", error: existingTestimonial.statusText },
                statusCode: 409
            });
        }
        const testimonialId = (0, uuid_1.v4)();
        const cloudinaryFolderPath = `testimonials/${parsedFormData === null || parsedFormData === void 0 ? void 0 : parsedFormData.traveler_id}/${testimonialId}`;
        const [images_data, videos_data] = yield Promise.all([
            (yield (0, getUploadedImages_1.getUploadedImages)(photos, cloudinaryFolderPath)),
            (yield (0, getUploadedVideos_1.getUploadedVideos)(videos, cloudinaryFolderPath))
        ]);
        const vidoesErrors = videos_data.vidoeErrors;
        const imagesErrors = images_data.imageeErrors;
        if (imagesErrors.length > 0 || vidoesErrors.length > 0) {
            return (0, apiResponse_1.apiErrorResponse)({
                res,
                success: false,
                message: "Error uploading media to Cloudinary",
                reason: { imagesErrors: imagesErrors.concat(vidoesErrors), vidoesErrors: imagesErrors.concat(vidoesErrors) }
            });
        }
        const images_url = images_data.imageUrls;
        const videos_url = videos_data.videoUrls;
        const testimonialMediaData = {
            photos: images_url.map((image) => ({
                url: image.url,
                public_id: image.public_id,
                type: "image",
            })),
            videos: videos_url.map((video) => ({
                url: video.url,
                public_id: video.public_id,
                type: "video",
            }))
        };
        const { activites, media_type, travel_tags } = parsedFormData, testimonialCoreData = __rest(parsedFormData, ["activites", "media_type", "travel_tags"]);
        const testimonialCoreResult = yield supabase_1.supabase.from("testimonials").insert(Object.assign(Object.assign({}, testimonialCoreData), { testimonial_id: testimonialId }));
        ReturnError(res, "Error inserting testimonial core data into Supabase", testimonialCoreResult.error);
        const testimonialMediaUploadResult = yield supabase_1.supabase.from("testimonial_media").insert(Object.assign(Object.assign({}, testimonialMediaData), { testimonial_id: testimonialId }));
        ReturnError(res, "Error inserting testimonial media data into Supabase", testimonialMediaUploadResult.error);
        const testimonialActivityResult = yield supabase_1.supabase.from("testimonial_activities").insert({ activities: activites, testimonial_id: testimonialId });
        ReturnError(res, "Error inserting testimonial activity data into Supabase", testimonialActivityResult.error);
        const testimonialTagsResult = yield supabase_1.supabase.from("testimonial_tags").insert({ travel_tags: travel_tags, testimonial_id: testimonialId });
        ReturnError(res, "Error inserting testimonial tag data into Supabase", testimonialTagsResult.error);
        (0, apiResponse_1.apiResponse)({
            res,
            success: true,
            message: "Testimonial created successfully",
            data: testimonialId,
        });
    }
    catch (error) {
        (0, apiResponse_1.apiErrorResponse)({
            res,
            success: false,
            message: "Internal server error",
            reason: error.message,
            statusCode: 500
        });
    }
});
exports.createTestimonial = createTestimonial;
