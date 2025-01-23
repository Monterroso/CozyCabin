import { createElement, type ComponentType } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import type { AppRoute } from "./config";

/**
 * Recursively wraps protected routes with AuthGuard component
 */
export function wrapProtectedRoutes(routes: AppRoute[]): AppRoute[] {
  return routes.map((route) => {
    // Clone the route to avoid mutating the original
    const newRoute = { ...route };

    // If the route is protected, wrap it with AuthGuard
    if (route.protected) {
      const OriginalComponent = route.element;
      
      // Create a wrapper component that uses AuthGuard
      newRoute.element = function ProtectedComponent(props: Record<string, unknown>) {
        const element = createElement(OriginalComponent as ComponentType, props);
        return createElement(AuthGuard, { 
          children: element,
          requireAuth: true,
          allowedRoles: route.allowedRoles 
        });
      };
    }

    // Recursively wrap children if they exist
    if (route.children) {
      newRoute.children = wrapProtectedRoutes(route.children);
    }

    return newRoute;
  });
}

/**
 * Creates the final route configuration by applying component props and wrapping protected routes
 */
export function createRouteConfig(routes: AppRoute[]): AppRoute[] {
  return wrapProtectedRoutes(routes).map((route) => {
    // If the route has props, create a component that passes those props
    if (route.props) {
      const Component = route.element as ComponentType;
      route.element = () => createElement(Component, route.props);
    }
    
    return route;
  });
} 