import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";

export function Loading() {
  const angle = useRef(new Animated.Value(0)).current;
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setReducedMotion(value);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    angle.setValue(0);
    if (reducedMotion) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(angle, { toValue: -90, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.delay(130),
      Animated.timing(angle, { toValue: 1440, duration: 3820, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [angle, reducedMotion]);

  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Loading Pukki">
      <Animated.Image
        source={require("../../frontend/public/images/icons/candycane.png")}
        style={[styles.spinner, { transform: [{ rotate: angle.interpolate({ inputRange: [0, 360], outputRange: ["0deg", "360deg"] }) }] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({ spinner: { width: 100, height: 100 } });
