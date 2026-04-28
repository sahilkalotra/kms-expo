import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { Button } from '@/src/ui/Button';
import { TextField } from '@/src/ui/TextField';

export default function RegisterScreen() {
  const { register, status } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    const res = await register({ username, email, password });
    if (!res.ok) setError(res.error);
  }

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950 px-5 justify-center">
      <Text className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Create account</Text>
      <Text className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Register to start learning.</Text>

      <View className="mt-6 gap-3">
        <TextField value={username} onChangeText={(v) => setUsername(v.trim().toLowerCase())} placeholder="Username" />
        <TextField value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
        <TextField value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
        {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
        <Button title={status === 'loading' ? 'Creating...' : 'Create account'} onPress={onSubmit} disabled={status === 'loading'} />
      </View>

      <View className="mt-5 flex-row justify-center gap-2">
        <Text className="text-sm text-zinc-600 dark:text-zinc-300">Already have an account?</Text>
        <Link href="/(auth)/login" className="text-sm text-blue-600">
          Sign in
        </Link>
      </View>
    </View>
  );
}

