import { useState } from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

import { Button } from '@/src/ui/Button';
import { TextField } from '@/src/ui/TextField';
import { useAuth } from '@/src/features/auth/hooks/useAuth';

export default function LoginScreen() {
  const { login, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    const res = await login({ email, password });
    if (!res.ok) setError(res.error);
  }

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950 px-5 justify-center">
      <Text className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Welcome back</Text>
      <Text className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Sign in to continue.</Text>

      <View className="mt-6 gap-3">
        <TextField value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
        <TextField value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
        {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
        <Button title={status === 'loading' ? 'Signing in...' : 'Sign in'} onPress={onSubmit} disabled={status === 'loading'} />
      </View>

      <View className="mt-5 flex-row justify-center gap-2">
        <Text className="text-sm text-zinc-600 dark:text-zinc-300">No account?</Text>
        <Link href="/(auth)/register" className="text-sm text-blue-600">
          Register
        </Link>
      </View>
    </View>
  );
}

