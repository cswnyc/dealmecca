'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      eventId: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const eventId = this.logError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      eventId,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report to monitoring service
    this.reportError(error, errorInfo, eventId);
  }

  private logError(error: Error, errorInfo: ErrorInfo): string {
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.group(`🚨 Error Boundary Caught Error [${eventId}]`);
    console.error('Error:', error.name, error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Props:', this.props);
    console.groupEnd();

    return eventId;
  }

  private reportError(error: Error, errorInfo: ErrorInfo, eventId: string) {
    // Report to external monitoring service (e.g., Sentry)
    try {
      fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          errorInfo,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          level: this.props.level || 'component',
        }),
      }).catch(() => {
        // Silently fail if error reporting fails
      });
    } catch {
      // Silently fail if error reporting fails
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null,
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, eventId } = this.state;
      const { level = 'component', showDetails = false } = this.props;
      const canRetry = this.retryCount < this.maxRetries;

      // Different UI based on error level
      if (level === 'critical') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                System Error
              </h1>
              <p className="text-gray-600 mb-6">
                We're experiencing technical difficulties. Our team has been notified.
              </p>
              {eventId && (
                <p className="text-xs text-gray-400 mb-4">
                  Error ID: {eventId}
                </p>
              )}
              <div className="space-y-3">
                <Button
                  onClick={this.handleReload}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>
            </div>
          </div>
        );
      }

      if (level === 'page') {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-lg w-full bg-white rounded-lg shadow-sm p-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Bug className="w-6 h-6 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Something went wrong
                </h2>
                <p className="text-gray-600 mb-6">
                  We encountered an error loading this page. Please try again.
                </p>
                
                {eventId && (
                  <p className="text-xs text-gray-400 mb-4">
                    Reference: {eventId}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  {canRetry && (
                    <Button
                      onClick={this.handleRetry}
                      variant="default"
                      className="flex-1"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  )}
                  <Button
                    onClick={this.handleGoBack}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                </div>

                {showDetails && error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                      Technical Details
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
                      <p className="font-bold">{error.name}: {error.message}</p>
                      {error.stack && (
                        <pre className="mt-2 whitespace-pre-wrap text-gray-600">
                          {error.stack}
                        </pre>
                      )}
                      {errorInfo && (
                        <details className="mt-2">
                          <summary className="text-gray-500">Component Stack</summary>
                          <pre className="mt-1 text-gray-600">
                            {errorInfo.componentStack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Component level error (inline)
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Component Error
              </h3>
              <p className="text-sm text-red-700 mt-1">
                This section couldn't be loaded. {canRetry ? 'You can try refreshing it.' : 'Please refresh the page.'}
              </p>
              {eventId && (
                <p className="text-xs text-red-600 mt-2">
                  Error ID: {eventId}
                </p>
              )}
              <div className="mt-3 flex space-x-2">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={this.handleReload}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Specialized error boundaries for different use cases
export function SearchErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="component"
      fallback={
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Search Unavailable
              </h3>
              <p className="text-sm text-yellow-700">
                Search is temporarily unavailable. Please try again.
              </p>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function ForumErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="component"
      fallback={
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Forum Unavailable
              </h3>
              <p className="text-sm text-blue-700">
                Forum posts couldn't be loaded. Please refresh to try again.
              </p>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function CodeGenerationErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="component"
      fallback={
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Bug className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-sm font-medium text-purple-800">
                Code Generation Error
              </h3>
              <p className="text-sm text-purple-700">
                The code generation feature encountered an error. Please try again.
              </p>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}