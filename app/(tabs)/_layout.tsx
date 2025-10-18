import { useState, useRef } from 'react';
import { View, Dimensions, StyleSheet, Pressable, Text, Platform, PanResponder, Animated } from 'react-native';
import { BarChart3, User, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const translateX = useRef(new Animated.Value(0)).current;
  const panStartX = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        panStartX.current = -activeIndex * SCREEN_WIDTH;
      },
      onPanResponderMove: (_, gestureState) => {
        const newTranslateX = panStartX.current + gestureState.dx;
        const minTranslate = -(tabs.length - 1) * SCREEN_WIDTH;
        const maxTranslate = 0;
        const clampedTranslate = Math.max(minTranslate, Math.min(maxTranslate, newTranslateX));
        translateX.setValue(clampedTranslate);
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = SCREEN_WIDTH * 0.3;
        let targetIndex = activeIndex;

        if (gestureState.dx < -threshold && activeIndex < tabs.length - 1) {
          targetIndex = activeIndex + 1;
        } else if (gestureState.dx > threshold && activeIndex > 0) {
          targetIndex = activeIndex - 1;
        }

        animateToTab(targetIndex);
      },
    })
  ).current;

  const animateToTab = (index: number) => {
    setActiveIndex(index);
    Animated.spring(translateX, {
      toValue: -index * SCREEN_WIDTH,
      useNativeDriver: true,
      damping: 20,
      stiffness: 90,
    }).start();
  };

  const handleTabPress = (index: number) => {
    animateToTab(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.screensWrapper} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.screensContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {tabs.map((tab) => {
            const TabComponent = tab.component;
            return (
              <View key={tab.key} style={[styles.screen, { width: SCREEN_WIDTH }]}>
                <TabComponent />
              </View>
            );
          })}
        </Animated.View>
      </View>

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
  screensWrapper: {
    flex: 1,
    overflow: 'hidden',
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
