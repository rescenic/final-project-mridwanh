// src/utils/env.ts

import dotenv from "dotenv";
dotenv.config();

export const CLOUDINARY_API_KEY: string = process.env.CLOUDINARY_API_KEY || "";
export const CLOUDINARY_API_SECRET: string =
  process.env.CLOUDINARY_API_SECRET || "";
export const CLOUDINARY_CLOUD_NAME: string =
  process.env.CLOUDINARY_CLOUD_NAME || "";
export const DATABASE_URL: string = process.env.DATABASE_URL || "";
export const SECRET: string = process.env.SECRET || "secret";
export const ZOHO_USER: string = process.env.ZOHO_USER || "";
export const ZOHO_PASS: string = process.env.ZOHO_PASS || "";

console.log("SECRET length:", SECRET.length);