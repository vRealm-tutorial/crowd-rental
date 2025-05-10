export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

export enum UserRoles {
  TENANT = "tenant",
  LANDLORD = "landlord",
  AGENT = "agent",
  ADMIN = "admin",
}

export const PROPERTY_TYPES = [
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Duplex", value: "duplex" },
  { label: "Bungalow", value: "bungalow" },
  { label: "Self Contained", value: "self_contained" },
  { label: "Commercial", value: "commercial" },
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number]["value"];

export const PROPERTY_FEATURES = [
  { label: "Air Conditioning", value: "air_conditioning" },
  { label: "Balcony", value: "balcony" },
  { label: "Swimming Pool", value: "swimming_pool" },
  { label: "Gym", value: "gym" },
  { label: "Security", value: "security" },
  { label: "Parking", value: "parking" },
  { label: "Furnished", value: "furnished" },
  { label: "Borehole", value: "borehole" },
  { label: "Generator", value: "generator" },
  { label: "Elevator", value: "elevator" },
  { label: "WiFi", value: "wifi" },
  { label: "Laundry", value: "laundry" },
] as const;

export type PropertyFeature = (typeof PROPERTY_FEATURES)[number]["value"];

export const PAYMENT_FREQUENCY = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Bi-annually", value: "biannually" },
  { label: "Yearly", value: "yearly" },
] as const;

export type PaymentFrequency = (typeof PAYMENT_FREQUENCY)[number]["value"];

export enum ViewingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  CANCELED = "canceled",
  NO_SHOW = "no_show",
}

export const SUBSCRIPTION_FEE = 20000; // in Naira
export const VIEWING_QUOTA = 5; // per subscription
export const EXTRA_VIEWING_FEE = 1000; // in Naira

export const DISTANCE_THRESHOLD = 30; // in minutes
export const CANCELLATION_THRESHOLD = 24; // in hours

// Platform fee percentages
export const PLATFORM_FEE_PERCENTAGE = 10; // 10%
export const EARLY_WITHDRAWAL_PENALTY = 20; // 20%

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export type NigerianState = (typeof NIGERIAN_STATES)[number];

export const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank", code: "023" },
  { name: "Diamond Bank", code: "063" },
  { name: "Ecobank", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank", code: "011" },
  { name: "First City Monument Bank", code: "214" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Jaiz Bank", code: "301" },
  { name: "Keystone Bank", code: "082" },
  { name: "Polaris Bank", code: "076" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "Union Bank", code: "032" },
  { name: "United Bank for Africa", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
] as const;

export const LISTING_FEES = {
  BASIC: 0, // Free
  PREMIUM: 5000,
  FEATURED: 10000,
} as const;

export const COLOR_SCHEME = {
  PRIMARY: "#1e40af", // Deep blue
  SECONDARY: "#6366f1", // Indigo
  ACCENT: "#f59e0b", // Amber
  DANGER: "#ef4444", // Red
  SUCCESS: "#10b981", // Green
  WARNING: "#f59e0b", // Amber
  INFO: "#3b82f6", // Blue
  LIGHT: "#f3f4f6", // Light gray
  DARK: "#1f2937", // Dark gray
  WHITE: "#ffffff",
  BLACK: "#000000",
  BACKGROUND: "#f9fafb",
  CARD: "#ffffff",
  TEXT: "#111827",
  BORDER: "#e5e7eb",
  NOTIFICATION: "#ef4444",
} as const;
