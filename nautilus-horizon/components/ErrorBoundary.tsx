// Error Boundary Component to prevent blank pages

import React, { Component, ReactNode } from 'react';
import { logger, LogLevel } from '../services/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with full context
    logger.componentError(
      'ErrorBoundary',
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
      {
        component: 'ErrorBoundary',
        action: 'componentDidCatch',
        errorId: this.state.errorId,
      }
    );

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (e) {
        logger.error('Error in onError handler', e as Error);
      }
    }

    // Update state with error info
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-background">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Something went wrong
            </h1>
            <p className="text-text-secondary mb-6">
              There was an error loading this page. Please try refreshing or switching to a different user role.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors"
              >
                Try Again
              </button>
            </div>
            {this.state.errorId && (
              <div className="mb-4 text-sm text-text-secondary">
                Error ID: <code className="bg-subtle px-2 py-1 rounded">{this.state.errorId}</code>
              </div>
            )}
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-text-secondary hover:text-text-primary">
                  Error Details (Click to expand)
                </summary>
                <div className="mt-2 p-4 bg-card border border-subtle rounded-lg text-xs text-text-secondary overflow-auto max-h-96">
                  <div className="mb-2">
                    <strong>Message:</strong>
                    <div className="mt-1 text-error">{this.state.error.message}</div>
                  </div>
                  {this.state.error.stack && (
                    <div className="mb-2">
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            <div className="mt-4 text-xs text-text-secondary">
              <p>This error has been logged. If the problem persists, please contact support with the Error ID above.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
