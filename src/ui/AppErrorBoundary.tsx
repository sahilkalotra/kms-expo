import React from 'react';
import { DevSettings, Text, View } from 'react-native';

import { Button } from '@/src/ui/Button';

type State = { hasError: boolean; message?: string; stack?: string };

export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    const msg = error && typeof error === 'object' && 'message' in error ? String((error as any).message) : 'Unexpected error';
    return { hasError: true, message: msg };
  }

  componentDidCatch(error: any) {
    this.setState({ stack: typeof error?.stack === 'string' ? error.stack : undefined });
    // Keep it simple: console log is useful during evaluation.
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View className="flex-1 bg-white dark:bg-zinc-950 px-6 items-center justify-center">
        <Text className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Something went wrong</Text>
        <Text className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 text-center">{this.state.message}</Text>
        {this.state.stack ? (
          <Text className="mt-4 text-[11px] text-zinc-500 dark:text-zinc-400" numberOfLines={6}>
            {this.state.stack}
          </Text>
        ) : null}

        <View className="mt-6 w-full gap-2">
          <Button title="Try again" onPress={() => this.setState({ hasError: false, message: undefined, stack: undefined })} />
          <Button title="Reload app" variant="secondary" onPress={() => DevSettings.reload()} />
        </View>
      </View>
    );
  }
}

