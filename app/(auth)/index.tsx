import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { CameraView, scanFromURLAsync, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

function extractAdminCode(value: string): string | null {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const direct = raw.match(/^ADM\d{3,}$/i);
  if (direct) return direct[0].toUpperCase();

  const regex = raw.match(/adminCode=([A-Za-z0-9_-]+)/i);
  if (regex?.[1]) return regex[1].toUpperCase();

  try {
    const url = new URL(raw);
    const code =
      url.searchParams.get("adminCode") ||
      url.searchParams.get("code") ||
      url.pathname.split("/").pop();
    if (code && /^ADM\d{3,}$/i.test(code)) {
      return code.toUpperCase();
    }
  } catch {
    return null;
  }

  return null;
}

export default function AuthScannerEntry() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanLocked, setScanLocked] = useState(false);
  const [scanningPhoto, setScanningPhoto] = useState(false);

  const cameraReady = useMemo(
    () => !!permission?.granted,
    [permission?.granted],
  );

  const onDetected = (rawValue: string) => {
    if (scanLocked) return;
    const adminCode = extractAdminCode(rawValue);
    if (!adminCode) return;

    setScanLocked(true);
    router.replace({
      pathname: "/(auth)/register",
      params: { adminCode },
    });
  };

  const scanFromPhoto = async () => {
    try {
      setScanningPhoto(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const uri = result.assets[0].uri;
      const scanned = await scanFromURLAsync(uri, ["qr"]);
      const qrData = scanned?.[0]?.data;
      const adminCode = qrData ? extractAdminCode(qrData) : null;
      if (!adminCode) return;

      setScanLocked(true);
      router.replace({
        pathname: "/(auth)/register",
        params: { adminCode },
      });
    } finally {
      setScanningPhoto(false);
    }
  };

  return (
    <Box className="flex-1 bg-black">
      {cameraReady ? (
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => onDetected(data)}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-base text-center mb-4">
            Camera permission is required to scan barber QR code.
          </Text>
          {!permission ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Button onPress={requestPermission} className="bg-secondary-500 rounded-xl">
              <Text className="text-white font-medium">Enable Camera</Text>
            </Button>
          )}
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="absolute bottom-0 left-0 right-0"
      >
        <View className="mx-4 mb-6 rounded-2xl bg-white p-4">
          <Text className="text-base font-bold mb-2">Scan Barber QR Code</Text>
          <Text className="text-xs text-gray-500 mb-3">
            After scan, barber is auto-selected for registration.
          </Text>

          <Button
            onPress={scanFromPhoto}
            className="bg-secondary-500 rounded-xl mt-1"
            disabled={scanningPhoto}
          >
            {scanningPhoto ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-medium">Pick QR Photo</Text>
            )}
          </Button>

          {scanLocked ? (
            <TouchableOpacity onPress={() => setScanLocked(false)} className="mt-2 self-center">
              <Text className="text-secondary-500">Scan Again</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity onPress={() => router.push("/(auth)/login")} className="mt-4 self-center">
            <Text className="text-secondary-500 font-medium">I already have an account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Box>
  );
}
