import { StyleSheet, View } from "react-native";
import React from "react";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

const clients = () => {
  return (
    <View className="bg-background-light dark:bg-background-dark p-10">
      <Text className="text-typography-900">BarberOne</Text>

      <Button className="bg-secondary-500 px-4 py-2 rounded-md mt-4">
        <Text className="text-white">Book Now</Text>
      </Button>

      <Text className="text-secondary-500">Premium Service</Text>
    </View>
  );
};

export default clients;

const styles = StyleSheet.create({});
