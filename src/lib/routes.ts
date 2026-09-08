import type { Route } from "next";

/** Typed-routes helper for paths the generator has not picked up yet. */
export function route(path: string): Route {
  return path as Route;
}
