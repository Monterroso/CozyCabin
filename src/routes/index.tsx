/**
 * index.tsx
 * Main routing configuration combining all route segments
 */

import { createElement } from "react";
import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { routes } from "./config";
import { createRouteConfig } from "./utils";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import type { AppRoute } from "./config";

// Convert our AppRoute type to React Router's RouteObject type
function convertToRouteObject(route: AppRoute): RouteObject {
  const routeObject: RouteObject = {
    path: route.path,
    element: createElement(route.element),
    errorElement: route.errorElement ? createElement(route.errorElement) : <ErrorBoundary />,
  };

  if (route.children) {
    routeObject.children = route.children.map(convertToRouteObject);
  }

  return routeObject;
}

// Process the routes with our configuration utility
const processedRoutes = createRouteConfig(routes).map(convertToRouteObject);

const router = createBrowserRouter(processedRoutes);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}