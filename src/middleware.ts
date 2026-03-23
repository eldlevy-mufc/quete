import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes - no auth needed
  const publicPaths = ["/login", "/sign", "/view", "/api/auth"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  // Public API endpoints
  const isPublicApi =
    pathname.match(/^\/api\/quotes\/\d+\/pdf/) ||
    pathname.match(/^\/api\/quotes\/\d+\/sign/);

  if (isPublic || isPublicApi) return;

  // Static files and images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/logo") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".ico")
  ) {
    return;
  }

  // Not authenticated - redirect to login
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
