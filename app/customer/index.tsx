import { StyleSheet, Text, useColorScheme, View } from "react-native";
import React, { useEffect } from "react";
import { Box } from "@/components/ui/box";
import api from "@/lib/api";
import * as SecureStore from "expo-secure-store";

const index = () => {
  useEffect(() => {
    const fetchData = async () => {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      console.log("refresh token :", refreshToken);
      api.get("/").then((res) => {
        console.log(res.data);
      });
    };
    fetchData();
  }, []);
  return (
    <Box className="flex-1 justify-center items-center h-full ">
      <Text>Customer</Text>
    </Box>
  );
};

export default index;

const styles = StyleSheet.create({});
