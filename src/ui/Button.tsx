import { Pressable, Text, View } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'md' | 'sm';

export function Button({
  title,
  onPress,
  disabled,
  variant = 'primary',
  size = 'md',
  icon,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}) {
  const base = 'rounded-2xl items-center justify-center flex-row';
  const pad = size === 'sm' ? 'px-3 py-2' : 'px-4 py-3';
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  const colors =
    variant === 'primary'
      ? 'bg-blue-600'
      : variant === 'danger'
        ? 'bg-red-600'
        : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800';

  const textColor = variant === 'secondary' ? 'text-zinc-900 dark:text-zinc-100' : 'text-white';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[base, pad, colors, disabled ? 'opacity-50' : 'opacity-100'].join(' ')}
    >
      {icon ? <View className={title ? 'mr-2' : ''}>{icon}</View> : null}
      {title ? <Text className={[textSize, 'font-semibold', textColor].join(' ')}>{title}</Text> : null}
    </Pressable>
  );
}

