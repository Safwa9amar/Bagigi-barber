import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { TextInput } from "react-native";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSuccess("Registration successful! You can now log in.");
      setTimeout(() => router.replace("/auth/login"), 1500);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Box className="flex-1 justify-center items-center bg-background-300 px-6">
      <Box className="w-full max-w-md p-8 rounded-lg bg-background-0/80 shadow-lg">
        <Text className="text-2xl font-bold mb-6 text-center">Register</Text>
        {error ? (
          <Text className="text-red-500 mb-2 text-center">{error}</Text>
        ) : null}
        {success ? (
          <Text className="text-green-500 mb-2 text-center">{success}</Text>
        ) : null}
        <Box className="mb-4">
          <Text className="mb-2 font-medium">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-background-100 px-4 py-2 rounded"
          />
        </Box>
        <Box className="mb-6">
          <Text className="mb-2 font-medium">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            className="bg-background-100 px-4 py-2 rounded"
          />
        </Box>
        <Button
          className="bg-primary-500 py-3 rounded-full"
          onPress={handleRegister}
        >
          <ButtonText>Register</ButtonText>
        </Button>
        <Button
          className="mt-4"
          variant="link"
          onPress={() => router.push("/auth/login")}
        >
          <ButtonText>Already have an account? Login</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
