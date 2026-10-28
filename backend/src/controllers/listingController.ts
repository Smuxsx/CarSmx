import type { Request, Response } from "express";
import * as queries from "../db/queries.ts";
import { getAuth } from "@clerk/express";

        const allowedTransmissions = [
            "automatic",
            "manual",
            "semi-automatic",
            "cvt",
            "other"
        ]
        
        const allowedExteriorColors = [
            "black",
            "white",
            "silver",
            "gray",
            "blue",
            "red",
            "green",
            "brown",
            "beige",
            "gold",
            "orange",
            "yellow",
            "purple",
            "burgundy",
            "tan",
            "bronze",
            "teal",
            "cream",
            "charcoal",
            "other",
        ]

        const allowedFuelTypes = [
            "gasoline",
            "diesel",
            "electric",
            "hybrid",
            "other"
        ]
        const allowedStates = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ]

        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        function isNonNegativeInteger(value: unknown){
            return (
                typeof value === "number" && Number.isInteger(value) && value >= 0
            )
        }
        function isNonEmptyString(value: unknown){
            return(
                typeof value === "string" && value.trim().length > 0
            )
        }

        function isValidUuid(value: unknown): value is string {
         return typeof value === "string" && uuidRegex.test(value);
        }


// Auth

export async function createListing(req: Request, res: Response) {
    try {
        const {userId} = getAuth(req);
        if(!userId) return res.status(401).json({error: "Unauthorized"});

        const vehicle_id  = req.body.vehicle_id

        if (!Number.isInteger(vehicle_id) || vehicle_id <= 0) {
            return res.status(400).json({
                error: "Invalid Vehicle ID"
            })
        }

        const vehicle = await queries.getVehicleById(vehicle_id);
        if (!vehicle) {
            return res.status(404).json({
                error: "Vehicle does not exist"
            })
        }

        const { trim, description, price, mileage, vin, exterior_color, transmission, fuel_type, city, state} = req.body;
        const errors: string[] = []

        if(!isNonNegativeInteger(price)){
            errors.push("Price must be a non-negative integer");
        }

        if(!isNonNegativeInteger(mileage)){
            errors.push("Mileage must be a non-negative integer");
        }

        if(!isNonEmptyString(trim)){
            errors.push("Trim cannot be empty");
        } 
        
        if(!isNonEmptyString(description)){
            errors.push("Description cannot be empty");
        }

        if(!isNonEmptyString(vin)){
            errors.push("Invalid VIN");
        }

        if(!isNonEmptyString(exterior_color) ){
            errors.push("Invalid exterior color")
        } 

        if(!isNonEmptyString(transmission)){
            errors.push("Invalid transmission")
        } 
        
        if(!isNonEmptyString(fuel_type) ){
            errors.push("Invalid fuel type");
        } 

        if(!isNonEmptyString(state)){
            errors.push("Invalid State")
        } 

        if(!isNonEmptyString(city)){
            errors.push("City cannot be empty")
        }

        if(errors.length > 0){
            return res.status(400).json({
                errors
            })
        } 

        const normalizedTrim = trim.trim()
        const normalizedDescription = description.trim()
        const normalizedCity = city.trim()
        const normalizedState = state.trim().toUpperCase();
        const normalizedVin = vin.trim().toUpperCase()
        const normalizedExteriorColor = exterior_color.trim().toLowerCase()
        const normalizedFuelType = fuel_type.trim().toLowerCase()
        const normalizedTransmission = transmission.trim().toLowerCase()

        if (!allowedStates.includes(normalizedState)){
            errors.push("Invalid State")
        }
        if (normalizedVin.length !== 17){
            errors.push("Invalid Vin")
        }
        if (!allowedExteriorColors.includes(normalizedExteriorColor)){
            errors.push("Invalid exterior Color")
        }
        if(!allowedFuelTypes.includes(normalizedFuelType)){
            errors.push("Invalid Fuel Type")
        }
        if (!allowedTransmissions.includes(normalizedTransmission)){
            errors.push("Invalid transmission")
        }
        if(price <= 0 ){
            errors.push("Invalid Price")
        }
        
        if(errors.length > 0){
            return res.status(400).json({
                errors
            })
        } 

        const listing = await queries.createListing({
            user_id: userId,
            trim: normalizedTrim,
            description: normalizedDescription,
            price,
            vehicle_id,
            mileage,
            vin: normalizedVin,
            exterior_color: normalizedExteriorColor,
            transmission: normalizedTransmission,
            fuel_type: normalizedFuelType,
            city: normalizedCity,
            state: normalizedState
        })
        return res.status(201).json(listing)
    } catch (error) {
        console.error("Error creating listing: ", error)
        return res.status(500).json({error: "Error creating listing"})
    }
}

