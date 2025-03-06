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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPackageTripDetails = void 0;
const apiResponse_1 = require("../../../utils/apiResponse");
const axios_1 = __importDefault(require("axios"));
const envLoader_1 = require("../../../utils/envLoader");
const fetchPackageTripDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { packageId, tripId } = req.query;
        if (!packageId)
            return (0, apiResponse_1.apiResponse)({ res, success: false, message: "Package ID is required" });
        if (!tripId)
            return (0, apiResponse_1.apiResponse)({ res, success: false, message: "Trip ID is required" });
        let packageData = null;
        try {
            const response = yield axios_1.default.get(`${envLoader_1.envLoader.PACKAGE_SERVICE_URL}/${packageId}`);
            if (response.status !== 200) {
                return (0, apiResponse_1.apiErrorResponse)({ res, success: false, message: "Error in fetching package details", reason: response.statusText });
            }
            const { package_id, total_duration, destinations: { cities }, travel_tags, vendor_id } = response.data.data.general;
            const accomodations = response.data.data.accommodations[0].type_of_stay;
            const transporation = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.data.transfers[0].intra_city_transfers[0].transportation_type;
            const acitivites = ((_b = response === null || response === void 0 ? void 0 : response.data) === null || _b === void 0 ? void 0 : _b.data.activities.map((acc) => acc.activity_type)) || [];
            packageData = {
                package_id,
                total_duration,
                city_traveled: cities,
                travel_tags,
                accomodations,
                transporation,
                vendor_id,
                acitivites: acitivites.filter((item, index) => acitivites.indexOf(item) === index)
            };
        }
        catch (error) {
            return (0, apiResponse_1.apiErrorResponse)({ res, success: false, message: "Error in fetching package details", reason: error });
        }
        try {
            const response = yield axios_1.default.get(`${envLoader_1.envLoader.TRIP_SERVICE_URL}/${tripId}`);
            if (response.status !== 200) {
                return (0, apiResponse_1.apiErrorResponse)({ res, success: false, message: "Error in fetching trip details", reason: "" });
            }
            const { number_of_person, } = response.data.data;
            let travel_type = "";
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
            packageData = Object.assign(Object.assign({}, packageData), { number_of_person, travel_type: travel_type });
        }
        catch (error) {
            console.log(envLoader_1.envLoader.TRIP_SERVICE_URL);
            return (0, apiResponse_1.apiErrorResponse)({ res, success: false, message: "Error in fetching trip details", reason: error });
        }
        (0, apiResponse_1.apiResponse)({
            res,
            success: true,
            message: "Testimonial fetched successfully",
            data: packageData,
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.apiErrorResponse)({
            res,
            success: false,
            message: "Error in getTestimonialById",
            reason: error,
            statusCode: 500
        });
    }
});
exports.fetchPackageTripDetails = fetchPackageTripDetails;
