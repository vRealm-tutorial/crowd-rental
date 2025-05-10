import { z } from "zod";
import {
  UserRoles,
  PropertyType,
  PropertyFeature,
  PROPERTY_TYPES,
  PROPERTY_FEATURES,
} from "@/constants";

// Authentication Schemas
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name cannot exceed 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .regex(
        /^([0-9]{11}|0[0-9]{10}|\+234[0-9]{10})$/,
        "Please enter a valid Nigerian phone number"
      ),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.nativeEnum(UserRoles),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z
  .object({
    identifier: z.string().min(1, "Email or phone number is required"),
    password: z.string().min(1, "Password is required"),
    loginMethod: z.enum(["email", "phone"]),
  })
  .refine(
    (data) => {
      // Only validate identifier format if it's not empty
      // if (!data.identifier) return false;

      if (data.loginMethod === "email") {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
          data.identifier
        );
      } else {
        return /^([0-9]{11}|0[0-9]{10}|\+234[0-9]{10})$/.test(data.identifier);
      }
    },
    {
      message: "Please enter a valid email address or phone number",
      path: ["identifier"],
    }
  )
  .superRefine((data, ctx) => {
    // Only validate password when using email login
    if (
      data.loginMethod === "email" &&
      (!data.password || data.password.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required for email login",
        path: ["password"],
      });
    }
  });

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
  verificationType: z.enum(["email", "phone", "both"]).optional(),
});

// export const forgotPasswordSchema = z
//   .object({
//     identifier: z.string().min(1, "Email or phone number is required"),
//     identifierType: z.enum(["email", "phone"]),
//   })
//   .refine(
//     (data) => {
//       if (data.identifierType === "email") {
//         return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
//           data.identifier
//         );
//       } else {
//         return /^([0-9]{11}|0[0-9]{10}|\+234[0-9]{10})$/.test(data.identifier);
//       }
//     },
//     {
//       message: "Please enter a valid email address or phone number",
//       path: ["identifier"],
//     }
//   );

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Property Schemas
export const propertySchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  propertyType: z.enum(
    PROPERTY_TYPES.map((t) => t.value) as [PropertyType, ...PropertyType[]]
  ),
  bedrooms: z.number().int().min(0, "Bedrooms must be a positive number"),
  bathrooms: z.number().int().min(0, "Bathrooms must be a positive number"),
  size: z.number().positive("Size must be a positive number"),
  features: z.array(
    z.enum(
      PROPERTY_FEATURES.map((f) => f.value) as [
        PropertyFeature,
        ...PropertyFeature[]
      ]
    )
  ),
  address: z.object({
    street: z.string().min(3, "Street address is required"),
    area: z.string().min(2, "Area is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    location: z
      .object({
        coordinates: z.tuple([z.number(), z.number()]),
      })
      .optional(),
  }),
  price: z.object({
    amount: z.number().positive("Price must be a positive number"),
    paymentFrequency: z.enum(["monthly", "quarterly", "biannually", "yearly"]),
  }),
});

// Booking/Viewing Schemas
export const bookingSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  scheduledDate: z.date().refine((date) => date > new Date(), {
    message: "Scheduled date must be in the future",
  }),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const feedbackSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z
    .string()
    .min(3, "Comment must be at least 3 characters")
    .max(500, "Comment cannot exceed 500 characters"),
});

// Payment Schemas
export const bankDetailsSchema = z.object({
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z
    .string()
    .length(10, "Account number must be 10 digits")
    .regex(/^\d+$/, "Account number must contain only numbers"),
  accountName: z.string().min(3, "Account name is required"),
});

export const withdrawalSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  bankDetails: bankDetailsSchema,
  isEarlyWithdrawal: z.boolean().optional(),
});

// Search Filters Schema
export const searchFiltersSchema = z
  .object({
    priceMin: z
      .number()
      .nonnegative("Minimum price must be a positive number")
      .optional()
      .nullable(),
    priceMax: z
      .number()
      .positive("Maximum price must be a positive number")
      .optional()
      .nullable(),
    bedrooms: z
      .number()
      .int()
      .nonnegative("Bedrooms must be a positive number")
      .optional()
      .nullable(),
    bathrooms: z
      .number()
      .int()
      .nonnegative("Bathrooms must be a positive number")
      .optional()
      .nullable(),
    propertyType: z
      .enum(
        PROPERTY_TYPES.map((t) => t.value) as [PropertyType, ...PropertyType[]]
      )
      .optional()
      .nullable(),
    features: z
      .array(
        z.enum(
          PROPERTY_FEATURES.map((f) => f.value) as [
            PropertyFeature,
            ...PropertyFeature[]
          ]
        )
      )
      .optional(),
    location: z.string().optional().nullable(),
    distance: z
      .number()
      .positive("Distance must be a positive number")
      .default(30),
  })
  .refine(
    (data) => {
      if (data.priceMin && data.priceMax) {
        return data.priceMin <= data.priceMax;
      }
      return true;
    },
    {
      message: "Minimum price must be less than or equal to maximum price",
      path: ["priceMin"],
    }
  );
