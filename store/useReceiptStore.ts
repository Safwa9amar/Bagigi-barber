import { create } from "zustand";
import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";
import { auth } from "@/lib/api";

interface ReceiptState {
  receiptUri: string | null;
  isUploadingReceipt: boolean;
  setReceiptUri: (uri: string | null) => void;
  pickAndUploadReceipt: () => Promise<void>;
}

export const useReceiptStore = create<ReceiptState>((set, get) => ({
  receiptUri: null,
  isUploadingReceipt: false,

  setReceiptUri: (uri) => set({ receiptUri: uri }),

  pickAndUploadReceipt: async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission",
          "Media permission is required to upload payment receipt."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const pickedUri = result.assets[0].uri;
      set({ receiptUri: pickedUri });

      const fileName = pickedUri.split("/").pop() || `receipt-${Date.now()}.jpg`;
      const extension = fileName.split(".").pop()?.toLowerCase();
      const mimeType = extension
        ? `image/${extension === "jpg" ? "jpeg" : extension}`
        : "image/jpeg";

      const formData = new FormData();
      formData.append("receipt", {
        uri: Platform.OS === "ios" ? pickedUri.replace("file://", "") : pickedUri,
        type: mimeType,
        name: fileName,
      } as any);
      formData.append("note", "Trial ended payment receipt");

      set({ isUploadingReceipt: true });
      await auth.uploadPaymentReceipt(formData);
      Alert.alert("Success", "Receipt uploaded and sent successfully.");
    } catch (error: any) {
      console.error("Receipt upload failed:", error);
      const message =
        error?.response?.data?.error || "Failed to upload payment receipt";
      Alert.alert("Error", message);
    } finally {
      set({ isUploadingReceipt: false });
    }
  },
}));
