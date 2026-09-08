export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/library/:path*", "/checkout/:path*"],
};
