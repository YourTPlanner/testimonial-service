import express from "express";
import { upload } from "../utils/multer";

import { getTestimonials } from "../controllers/testimonials/read/getTestimonials";
import { getSingleTestimonial } from "../controllers/testimonials/read/getSingleTestimonial";
import { deleteTestimonialById } from "../controllers/testimonials/delete/deleteTestimonials";
import { createTestimonial } from "../controllers/testimonials/create/createTestimonial";
import { fetchPackageTripDetails } from "../controllers/testimonials/read/fetchPackageTripDetails";
import { updateTestimonial } from "../controllers/testimonials/update/updateTestimonial";
//import { updateTestimonialById } from "../controllers/testimonials/update/updateTestimonial";

const createUploder = upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "videos", maxCount: 5 },
])
const updateUploader = upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "videos", maxCount: 5 },
])

const testimonialRouter = express.Router();

testimonialRouter.get("/", getTestimonials);
testimonialRouter.get("/retrive", fetchPackageTripDetails);
testimonialRouter.get("/:id", getSingleTestimonial);
testimonialRouter.delete("/:id", deleteTestimonialById);
testimonialRouter.post("/", createUploder, createTestimonial);
testimonialRouter.patch("/:id", updateUploader, updateTestimonial);

export default testimonialRouter;
