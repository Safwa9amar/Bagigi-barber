import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  Pressable,
  TextInput,
  TextInputChangeEvent,
  TextInputProps,
} from "react-native";
import { Box } from "./box";
import { Text } from "./text";

/**
 * Icon name type from Ionicons
 */
type IoniconName = ComponentProps<typeof Ionicons>["name"];

interface InputFieldProps extends TextInputProps {
  icon: IoniconName;
  error?: string;
  secure?: boolean;
  toggleSecure?: () => void;
}

const InputField = ({
  icon,
  error,
  secure,
  toggleSecure,
  onChange,
  ...props
}: InputFieldProps) => (
  <Box className="mb-4">
    <Box className="flex-row items-center border border-secondary-500  rounded-xl px-4">
      <Ionicons name={icon} size={20} color="#9ca3af" />

      <TextInput
        {...props}
        secureTextEntry={secure}
        onChangeText={onChange as any}
        className="flex-1 p-3 ml-2 text-typography-900 dark:text-typography-50"
        placeholderTextColor="#9ca3af"
      />

      {toggleSecure && (
        <Pressable onPress={toggleSecure} hitSlop={10}>
          <Ionicons
            name={secure ? "eye-off" : "eye"}
            size={20}
            color="#9ca3af"
          />
        </Pressable>
      )}
    </Box>

    {error && <Text className="text-xs text-red-500 mt-1 ml-1">{error}</Text>}
  </Box>
);

export default InputField;
