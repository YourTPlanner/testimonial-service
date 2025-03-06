import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { configDotenv } from "dotenv";
import multer from "multer";
configDotenv();

import { envLoader } from "./utils/envLoader";
import testimonialRouter from "./routes/testimonialRouter";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

app.use("/testimonials", testimonialRouter);

app.use((err : any, req : Request, res : any, next : any) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message : err.code === "LIMIT_UNEXPECTED_FILE" ? "Invalid file type. Only PNG, JPG, JPEG, WEBP, and MP4 are allowed." : err.message,
            error: err.code === "LIMIT_UNEXPECTED_FILE"  ? "Invalid file type. Only PNG, JPG, JPEG, WEBP, and MP4 are allowed." : err.message
        });
    }
    else if (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
    next();
});

app.listen(envLoader.port, () =>
    console.log(`Testimonial Service Running On Port : ${envLoader.port}`)
);
