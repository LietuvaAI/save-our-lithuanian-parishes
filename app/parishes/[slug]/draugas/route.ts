import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

async function redirectToParishProfile(
  request: NextRequest,
  { params }: RouteContext,
) {
  const { slug } = await params;
  const destination = request.nextUrl.clone();
  destination.pathname = `/parishes/${encodeURIComponent(slug)}`;
  destination.search = "";
  return NextResponse.redirect(destination, 308);
}

export const GET = redirectToParishProfile;
export const HEAD = redirectToParishProfile;
