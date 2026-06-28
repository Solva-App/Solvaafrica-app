import { Tabs } from 'expo-router';
import TabIcon from '@expo/vector-icons/Ionicons';
import { Text } from 'react-native';
import { colors } from '@/src/constants/theme';
import { hscale, mscale } from '@/src/helpers/metric';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactiveTintColor,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 1,
          borderTopColor: '#F0EDF6',
          height: hscale(62),
          backgroundColor: '#fff',
          paddingBottom: hscale(6),
          paddingTop: hscale(6),
        },
      }}
      initialRouteName="index"
    >
      {/* ── Home ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: ({ focused }) => (
            <Text style={{
              fontFamily: 'Inter-Medium',
              fontSize: mscale(11),
              color: focused ? colors.primary : colors.tabBarInactiveTintColor,
            }}>
              Home
            </Text>
          ),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
              size={mscale(22)}
            />
          ),
        }}
      />

      {/* ── Community (previously filter) ── */}
      <Tabs.Screen
        name="filter"
        options={{
          title: 'Community',
          tabBarLabel: ({ focused }) => (
            <Text style={{
              fontFamily: 'Inter-Medium',
              fontSize: mscale(11),
              color: focused ? colors.primary : colors.tabBarInactiveTintColor,
            }}>
              Community
            </Text>
          ),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'people' : 'people-outline'}
              color={color}
              size={mscale(22)}
            />
          ),
        }}
      />

      {/* ── Premium (previously downloads) ── */}
      <Tabs.Screen
        name="downloads"
        options={{
          title: 'Premium',
          tabBarLabel: ({ focused }) => (
            <Text style={{
              fontFamily: 'Inter-Medium',
              fontSize: mscale(11),
              color: focused ? colors.primary : colors.tabBarInactiveTintColor,
            }}>
              Premium
            </Text>
          ),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'diamond' : 'diamond-outline'}
              color={color}
              size={mscale(22)}
            />
          ),
        }}
      />

      {/* ── Settings ── */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: ({ focused }) => (
            <Text style={{
              fontFamily: 'Inter-Medium',
              fontSize: mscale(11),
              color: focused ? colors.primary : colors.tabBarInactiveTintColor,
            }}>
              Settings
            </Text>
          ),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'settings' : 'settings-outline'}
              color={color}
              size={mscale(22)}
            />
          ),
        }}
      />
    </Tabs>
  );
}