import { createCookie } from "@remix-run/cloudflare";

const isProduction = process.env.NODE_ENV === "production";

export const wcCookie = createCookie("wc_include", {
  path: "/",
  sameSite: "lax",
  secure: isProduction,
  httpOnly: true,
  maxAge: 365 * 24 * 60 * 60, // 365 days
});
