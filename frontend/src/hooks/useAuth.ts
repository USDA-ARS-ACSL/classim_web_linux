import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState, useEffect } from "react"

import { AxiosError } from "axios"
import {
  type ApiError,
  LoginService,
  type UserPublic,
  UsersService,
} from "../client"

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null
}

const useAuth = () => {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const { data: user, isLoading } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,
    enabled: isLoggedIn(),
  })

  // Handle OAuth callback token from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("token")
    const error = urlParams.get("error")
    
    if (token) {
      localStorage.setItem("access_token", token)
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname)
      // Invalidate queries to fetch user data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      navigate({ to: "/" })
    } else if (error) {
      setError(getErrorMessage(error))
      // Remove error from URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [navigate, queryClient])

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "missing_parameters":
        return "Authentication failed: Missing required parameters"
      case "invalid_state":
        return "Authentication failed: Invalid state parameter"
      case "auth_failed":
        return "Authentication failed: Unable to connect to USDA eAuth"
      case "internal_error":
        return "Authentication failed: Internal server error"
      default:
        return `Authentication failed: ${errorCode}`
    }
  }

  const initiateOIDCLogin = async () => {
    // Redirect to backend OIDC endpoint (USDA eAuth)
    window.location.href = "/api/v1/auth/login"
    return Promise.resolve()
  }

  const loginMutation = useMutation({
    mutationFn: initiateOIDCLogin,
    onError: (err: ApiError) => {
      let errDetail = (err.body as any)?.detail

      if (err instanceof AxiosError) {
        errDetail = err.message
      }

      if (Array.isArray(errDetail)) {
        errDetail = "Something went wrong"
      }

      setError(errDetail)
    },
  })

  const logout = async () => {
    try {
      // Call backend logout endpoint
      if (isLoggedIn()) {
        await LoginService.logout()
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Always clear local storage and redirect
      localStorage.removeItem("access_token")
      queryClient.clear()
      navigate({ to: "/login" })
    }
  }

  return {
    loginMutation,
    logout,
    user,
    isLoading,
    error,
    resetError: () => setError(null),
    initiateOIDCLogin,
  }
}

export { isLoggedIn }
export default useAuth
