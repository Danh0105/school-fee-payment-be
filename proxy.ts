import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("school_fee_session");
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/login";
  const isParentPortal =
    pathname === "/parent" || pathname.startsWith("/parent/");

  if (isParentPortal) return NextResponse.next();

  if (!hasSession && !isLogin) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
