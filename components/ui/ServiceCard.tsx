import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* Image */}
      <Image source={image} style={styles.image} />

      {/* Content */}
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
    </TouchableOpacity>
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
    height: 400,
    width: 250,
    marginVertical: 10,
  },

  image: {
    width: "100%",
    height: 300,
  },

  content: {
    padding: 12,
  },

  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9CA3AF",
    fontSize: 11,
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
    fontSize: 11,
  },

  price: {
    color: "#D4AF37",
    fontWeight: "bold",
    fontSize: 13,
  },
});
