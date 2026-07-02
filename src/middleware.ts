import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withoutLocalePrefix } from "@/lib/locale-path";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/en" || request.nextUrl.pathname.startsWith("/en/")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = withoutLocalePrefix(request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (request.nextUrl.pathname === "/server-status") {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
