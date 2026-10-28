import { Router } from "express";
import * as listingController from "../controllers/listingController.ts";
import { requireAuthentication } from "../middleware/requireAuthentication.ts";

const router = Router()

// POST /api/listings/ => creates a proudct with user auth
router.post("/", requireAuthentication, listingController.createListing);

// GET /api/listings => Get all active listings available for any user to see
router.get("/", listingController.getActiveListings);

// GET /api/listings/my => get all the users active listings (requires auth)
router.get("/my", requireAuthentication, listingController.getMyListings)

// GET /api/listings/myInactive => get all the users Inactive listings (requires auth)
router.get("/myInactive", requireAuthentication, listingController.getMyInactiveListings)

// PUT /api/listings/:id => updates a listing with user auth
router.patch("/:id", requireAuthentication, listingController.updateListing);

// PATCH /api/listings/:id => updates a listing active status requires auth
router.patch("/:id/status", requireAuthentication, listingController.setListingActiveStatus);

// DELETE /api/listings/:id => Deletes a listing with user authentication
router.delete("/:id", requireAuthentication, listingController.deleteListing);

// GET /api/listings/:id => Get a listing by specific ID
router.get("/:id", listingController.getListingById)


export default router