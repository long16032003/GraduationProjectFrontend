import auth$ from "@/stores/auth"
import type { QueryClient } from "@tanstack/react-query"
import { redirect, type LoaderFunctionArgs } from "react-router"

export const loader =
  (queryClient: QueryClient) =>
    async ({ params }: LoaderFunctionArgs) => {
      if (!auth$.isAuthenticated.get()) {
        // If the user is authenticated, redirect to the dashboard
        return redirect("/login")
      }

      return {
        params
      }
    }