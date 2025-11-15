import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { theme } from '@/globals';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
}

/**
 * Comprehensive Error Boundary with Sentry integration
 *
 * Features:
 * - Catches React component errors
 * - Sends errors to Sentry automatically
 * - Shows user-friendly error screen
 * - Provides recovery options
 * - Displays detailed error info in development
 */
class SentryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    console.log('🚨 Error Boundary: getDerivedStateFromError', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary caught error:', error);
    console.error('🚨 Error info:', errorInfo);

    // Log component stack to Sentry
    Sentry.withScope((scope) => {
      scope.setContext('errorBoundary', {
        componentStack: errorInfo.componentStack,
      });

      // Capture the error and get event ID
      const eventId = Sentry.captureException(error);

      console.log(`📤 Error sent to Sentry with ID: ${eventId}`);

      this.setState({
        error,
        errorInfo,
        eventId,
      });
    });
  }

  handleReset = () => {
    console.log('🔄 Resetting error boundary');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleReportFeedback = () => {
    const { eventId } = this.state;
    if (eventId) {
      console.log('📝 Opening Sentry feedback form');
      // In production, you could open a feedback form or support page
      // For now, we'll just log it
      Sentry.captureMessage('User requested feedback form', 'info');
    }
  };

  render() {
    const { hasError, error, errorInfo, eventId } = this.state;
    const { children, fallback, showDetails = __DEV__ } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>
              We've been notified and are working on a fix.
            </Text>

            {eventId && (
              <View style={styles.eventIdContainer}>
                <Text style={styles.eventIdLabel}>Error ID:</Text>
                <Text style={styles.eventId}>{eventId}</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={this.handleReset}
              >
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              {eventId && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={this.handleReportFeedback}
                >
                  <Text style={styles.secondaryButtonText}>
                    Report Feedback
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {showDetails && error && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Technical Details:</Text>
                <Text style={styles.errorText}>
                  {error.toString()}
                </Text>
                {errorInfo?.componentStack && (
                  <Text style={styles.stackText}>
                    {errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.bg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.color.textBad,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.color.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  eventIdContainer: {
    backgroundColor: theme.color.bgComponent,
    padding: 16,
    borderRadius: theme.radius.standard,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.color.bgBorder,
  },
  eventIdLabel: {
    fontSize: 12,
    color: theme.color.textSubtle,
    marginBottom: 4,
  },
  eventId: {
    fontSize: 14,
    color: theme.color.text,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: theme.color.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: theme.radius.standard,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: theme.radius.standard,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.color.bgBorder,
  },
  secondaryButtonText: {
    color: theme.color.text,
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    marginTop: 32,
    width: '100%',
    backgroundColor: theme.color.bgComponent,
    padding: 16,
    borderRadius: theme.radius.standard,
    borderWidth: 1,
    borderColor: theme.color.bgBorder,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.color.text,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: theme.color.textBad,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  stackText: {
    fontSize: 10,
    color: theme.color.textSubtle,
    fontFamily: 'monospace',
  },
});

export default SentryErrorBoundary;
