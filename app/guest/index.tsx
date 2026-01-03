import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Box } from "@/components/ui/box";
import { TouchableOpacity } from "react-native";

const index = () => {
  const { user, logout } = useAuthStore();
  return (
    <Box className="flex-1 bg-white dark:bg-black justify-center items-center">
      <Text> {user?.email}</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </Box>
  );
};

export default index;

const styles = StyleSheet.create({});
