"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = require("../utils/multer");
const getTestimonials_1 = require("../controllers/testimonials/read/getTestimonials");
const getSingleTestimonial_1 = require("../controllers/testimonials/read/getSingleTestimonial");
const deleteTestimonials_1 = require("../controllers/testimonials/delete/deleteTestimonials");
const createTestimonial_1 = require("../controllers/testimonials/create/createTestimonial");
const fetchPackageTripDetails_1 = require("../controllers/testimonials/read/fetchPackageTripDetails");
const updateTestimonial_1 = require("../controllers/testimonials/update/updateTestimonial");
//import { updateTestimonialById } from "../controllers/testimonials/update/updateTestimonial";
const createUploder = multer_1.upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "videos", maxCount: 5 },
]);
const updateUploader = multer_1.upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "videos", maxCount: 5 },
]);
const testimonialRouter = express_1.default.Router();
testimonialRouter.get("/", getTestimonials_1.getTestimonials);
testimonialRouter.get("/retrive", fetchPackageTripDetails_1.fetchPackageTripDetails);
testimonialRouter.get("/:id", getSingleTestimonial_1.getSingleTestimonial);
testimonialRouter.delete("/:id", deleteTestimonials_1.deleteTestimonialById);
testimonialRouter.post("/", createUploder, createTestimonial_1.createTestimonial);
testimonialRouter.patch("/:id", updateUploader, updateTestimonial_1.updateTestimonial);
exports.default = testimonialRouter;
