import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Disc, Home, User } from 'lucide-react-native';
import { colors } from '@/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  // Calculate bottom position based on safe area
  const bottomSpacing = Platform.select({
    ios: Math.max(insets.bottom, 16) + 8,
    android: 16,
  }) ?? 16;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          bottom: bottomSpacing,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <View style={styles.tabBarInner} />
          </View>
        ),
        tabBarActiveTintColor: colors.interactive.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIconStyle: styles.tabIcon,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => (
            <Disc size={24} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => (
            <Home size={24} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <User size={24} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: Platform.select({
      ios: 64,
      android: 68,
    }),
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingBottom: 0,
    paddingTop: 0,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.text.primary,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  tabBarInner: {
    flex: 1,
    backgroundColor: colors.background.surface,
    borderRadius: 32,
    borderWidth: Platform.select({
      ios: 1,
      android: 1.5,
    }),
    borderColor: Platform.select({
      ios: 'rgba(30, 27, 24, 0.05)',
      android: 'rgba(30, 27, 24, 0.08)',
    }),
    ...Platform.select({
      android: {
        shadowColor: colors.text.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 28,
        elevation: 20,
      },
    }),
  },
  tabLabel: {
    fontSize: Platform.select({
      ios: 11,
      android: 12,
    }),
    fontWeight: '600',
    marginTop: Platform.select({
      ios: 2,
      android: 4,
    }),
    marginBottom: Platform.select({
      ios: -2,
      android: 0,
    }),
    letterSpacing: 0.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabItem: {
    paddingVertical: Platform.select({
      ios: 6,
      android: 8,
    }),
    paddingHorizontal: Platform.select({
      ios: 16,
      android: 20,
    }),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    marginTop: Platform.select({
      ios: 2,
      android: 0,
    }),
    marginBottom: Platform.select({
      ios: 0,
      android: -2,
    }),
  },
});
