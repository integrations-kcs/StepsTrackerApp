import { useState, useRef } from 'react';
import { View, Dimensions, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { BarChart3, User, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import DashboardScreen from './index';
import IndividualScreen from './individual';
import SettingsScreen from './settings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const tabs = [
  { key: 'dashboard', title: 'Dashboard', icon: BarChart3, component: DashboardScreen },
  { key: 'individual', title: 'Individual', icon: User, component: IndividualScreen },
  { key: 'settings', title: 'Settings', icon: Settings, component: SettingsScreen },
];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);

  const updateActiveIndex = (newIndex: number) => {
    setActiveIndex(newIndex);
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      const newTranslateX = contextX.value + event.translationX;
      const minTranslate = -(tabs.length - 1) * SCREEN_WIDTH;
      const maxTranslate = 0;
      translateX.value = Math.max(minTranslate, Math.min(maxTranslate, newTranslateX));
    })
    .onEnd((event) => {
      const threshold = SCREEN_WIDTH * 0.3;
      let targetIndex = activeIndex;

      if (event.translationX < -threshold && activeIndex < tabs.length - 1) {
        targetIndex = activeIndex + 1;
      } else if (event.translationX > threshold && activeIndex > 0) {
        targetIndex = activeIndex - 1;
      }

      translateX.value = withSpring(-targetIndex * SCREEN_WIDTH, {
        damping: 20,
        stiffness: 90,
      });

      if (targetIndex !== activeIndex) {
        runOnJS(updateActiveIndex)(targetIndex);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    translateX.value = withSpring(-index * SCREEN_WIDTH, {
      damping: 20,
      stiffness: 90,
    });
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.screensContainer, animatedStyle]}>
          {tabs.map((tab, index) => {
            const TabComponent = tab.component;
            return (
              <View key={tab.key} style={[styles.screen, { width: SCREEN_WIDTH }]}>
                <TabComponent />
              </View>
            );
          })}
        </Animated.View>
      </GestureDetector>

      <View
        style={[
          styles.tabBar,
          {
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeIndex === index;

          return (
            <Pressable
              key={tab.key}
              style={styles.tabButton}
              onPress={() => handleTabPress(index)}
            >
              <Icon
                size={24}
                color={isActive ? '#4285F4' : '#999'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? '#4285F4' : '#999' },
                ]}
              >
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screensContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  screen: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
