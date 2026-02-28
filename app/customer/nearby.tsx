import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { auth } from "@/lib/api";
import { useFocusEffect } from "expo-router";

type BarberBase = {
  id: string;
  code: string;
  name: string;
  logo?: string | null;
  barberLogoUri?: string | null;
  latitude: number;
  longitude: number;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type PermissionStatus = "granted" | "denied" | "undetermined" | null;

const DEFAULT_CENTER: Coordinates = {
  latitude: 36.7538,
  longitude: 3.0588,
};

const KNOWN_LOCATIONS: Record<string, Coordinates> = {
  ADM001: { latitude: 36.7538, longitude: 3.0588 },
  ADM002: { latitude: 36.7426, longitude: 3.0845 },
  ADM003: { latitude: 36.7682, longitude: 3.0302 },
};

const resolveLogoUri = (value?: string | null) => {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${process.env.EXPO_PUBLIC_API_URL}${value}`;
};

const hashToOffset = (code: string) => {
  const hash = [...code].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const latOffset = ((hash % 11) - 5) * 0.0042;
  const lngOffset = (((hash * 7) % 11) - 5) * 0.0042;
  return { latOffset, lngOffset };
};

const toRad = (value: number) => (value * Math.PI) / 180;

const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const earth = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return earth * c;
};

export default function NearbyBarbersScreen() {
  const { t } = useTranslation();
  const googleMapRef = useRef<GoogleMaps.ViewType | null>(null);
  const appleMapRef = useRef<AppleMaps.ViewType | null>(null);
  const [search, setSearch] = useState("");
  const [center, setCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(12);
  const [barbersBase, setBarbersBase] = useState<BarberBase[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(null);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;

      const loadBarbers = async () => {
        try {
          const res = await auth.getAdmins();
          const adminList = res?.data || [];

          const mapped = adminList.map((admin) => {
            const known = KNOWN_LOCATIONS[admin.code];
            const { latOffset, lngOffset } = hashToOffset(admin.code);
            const latitude = known?.latitude ?? DEFAULT_CENTER.latitude + latOffset;
            const longitude = known?.longitude ?? DEFAULT_CENTER.longitude + lngOffset;
            return {
              id: admin.id,
              code: admin.code,
              name: admin.name || admin.code,
              logo: admin.logo || null,
              barberLogoUri: admin.barberLogoUri || null,
              latitude,
              longitude,
            };
          });

          if (!mounted) return;
          setBarbersBase(mapped);
          if (mapped.length && !selectedBarberId) setSelectedBarberId(mapped[0].id);
        } catch (error) {
          if (!mounted) return;
          setBarbersBase([]);
        }
      };

      const requestPermissions = async () => {
        try {
          const location = await import("expo-location");
          const { status } = await location.requestForegroundPermissionsAsync();
          if (mounted) setPermissionStatus(status as PermissionStatus);
        } catch {
          if (mounted) setPermissionStatus(null);
        }
      };

      loadBarbers();
      requestPermissions();
      return () => {
        mounted = false;
      };
    }, [selectedBarberId]),
  );

  const barbersWithDistance = useMemo(() => {
    return barbersBase
      .map((b) => ({
        ...b,
        distanceKm: distanceKm(center.latitude, center.longitude, b.latitude, b.longitude),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [barbersBase, center.latitude, center.longitude]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return barbersWithDistance;
    return barbersWithDistance.filter(
      (b) => b.name.toLowerCase().includes(query) || b.code.toLowerCase().includes(query),
    );
  }, [barbersWithDistance, search]);

  const selected = useMemo(
    () => filtered.find((b) => b.id === selectedBarberId) || filtered[0] || null,
    [filtered, selectedBarberId],
  );

  const cameraPosition = useMemo(
    () => ({
      coordinates: {
        latitude: center.latitude,
        longitude: center.longitude,
      },
      zoom,
    }),
    [center.latitude, center.longitude, zoom],
  );

  const googleMarkers = useMemo(
    () =>
      filtered.map((barber) => ({
        id: barber.id,
        coordinates: {
          latitude: barber.latitude,
          longitude: barber.longitude,
        },
        title: barber.name,
        snippet: `${barber.distanceKm.toFixed(1)} km away`,
      })),
    [filtered],
  );

  const appleMarkers = useMemo(
    () =>
      filtered.map((barber) => ({
        id: barber.id,
        coordinates: {
          latitude: barber.latitude,
          longitude: barber.longitude,
        },
        title: barber.name,
        subtitle: `${barber.distanceKm.toFixed(1)} km away`,
        tintColor: selectedBarberId === barber.id ? "#C5A35D" : "#637083",
      })),
    [filtered, selectedBarberId],
  );

  const onSelect = (barber: (typeof filtered)[number]) => {
    setSelectedBarberId(barber.id);
    setCenter({ latitude: barber.latitude, longitude: barber.longitude });
    setZoom(14);

    const next = {
      coordinates: {
        latitude: barber.latitude,
        longitude: barber.longitude,
      },
      zoom: 14,
    };

    if (Platform.OS === "android") {
      googleMapRef.current?.setCameraPosition({
        ...next,
        duration: 450,
      });
      return;
    }

    appleMapRef.current?.setCameraPosition(next);
  };

  const canShowMyLocation = permissionStatus === "granted";

  if (permissionStatus === "denied") {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="location-off" size={48} color="#C5A35D" />
        <Text className="text-center text-[#1A1A1A] font-bold text-lg mt-4">
          Location permission is required to show nearby barbers.
        </Text>
        <Text className="text-center text-gray-500 mt-1">
          Open Settings and allow location access for this app.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <View className="px-5 pt-14 pb-3">
        <Text className="text-2xl font-black text-[#1A1A1A]">{t("tabs.nearby")}</Text>
        <Text className="text-xs mt-1 text-gray-500 font-semibold">
          Find nearby barber shops from map or list
        </Text>
      </View>

      <View className="px-5 pb-3">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-3">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search barber..."
            placeholderTextColor="#9CA3AF"
            className="ml-2 flex-1 text-[#1A1A1A] font-semibold"
          />
        </View>
      </View>

      <View className="mx-5 rounded-3xl overflow-hidden border border-gray-200 h-[42%] bg-white">
        {Platform.OS === "android" ? (
          <GoogleMaps.View
            ref={googleMapRef}
            style={{ flex: 1 }}
            markers={googleMarkers as any}
            cameraPosition={cameraPosition as any}
            onMarkerClick={(marker: any) => {
              if (marker?.id) setSelectedBarberId(marker.id);
            }}
            onCameraMove={(event: any) => {
              if (event?.coordinates) setCenter(event.coordinates);
              if (typeof event?.zoom === "number") setZoom(event.zoom);
            }}
            properties={{
              isMyLocationEnabled: canShowMyLocation,
            }}
          />
        ) : Platform.OS === "ios" ? (
          <AppleMaps.View
            ref={appleMapRef}
            style={{ flex: 1 }}
            markers={appleMarkers as any}
            cameraPosition={cameraPosition as any}
            onMarkerClick={(marker: any) => {
              if (marker?.id) setSelectedBarberId(marker.id);
            }}
            onCameraMove={(event: any) => {
              if (event?.coordinates) setCenter(event.coordinates);
              if (typeof event?.zoom === "number") setZoom(event.zoom);
            }}
            properties={{
              selectionEnabled: true,
            }}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-gray-500 font-semibold">
              Maps are available on iOS and Android only.
            </Text>
          </View>
        )}
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {filtered.map((barber) => {
          const logoUri = resolveLogoUri(barber.logo || barber.barberLogoUri || null);
          const active = selected?.id === barber.id;
          return (
            <TouchableOpacity
              key={barber.id}
              onPress={() => onSelect(barber)}
              className={`bg-white rounded-2xl border p-4 mb-3 flex-row items-center ${
                active ? "border-[#C5A35D]" : "border-gray-200"
              }`}
            >
              <View className="w-12 h-12 rounded-full overflow-hidden bg-[#F3F4F6] items-center justify-center">
                {logoUri ? (
                  <Image source={{ uri: logoUri }} className="w-12 h-12" />
                ) : (
                  <Ionicons name="cut" size={18} color="#6B7280" />
                )}
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-base font-black text-[#1A1A1A]">{barber.name}</Text>
                <Text className="text-xs text-gray-500 font-semibold">
                  {barber.code} • {barber.distanceKm.toFixed(1)} km
                </Text>
              </View>
              <Ionicons
                name={active ? "location" : "location-outline"}
                size={18}
                color={active ? "#C5A35D" : "#9CA3AF"}
              />
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 ? (
          <View className="bg-white rounded-2xl border border-gray-200 p-6">
            <Text className="text-center text-gray-500 font-semibold">No barber found.</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