export async function getMyListings(req: Request, res:Response){
    try {
        const { userId } = getAuth(req);

        if (!userId) return res.status(401).json({
            error: "Unauthorized"
        })

        const listings = await queries.getMyListings(userId);

        return res.status(200).json(listings);
    } catch (error) {
        console.error("Error getting user's listings:", error)

        return res.status(500).json({
            error: "Failed to get listings"
        })
    }
}

export async function getMyInactiveListings(req: Request, res:Response){
    try {
        const { userId } = getAuth(req);

        if(!userId) return res.status(401).json({
            error: "Unathorized"
        })

        const listings = await queries.getMyInactiveListings(userId);

        return res.status(200).json(listings)
    } catch (error) {
        console.error("Error getting user's listings:", error)

        return res.status(500).json({
            error: "Failed to get listings"
        })
    }
}

// Auth + Owner

export async function updateListing(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const listingId = req.params.id;

        
        

        if (typeof listingId !== "string" || !uuidRegex.test(listingId)) {
            return res.status(400).json({
                error: "Invalid listing ID"
            });
        }

        // Authorization: make sure this listing belongs to this user
        const ownedListing = await queries.getOwnedlistingById(
            userId,
            listingId
        );

        if (!ownedListing) {
            return res.status(404).json({
                error: "Listing not found"
            });
        }

        const {
            trim,
            description,
            price,
            mileage,
            vin,
            exterior_color,
            transmission,
            fuel_type,
            city,
            state,
            vehicle_id
        } = req.body;

        const errors: string[] = [];

        // We only put fields in here if the client actually sent them
        const updateData: Record<string, unknown> = {};

        // PRICE
        if (price !== undefined) {
            if (!isNonNegativeInteger(price) || price <= 0) {
                errors.push("Price must be a positive integer");
            } else {
                updateData.price = price;
            }
        }

        // MILEAGE
        if (mileage !== undefined) {
            if (!isNonNegativeInteger(mileage)) {
                errors.push("Mileage must be a non-negative integer");
            } else {
                updateData.mileage = mileage;
            }
        }

        // TRIM
        if (trim !== undefined) {
            if (!isNonEmptyString(trim)) {
                errors.push("Trim cannot be empty");
            } else {
                updateData.trim = trim.trim();
            }
        }

        // DESCRIPTION
        if (description !== undefined) {
            if (!isNonEmptyString(description)) {
                errors.push("Description cannot be empty");
            } else {
                updateData.description = description.trim();
            }
        }

        // VIN
        if (vin !== undefined) {
            if (!isNonEmptyString(vin)) {
                errors.push("Invalid VIN");
            } else {
                const normalizedVin = vin.trim().toUpperCase();

                if (normalizedVin.length !== 17) {
                    errors.push("Invalid VIN");
                } else {
                    updateData.vin = normalizedVin;
                }
            }
        }

        // EXTERIOR COLOR
        if (exterior_color !== undefined) {
            if (!isNonEmptyString(exterior_color)) {
                errors.push("Invalid exterior color");
            } else {
                const normalizedExteriorColor =
                    exterior_color.trim().toLowerCase();

                if (
                    !allowedExteriorColors.includes(
                        normalizedExteriorColor
                    )
                ) {
                    errors.push("Invalid exterior color");
                } else {
                    updateData.exterior_color =
                        normalizedExteriorColor;
                }
            }
        }

        // TRANSMISSION
        if (transmission !== undefined) {
            if (!isNonEmptyString(transmission)) {
                errors.push("Invalid transmission");
            } else {
                const normalizedTransmission =
                    transmission.trim().toLowerCase();

                if (
                    !allowedTransmissions.includes(
                        normalizedTransmission
                    )
                ) {
                    errors.push("Invalid transmission");
                } else {
                    updateData.transmission =
                        normalizedTransmission;
                }
            }
        }

        // FUEL TYPE
        if (fuel_type !== undefined) {
            if (!isNonEmptyString(fuel_type)) {
                errors.push("Invalid fuel type");
            } else {
                const normalizedFuelType =
                    fuel_type.trim().toLowerCase();

                if (
                    !allowedFuelTypes.includes(
                        normalizedFuelType
                    )
                ) {
                    errors.push("Invalid fuel type");
                } else {
                    updateData.fuel_type =
                        normalizedFuelType;
                }
            }
        }

        // STATE
        if (state !== undefined) {
            if (!isNonEmptyString(state)) {
                errors.push("Invalid state");
            } else {
                const normalizedState =
                    state.trim().toUpperCase();

                if (!allowedStates.includes(normalizedState)) {
                    errors.push("Invalid state");
                } else {
                    updateData.state = normalizedState;
                }
            }
        }

        // CITY
        if (city !== undefined) {
            if (!isNonEmptyString(city)) {
                errors.push("City cannot be empty");
            } else {
                updateData.city = city.trim();
            }
        }

        // VEHICLE
        if (vehicle_id !== undefined) {
            if (
                !Number.isInteger(vehicle_id) ||
                vehicle_id <= 0
            ) {
                errors.push("Invalid vehicle ID");
            } else {
                const vehicle =
                    await queries.getVehicleById(vehicle_id);

                if (!vehicle) {
                    errors.push("Vehicle does not exist");
                } else {
                    updateData.vehicle_id = vehicle_id;
                }
            }
        }

        // Stop if any supplied field was invalid
        if (errors.length > 0) {
            return res.status(400).json({
                errors
            });
        }

        // Handles {} or requests containing only unsupported fields
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: "No valid fields provided for update"
            });
        }

        const updatedListing = await queries.updateListing(
            listingId,
            updateData
        );

        return res.status(200).json(updatedListing);

    } catch (error) {
        console.error("Error updating listing:", error);

        return res.status(500).json({
            error: "Failed to update listing"
        });
    }
}

