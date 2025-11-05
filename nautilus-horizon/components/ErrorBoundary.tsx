// Error Boundary Component to prevent blank pages

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
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
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-text-secondary">
                  Error Details
                </summary>
                <pre className="mt-2 p-4 bg-card border border-subtle rounded-lg text-xs text-text-secondary overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
