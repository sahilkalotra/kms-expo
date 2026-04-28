import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, TextInput, type TextInputProps, View } from 'react-native';

export function TextField({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  ...rest
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'secureTextEntry' | 'keyboardType' | 'autoCapitalize'>) {
  const canTogglePassword = !!secureTextEntry;
  const [isPasswordHidden, setIsPasswordHidden] = useState(!!secureTextEntry);

  const resolvedSecureTextEntry = useMemo(
    () => (canTogglePassword ? isPasswordHidden : !!secureTextEntry),
    [canTogglePassword, isPasswordHidden, secureTextEntry],
  );

  return (
    <View className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 flex-row items-center">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={resolvedSecureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className="flex-1 text-base text-zinc-900 dark:text-zinc-100"
        {...rest}
      />

      {canTogglePassword ? (
        <Pressable
          onPress={() => setIsPasswordHidden((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={isPasswordHidden ? 'Show password' : 'Hide password'}
          hitSlop={10}
          className="ml-3"
        >
          <Ionicons name={isPasswordHidden ? 'eye' : 'eye-off'} size={20} color="#64748b" />
        </Pressable>
      ) : null}
    </View>
  );
}

