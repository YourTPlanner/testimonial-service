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
exports.updateTestimonial = void 0;
const supabase_1 = require("../../../lib/supabase");
const apiResponse_1 = require("../../../utils/apiResponse");
const testimonialSchema_1 = require("../../../schema/testimonialSchema");
const getUploadedImages_1 = require("./helpers/getUploadedImages");
const getUploadedVideos_1 = require("./helpers/getUploadedVideos");
const deleteFiles_1 = require("./helpers/deleteFiles");
const cloudinary_1 = require("../../../utils/cloudinary");
const ReturnError = (res, message, error) => {
    if (error) {
        console.log(error);
        return (0, apiResponse_1.apiErrorResponse)({
            res,
            success: false,
            message: message,
            reason: error,
        });
    }
};
const updateTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formData = JSON.parse(req.body.testimonial_data);
        const rawFormData = testimonialSchema_1.testimonialUpdateSchema.safeParse(formData);
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
            .select(`testimonial_id, traveler_id, package_id, testimonial_media(photos, videos)`)
            .eq("testimonial_id", parsedFormData.testimonial_id)
            .single();
        if (!existingTestimonial.data || existingTestimonial.status !== 200) {
            yield (0, deleteFiles_1.deleteFiles)(photos);
            yield (0, deleteFiles_1.deleteFiles)(videos);
            console.log(existingTestimonial.error);
            return (0, apiResponse_1.apiErrorResponse)({
                res,
                success: false,
                message: "Testimonial does not exists",
                reason: existingTestimonial.count === 0 ? "Testimonial does not exists" : existingTestimonial.error,
                statusCode: 404
            });
        }
        const { existing_media, media_type, travel_tags, testimonial_id } = parsedFormData, coreTestimonialUpdateData = __rest(parsedFormData, ["existing_media", "media_type", "travel_tags", "testimonial_id"]);
        const testimonialCoreUpdateResult = yield supabase_1.supabase
            .from("testimonials")
            .update(coreTestimonialUpdateData)
            .eq("testimonial_id", parsedFormData.testimonial_id);
        ReturnError(res, "Error updating testimonial core data into Supabase", testimonialCoreUpdateResult.error);
        const cloudinaryFolderPath = `testimonials/${existingTestimonial.data.traveler_id}/${existingTestimonial.data.testimonial_id}`;
        const existingPhotosIds = parsedFormData.existing_media.photos.map(photo => photo.public_id);
        const existingVideosIds = parsedFormData.existing_media.videos.map(video => video.public_id);
        const existingResources = [...existingPhotosIds, ...existingVideosIds];
        const supabaseImagesIds = existingTestimonial.data.testimonial_media[0].photos.map((photo) => photo);
        const supabaseVideosIds = existingTestimonial.data.testimonial_media[0].videos.map((video) => video);
        const supabaseAssets = [...supabaseImagesIds, ...supabaseVideosIds];
        const folderContent = yield cloudinary_1.cloudinary.api.resources_by_asset_folder(cloudinaryFolderPath).catch((error) => {
            ;
            ReturnError(res, "Error fetching folder content from Cloudinary", error);
        });
        const resourcesToDeleteCloudinary = folderContent.resources.filter((resource) => resource.public_id && !existingResources.includes(resource.public_id));
        const resourcesToDeleteSupabase = supabaseAssets.filter((asset) => asset && !existingResources.includes(asset.public_id));
        const resoursesPublicIds = resourcesToDeleteCloudinary.map((resource) => resource.public_id);
        try {
            const result = yield cloudinary_1.cloudinary.api.delete_resources(resoursesPublicIds);
        }
        catch (error) {
            console.log(error);
        }
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
        const structuredAssets = [parsedFormData.existing_media, testimonialMediaData];
        const mergedAssets = structuredAssets.reduce((acc, curr) => {
            var _a, _b;
            acc.photos.push(...((_a = curr === null || curr === void 0 ? void 0 : curr.photos) !== null && _a !== void 0 ? _a : []));
            acc.videos.push(...((_b = curr === null || curr === void 0 ? void 0 : curr.videos) !== null && _b !== void 0 ? _b : []));
            return acc;
        }, { photos: [], videos: [] });
        const testimonialUpdateResult = yield supabase_1.supabase
            .from("testimonial_media")
            .update({ photos: mergedAssets.photos, videos: mergedAssets.videos })
            .eq("testimonial_id", parsedFormData.testimonial_id);
        ReturnError(res, "Error updating testimonial media data into Supabase", testimonialUpdateResult.error);
        (0, apiResponse_1.apiResponse)({
            res,
            success: true,
            message: "Testimonial created successfully",
            data: {
                resourcesToDeleteCloudinary,
                resourcesToDeleteSupabase,
                mergedAssets
            },
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.apiErrorResponse)({
            res,
            success: false,
            message: "Internal server error",
            reason: error.message,
            statusCode: 500
        });
    }
});
exports.updateTestimonial = updateTestimonial;
