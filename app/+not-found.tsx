import React from "react";
import { Link, Stack, useRouter, useSegments } from "expo-router";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";

export default function NotFoundScreen() {
  const navigation = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <Center className="flex-1">
        <Text className="text-secondary-200">This screen doesn't exist.</Text>
        <Link href={"/(auth)"}>
          <Text>login</Text>
        </Link>
      </Center>
    </>
  );
}
