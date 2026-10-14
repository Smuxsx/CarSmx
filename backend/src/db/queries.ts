import { db } from './index.ts'
import { eq } from 'drizzle-orm';
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
        with: {user: true},
        orderBy: (listings, { desc }) => [desc(listings.created_at)]
    })
};

export const getListingById = async (id: string) => {
    return await db.query.listings.findFirst({
        where: eq(listings.id, id),
        with: {user: true, listing_images: true, vehicle: true}
    });
}

export const getMyListings = async (userId: string) => {
    return await db.query.listings.findMany({
        where: eq(listings.user_id, userId),
        with: {user: true, listing_images: true, vehicle: true},
        orderBy: (listings, { desc }) => [desc(listings.created_at)]
    })
}

export const getOwnedlistingById = async (userId: string, listingId: string) => {
    return await db.query.listings.findFirst({
        where: (listings, { and }) => and(eq(listings.user_id, userId), eq(listings.id, listingId)),
        with: {user: true, listing_images: true, vehicle: true}
    });
}

export const updateListing = async (id: string, data: Partial<newListing>) => {
    const existingListing = await getListingById(id);
    if(!existingListing ) {
        throw new Error(`Listing with ID ${id} not found`);
    }
    const [listing] = await db.update(listings).set(data).where(eq(listings.id, id)).returning();
    return listing;
}

export const setListingActiveStatus = async (id: string, isActive: boolean) => {
    const existingListing = await getListingById(id);
    if(!existingListing) {
        throw new Error(`Listing with ID ${id} not found`)
    }
    const [listing] = await db.update(listings).set({ is_active: isActive}).where(eq(listings.id, id)).returning()
    return listing;
}
    
export const deleteListing = async (id: string) => {
    const existingListing = await getListingById;
    if(!existingListing) {
        throw new Error(`Listing with ID ${id} not found`)
    }
    const [listing] = await db.delete(listings).where(eq(listings.id, id)).returning();
    return listing;
}