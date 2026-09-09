import { GET as shared } from "@/app/api/questions/route";

export async function GET(request: Request) {
  const url = new URL(request.url);
  url.searchParams.set("tier", "premium");
  return shared(new Request(url, request));
}
