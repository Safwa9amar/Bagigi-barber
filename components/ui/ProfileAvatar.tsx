import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Config from '@/constants/Config';
import { useProfilePicture } from '@/hooks/useProfilePicture';

interface ProfileAvatarProps {
  /** User's image path or full URL. */
  image?: string | null;
  /** Displayed name used to generate the fallback initials avatar. */
  name?: string | null;
  /** Email used as a secondary fallback for the initials avatar. */
  email?: string | null;
  /** Avatar diameter in logical pixels. Defaults to 96 (w-24 h-24). */
  size?: number;
}

/**
 * ProfileAvatar
 *
 * Self-contained avatar component that:
 *  - Resolves the correct image URI (absolute URL, relative API path, or generated initials).
 *  - The whole image AND the camera badge both open the picker.
 *  - Shows an overlay spinner on the image immediately when the picker is
 *    triggered (iOS takes ~500 ms before the sheet appears).
 *  - Shows a smaller spinner on the camera badge while the upload is in progress.
 */
export function ProfileAvatar({
  image,
  name,
  email,
  size = 96,
}: ProfileAvatarProps) {
  const { handleEditProfilePicture, isLoading, isPickerLoading } = useProfilePicture();

  const displayName = name || email?.split('@')[0] || 'User';

  const imageUri = image
    ? image.startsWith('http')
      ? image
      : Config.apiUrl + image
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=C5A35D&color=fff`;

  const badgeSize = Math.round(size * 0.33);
  const isBusy = isPickerLoading || isLoading;

  return (
    <View style={{ width: size, height: size }}>
      {/* Entire avatar is tappable */}
      <TouchableOpacity
        onPress={handleEditProfilePicture}
        disabled={isBusy}
        activeOpacity={0.8}
        style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}
      >
        <Image
          source={{ uri: imageUri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 4,
            borderColor: 'white',
          }}
        />

        {/* Overlay spinner while picker is opening (iOS latency) */}
        {isPickerLoading && (
          <View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: 'rgba(0,0,0,0.35)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {/* Camera badge — also tappable, shows upload spinner */}
      <TouchableOpacity
        onPress={handleEditProfilePicture}
        disabled={isBusy}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
          backgroundColor: '#C5A35D',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: 'white',
        }}
      >
        {isLoading ? (
          <ActivityIndicator size={Math.round(badgeSize * 0.5)} color="#fff" />
        ) : (
          <Ionicons name="camera" size={Math.round(badgeSize * 0.55)} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}
