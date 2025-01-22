import { createElement, type ComponentType, type LazyExoticComponent } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import type { AppRoute } from "./config";

/**
 * Recursively wraps protected routes with AuthGuard and ProtectedRoute components
 */
export function wrapProtectedRoutes(routes: AppRoute[]): AppRoute[] {
  return routes.map((route) => {
    // Clone the route to avoid mutating the original
    const newRoute = { ...route };

    // If the route is protected, wrap it with AuthGuard
    if (route.protected) {
      const OriginalComponent = route.element;
      
      // Create a wrapper component that combines AuthGuard and ProtectedRoute if needed
      newRoute.element = function ProtectedComponent(props: Record<string, unknown>) {
        const element = createElement(OriginalComponent as ComponentType, props);
        
        // If roles are specified, wrap with ProtectedRoute first
        if (route.allowedRoles) {
          return createElement(
            ProtectedRoute, 
            { allowedRoles: route.allowedRoles, children: element }
          );
        }
        
        // Otherwise just wrap with AuthGuard
        return createElement(AuthGuard, { children: element });
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