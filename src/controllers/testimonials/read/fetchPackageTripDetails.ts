import { Request, Response } from "express";
import { apiErrorResponse, apiResponse } from "../../../utils/apiResponse";
import axios from "axios";
import { envLoader } from "../../../utils/envLoader";

export const fetchPackageTripDetails = async (req: Request, res: Response) => {
    try {
        const { packageId, tripId } = req.query;

        if (!packageId) return apiResponse({res, success: false, message: "Package ID is required"});
        if (!tripId) return apiResponse({res, success: false, message: "Trip ID is required"});

        let packageData = null;

        try {
            const response = await axios.get(`${envLoader.PACKAGE_SERVICE_URL}/${packageId}`);

            if (response.status !== 200) {
                return apiErrorResponse({res, success: false, message: "Error in fetching package details", reason :response.statusText});
            }

            const {
                package_id,
                total_duration,
                destinations : { cities },
                travel_tags,
                vendor_id
            } = response.data.data.general;

            const accomodations = response.data.data.accommodations[0].type_of_stay;
            const transporation = response?.data?.data.transfers[0].intra_city_transfers[0].transportation_type;
            const acitivites : string[] = response?.data?.data.activities.map((acc : any) => acc.activity_type) || [];

            packageData = {
                package_id,
                total_duration,
                city_traveled : cities,
                travel_tags,
                accomodations,
                transporation,
                vendor_id,
                acitivites : acitivites.filter((item, index) => acitivites.indexOf(item) === index)
            }
        }
        catch (error) {
            return apiErrorResponse({res, success: false, message: "Error in fetching package details", reason : error});    
        }

        try {
            const response = await axios.get(`${envLoader.TRIP_SERVICE_URL}/${tripId}`);

            if (response.status !== 200) {
                return apiErrorResponse({res, success: false, message: "Error in fetching trip details", reason : ""});
            }
            
            const {
                number_of_person,
            } = response.data.data;

            let travel_type : string = "";

            switch (parseInt(number_of_person)) {
                case 1:
                    travel_type = "Solo";
                    break;
                case 2:
                    travel_type = "Couple";
                    break;
                case 3:
                    travel_type = "Family";
                    break;
                case 4:
                    travel_type = "Group";
                    break;
            }

            packageData = {
                ...packageData,
                number_of_person,
                travel_type : travel_type
            }
        }
        catch (error) {
            console.log(envLoader.TRIP_SERVICE_URL)
            return apiErrorResponse({res, success: false, message: "Error in fetching trip details", reason : error});    
        }
       
        apiResponse({
            res,
            success: true,
            message: "Testimonial fetched successfully",
            data: packageData,
        })
    }
    catch (error) {
        console.log(error);
        apiErrorResponse({
            res,
            success: false,
            message: "Error in getTestimonialById",
            reason: error,
            statusCode : 500
        })
    }
}
