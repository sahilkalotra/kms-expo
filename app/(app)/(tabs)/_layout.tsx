import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? '#09090b' : '#ffffff';
  const border = isDark ? '#27272a' : '#e4e4e7';
  const text = isDark ? '#fafafa' : '#09090b';
  const muted = isDark ? '#a1a1aa' : '#64748b';
  const active = '#2563eb';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: true,
        headerStyle: { backgroundColor: bg },
        headerTitleStyle: { color: text },
        headerTintColor: text,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: border,
        },
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: muted,
      }}
    >
      <Tabs.Screen
        name="courses/index"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

