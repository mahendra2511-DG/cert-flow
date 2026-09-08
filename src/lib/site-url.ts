export function siteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:43145").replace(/\/$/, "");
}
