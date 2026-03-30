import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { useState } from 'react';

/**
 * useProfilePicture
 *
 * Encapsulates the image-pick → validate → upload flow for profile pictures.
 * Accepts only PNG and JPEG files and shows localized alerts on success/error.
 *
 * Returns:
 *   handleEditProfilePicture — async function to trigger the picker
 *   isLoading               — upload-in-progress flag (from auth store)
 *   isPickerLoading         — true from the moment the user taps until the
 *                             picker sheet is fully open (iOS can take ~500ms)
 */
export function useProfilePicture() {
  const { updateProfile, isLoading } = useAuthStore();
  const { t } = useTranslation();
  const [isPickerLoading, setIsPickerLoading] = useState(false);

  const handleEditProfilePicture = async () => {
    // Signal immediately so the UI can show a loading state before iOS
    // finishes opening the photo library (can take ~500 ms).
    setIsPickerLoading(true);

    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
    } finally {
      // Always clear the picker-loading state once the sheet resolves.
      setIsPickerLoading(false);
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];

      // Validate: only PNG and JPEG are accepted.
      const mimeType = selectedImage.mimeType || '';
      const fileName = selectedImage.fileName || selectedImage.uri || '';
      const isValidType =
        mimeType === 'image/jpeg' ||
        mimeType === 'image/png' ||
        fileName.toLowerCase().endsWith('.jpg') ||
        fileName.toLowerCase().endsWith('.jpeg') ||
        fileName.toLowerCase().endsWith('.png');

      if (!isValidType) {
        Alert.alert(
          t('common.error'),
          t('profile.invalidImageType') ||
            'Only PNG and JPEG images are allowed. Please choose a different photo.',
        );
        return;
      }

      const formData = new FormData();
      // @ts-ignore — RN FormData accepts object blobs
      formData.append('image', {
        uri: selectedImage.uri,
        name: selectedImage.fileName || 'profile.jpg',
        type: mimeType || 'image/jpeg',
      });

      try {
        await updateProfile(formData);
        Alert.alert(
          t('common.success'),
          t('profile.imageUpdated') || 'Profile picture updated!',
        );
      } catch {
        Alert.alert(
          t('common.error'),
          t('profile.imageUpdateError') || 'Failed to update profile picture.',
        );
      }
    }
  };

  return { handleEditProfilePicture, isLoading, isPickerLoading };
}
