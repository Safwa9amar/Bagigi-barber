import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";

type ServiceCardProps = {
  title: string;
  subtitle?: string;
  price: number;
  duration: string;
  image: any;
  onPress?: () => void;
};

export default function ServiceCard({
  title,
  subtitle,
  price,
  duration,
  image,
  onPress,
}: ServiceCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onHoverIn={pressIn}
      onHoverOut={pressOut}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <ImageBackground source={image} style={styles.card}>
          {/* Hover / Press overlay */}
          <Animated.View
            style={[styles.overlay, { opacity: overlayOpacity }]}
          />

          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            <View style={styles.footer}>
              <View style={styles.row}>
                <Ionicons name="time-outline" size={14} color="#D4AF37" />
                <Text style={styles.meta}>{duration}</Text>
              </View>

              <View style={styles.row}>
                <Ionicons name="cash-outline" size={14} color="#D4AF37" />
                <Text style={styles.price}>{price} DA</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D4AF37",
    marginRight: 14,
    overflow: "hidden",
    height: 300,
    width: "100%",
    marginVertical: 10,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000030",
  },

  content: {
    padding: 12,
    backgroundColor: "#000A",
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 2,
  },

  footer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  meta: {
    color: "#D4AF37",
    fontSize: 12,
  },

  price: {
    color: "#D4AF37",
    fontWeight: "bold",
    fontSize: 13,
  },
});
