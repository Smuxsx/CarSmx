import {boolean, integer, pgTable, text, timestamp, uuid, pgEnum, check } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Enum for exterior colors of vehicles
export const exteriorColorEnum = pgEnum("exterior_color_enum", [
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
]);

export const transmissionEnum = pgEnum("transmission_enum", [
  "automatic",
  "manual",
  "semi-automatic",
  "cvt",
  "other",
]);

export const fuelTypeEnum = pgEnum("fuel_type_enum", [
  "gasoline",
  "diesel",
  "electric",
  "hybrid",
  "other",
]); 

export const users = pgTable("users", {
    id: text("id").primaryKey(), // This will be a text and not uuid since we are going to be using clerk id
    first_name: text("first_name").notNull(),
    last_name: text("last_name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone").unique(),
    image_url: text("image_url"),
    created_at: timestamp("created_at", { mode: "date"}).notNull().defaultNow(),
    updated_at: timestamp("last_updated", {mode: "date"}).notNull().defaultNow().$onUpdate(() => new Date())
})

export const makes = pgTable("makes", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    is_active: boolean("is_active").notNull().default(true)
})

export const models = pgTable("models", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    make_id: integer("make_id")
    .notNull()
    .references(() => makes.id, {onDelete: "restrict"}),
    is_active: boolean("is_active").notNull().default(true)
})

export const vehicles = pgTable("vehicles", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    year: integer("year").notNull(),
    model_id: integer("model_id")
    .notNull()
    .references(() => models.id, {onDelete: "restrict"})
})

export const listings = pgTable("listings", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: text("user_id")
    .notNull()
    .references(() => users.id, {onDelete: "cascade"}),
    trim: text("trim").notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    vehicle_id: integer("vehicle_id")
    .notNull()
    .references(() => vehicles.id, {onDelete: 'restrict'}),
    mileage: integer("mileage").notNull(),
    vin: text("vin").notNull(),
    exterior_color: exteriorColorEnum("exterior_color").notNull(),
    transmission: transmissionEnum("transmission").notNull(),
    fuel_type: fuelTypeEnum("fuel_type").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { mode: "date"}).notNull().defaultNow(),
    updated_at: timestamp("last_updated", {mode: "date"}).notNull().defaultNow().$onUpdate(() => new Date())

}, (table) => [
    check("listings_vin_length", sql`char_length(${table.vin}) = 17`),
    check("listings_mileage_non_negative", sql`${table.mileage} >= 0`),
    check("listings_price_non_negative", sql`${table.price} >= 0`),
])

export const listing_images = pgTable("listing_images", { 
    id: uuid("id").defaultRandom().primaryKey(),
    imageUrl: text("image_url").notNull(),
    position: integer("position").notNull(),
    is_primary: boolean("is_primary").notNull().default(false),
    listing_id: uuid("listing_id")
    .notNull()
    .references(() => listings.id, {onDelete: 'cascade'})
})


// Relations between tables in the database
export const user_relations = relations(users, ({ many }) => ({
    listings: many(listings)
}))

export const listing_relations = relations(listings, ({ many, one }) => ({
   user: one(users, {fields: [listings.user_id], references: [users.id]}),
   listing_images: many(listing_images),
   vehicle: one(vehicles, {fields: [listings.vehicle_id], references: [vehicles.id]})
}))

export const makes_relations = relations(makes, ({ many }) => ({
    models: many(models),
}))

export const models_relations = relations(models, ({ many, one }) => ({
    vehicles: many(vehicles),
    makes: one(makes, {fields: [models.make_id], references: [makes.id]})
}))

export const vehicles_relations = relations(vehicles, ({ one }) => ({
    models: one(models, {fields: [vehicles.model_id], references: [models.id]}),
}))

export const listing_images_relations = relations(
    listing_images,
    ({ one }) => ({
        listing: one(listings, {
            fields: [listing_images.listing_id],
            references: [listings.id],
        }),
    }),
);

 