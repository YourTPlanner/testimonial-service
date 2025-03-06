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
exports.getTestimonials = void 0;
const supabase_1 = require("../../../lib/supabase");
const apiResponse_1 = require("../../../utils/apiResponse");
const getTestimonials = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const testimonialName = (_b = (_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : "";
        const travelTags = ((_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.travel_tags) ? req.query.travel_tags : null;
        const transportation = (_e = (_d = req === null || req === void 0 ? void 0 : req.query) === null || _d === void 0 ? void 0 : _d.transportation) !== null && _e !== void 0 ? _e : null;
        const accomodations = (_g = (_f = req === null || req === void 0 ? void 0 : req.query) === null || _f === void 0 ? void 0 : _f.accomodations) !== null && _g !== void 0 ? _g : null;
        const rating = (_j = (_h = req === null || req === void 0 ? void 0 : req.query) === null || _h === void 0 ? void 0 : _h.rating) !== null && _j !== void 0 ? _j : null;
        const offset = (page - 1) * limit;
        const { count } = yield supabase_1.supabase.from("testimonials").select("id", { count: "exact" });
        let query = supabase_1.supabase.from("testimonials").select("*, testimonial_media(photos, videos), testimonial_activities(activities), testimonial_tags(travel_tags)");
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
        const testimonialsResult = yield query;
        if (testimonialsResult.error) {
            console.log("Testimonial Fetch Error:", testimonialsResult.error);
            return (0, apiResponse_1.apiErrorResponse)({
                res,
                success: false,
                message: testimonialsResult.statusText,
                reason: testimonialsResult.error,
                statusCode: testimonialsResult.status
            });
        }
        const structuredData = testimonialsResult.data.map((testimonial) => {
            const _a = testimonial, { testimonial_activities, testimonial_tags, testimonial_media } = _a, filteredTestimonial = __rest(_a, ["testimonial_activities", "testimonial_tags", "testimonial_media"]);
            return Object.assign(Object.assign({}, filteredTestimonial), { media: testimonial.testimonial_media[0], activities: testimonial.testimonial_activities[0].activities, travel_tags: testimonial.testimonial_tags[0].travel_tags });
        });
        (0, apiResponse_1.apiResponse)({
            res,
            success: true,
            message: "Testimonials fetched successfully",
            data: {
                testimonials: structuredData,
                pagination: {
                    totalItems: count,
                    currentPage: page,
                    totalPages: Math.ceil(count / limit),
                    itemsPerPage: limit
                }
            }
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.apiResponse)({
            res,
            success: false,
            message: "Error in getTestimonials",
        });
    }
});
exports.getTestimonials = getTestimonials;
