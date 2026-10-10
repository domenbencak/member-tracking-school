import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function proxy(request) {
    if (
      request.nextauth.token?.mustChangePassword &&
      request.nextUrl.pathname !== "/racun/geslo"
    ) {
      return NextResponse.redirect(new URL("/racun/geslo", request.url));
    }
    return NextResponse.next();
  },
  {
    secret: process.env.AUTH_SECRET,
    pages: { signIn: "/prijava" },
    callbacks: { authorized: ({ token }) => Boolean(token) },
  },
);

export const config = {
  matcher: ["/((?!api/auth|prijava|_next/static|_next/image|favicon.ico).*)"],
};
