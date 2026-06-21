import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/auth/login", "/auth/forgot", "/auth/otp", "/auth/reset"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!token && !isPublic) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token && token.role !== "admin") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
