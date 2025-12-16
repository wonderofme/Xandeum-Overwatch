"use client";

import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents the entire app from crashing when errors occur
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-[#030712] p-4">
          <div className="max-w-md rounded-lg border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
            <h2 className="mb-4 text-xl font-bold text-white/90">Something went wrong</h2>
            <p className="mb-4 text-white/60">
              We encountered an error while loading the network data. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-white/10 px-4 py-2 text-white/90 transition-colors hover:bg-white/20"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

