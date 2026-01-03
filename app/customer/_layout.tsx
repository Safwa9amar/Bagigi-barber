import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { Slot } from "expo-router";
import { withRoleGuard } from "@/components/auth/withRoleGuard";

const CustomerLayout = () => {
  useEffect(() => {
    console.log("Customer layout mounted");
  }, []);
  return <Slot />;
};

export default withRoleGuard(CustomerLayout, "USER");
