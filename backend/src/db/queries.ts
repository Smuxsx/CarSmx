import { db } from './index.ts'
import { desc, eq } from 'drizzle-orm';
import {
    users, listings, makes, models, listing_images, vehicles, type newUser, type newListing, type make, type model, type vehicle
} from './schema.ts'

// User Queries

export const createUser = async (data: newUser) => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
};

export const getUserById = async (id: string) => {
    return await db.query.users.findFirst({
        where: eq(users.id, id)
    });
}

export const updateUser = async (id: string, data: Partial<newUser>) => {
    const existingUser = await getUserById(id);
    if (!existingUser) {
        throw new Error(`User with ID ${id} not found`);
    }
    const [User] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return User;
}

export const upsertUser = async (data: newUser) => {
    const [user] = await db.insert (users).values(data).onConflictDoUpdate({
        target: users.id,
        set: data
    }).returning();
    return user;
}

// Listing Queries

export const createListing = async (data: newListing) => {
    const [listing] = await db.insert(listings).values(data).returning();
    return listing;
}

export const getListings = async () => {
    return await db.query.listings.findMany({
        orderBy: (listings, { desc }) => [desc(listings.created_at)]
    })
};

export const getActiveListings = async () => {
    return await db.query.listings.findMany({
        where: eq(listings.is_active, true),
        orderBy: (listings, { desc }) => [desc(listings.created_at)]
    })
};

export const getInactiveListings = async () => {
    return await db.query.listings.findMany({
        where: eq(listings.is_active, false),
        orderBy: (listings, { desc }) => [desc(listings.created_at)]
    })
}

export const getListingById = async (id: string) => {
    return await db.query.listings.findFirst({
        where: eq(listings.id, id),
        with: {listing_images: true, vehicle: true}
    });
}

export const getMyListings = async (userId: string) => {
    return await db.query.listings.findMany({
        where: (listings, { and }) => and(eq(listings.user_id, userId), eq(listings.is_active, true)),
        with: { listing_images: true, vehicle: true},
        orderBy: (listings, { desc }) => [desc(listings.created_at)]
    })
}

export const getMyInactiveListings = async (userId: string) => {
    return await db.query.listings.findMany({
        where: (listings, { and }) => and(eq(listings.user_id, userId), eq(listings.is_active, false)),
        with: { listing_images: true, vehicle: true},
        orderBy: (listings, { desc }) => [desc(listings.created_at)]
    })
}

export const getOwnedlistingById = async (userId: string, listingId: string) => {
    return await db.query.listings.findFirst({
        where: (listings, { and }) => and(eq(listings.user_id, userId), eq(listings.id, listingId)),
        with: {listing_images: true, vehicle: true}
    });
}

export const updateListing = async (id: string, data: Partial<newListing>) => {
    const [listing] = await db.update(listings).set(data).where(eq(listings.id, id)).returning();
    return listing;
}

export const setListingActiveStatus = async (id: string, isActive: boolean) => {
    const [listing] = await db.update(listings).set({ is_active: isActive}).where(eq(listings.id, id)).returning()
    return listing;
}
    
export const deleteListing = async (id: string) => {
    const [listing] = await db.delete(listings).where(eq(listings.id, id)).returning();
    return listing;
}

// Vehicle Queries

export const getMakes = async () => {
    const make = await db.query.makes.findMany({
        where: eq(makes.is_active, true),
        orderBy: (makes, { asc }) => [asc(makes.name)],
        columns: {
            id: true,
            name: true
        }
    })
    return make
}

export const getModelsByMake = async (makeId: number) => {
    const model = await db.query.models.findMany({
        where: (models, { and }) => and(eq(models.make_id, makeId), eq(models.is_active, true)),
        orderBy: (models, { asc }) => [asc(models.name)],
        columns: {
            id: true,
            name: true
        }
    })
    return model
}

export const getVehiclesByModel = async (modelId: number) => {
    const vehicle = await db.query.vehicles.findMany({
        where: eq(vehicles.model_id, modelId),
        orderBy: (vehicles, { desc }) => [desc(vehicles.year)],
        columns: {
            id: true,
            year: true
        }
    })
    return vehicle
}

export const getVehicleById = async (id: number) => {
    return await db.query.vehicles.findFirst({
        where: eq(vehicles.id, id)
    });
}