export async function setListingActiveStatus(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const listingId = req.params.id;

        if(!isValidUuid(listingId)){
            return res.status(400).json({
                error: "Invalid listing Id"
            })
        }

        const ownedListing =
            await queries.getOwnedlistingById(
                userId,
                listingId
            );

        if (!ownedListing) {
            return res.status(404).json({
                error: "Listing not found"
            });
        }

        const { is_active } = req.body;

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                error: "is_active must be a boolean"
            });
        }

        const updatedListing =
            await queries.setListingActiveStatus(
                listingId,
                is_active
            );

        return res.status(200).json(updatedListing);

    } catch (error) {
        console.error(
            "Error updating listing status:",
            error
        );

        return res.status(500).json({
            error: "Failed to update listing status"
        });
    }
}

export async function deleteListing(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const listingId = req.params.id;

        if (!isValidUuid(listingId)) {
            return res.status(400).json({
                error: "Invalid listing ID"
            });
        }

        const ownedListing = await queries.getOwnedlistingById(
            userId,
            listingId
        );

        if (!ownedListing) {
            return res.status(404).json({
                error: "Listing not found"
            });
        }

        const deletedListing = await queries.deleteListing(listingId);

        return res.status(200).json(deletedListing);

    } catch (error) {
        console.error("Error deleting listing:", error);

        return res.status(500).json({
            error: "Failed to delete listing"
        });
    }
}

// PUBLIC

export async function getActiveListings(req: Request, res: Response) {
    try {
        const listings = await queries.getActiveListings();

        return res.status(200).json(listings);

    } catch (error) {
        console.error("Error getting active listings:", error);

        return res.status(500).json({
            error: "Failed to get active listings"
        });
    }
}

export async function getListingById(req: Request, res: Response){
    try {
        const listingId  = req.params.id;

        if(!isValidUuid(listingId)){
            return res.status(400).json({
                error: "Invalid listing ID"
            })
        }

        const listing = await queries.getListingById(listingId);

        if(!listing || !listing.is_active){
            return res.status(404).json({
                error: "Listing not found"
            })
        }

        return res.status(200).json(listing)

    } catch (error) {
        console.error("Error deleting listing", error);
        return res.status(500).json({
            error: "Failed to get listing"
        })
    }
}