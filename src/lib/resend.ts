import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
export const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
export const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
