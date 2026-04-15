/** Base URL for backend API (Milestone 1 motor + Milestone 2 login). */
export const API_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:9000";
