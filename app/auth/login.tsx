import React from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { TextInput } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

type LoginForm = yup.InferType<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: LoginForm) => {
    // Add authentication logic here
    console.log(data);
  };

  return (
    <Box className="flex-1 justify-center items-center bg-background-300 px-6">
      <Box className="w-full max-w-md p-8 rounded-lg bg-background-0/80 shadow-lg">
        <Text className="text-2xl font-bold mb-6 text-center">Login</Text>
        <Box className="mb-4">
          <Text className="mb-2 font-medium">Email</Text>
          <TextInput
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-background-100 px-4 py-2 rounded"
            onChangeText={(text) => setValue("email", text)}
            {...register("email")}
          />
          {errors.email && (
            <Text className="text-red-500 mt-1">{errors.email.message}</Text>
          )}
        </Box>
        <Box className="mb-6">
          <Text className="mb-2 font-medium">Password</Text>
          <TextInput
            placeholder="Enter your password"
            secureTextEntry
            className="bg-background-100 px-4 py-2 rounded"
            onChangeText={(text) => setValue("password", text)}
            {...register("password")}
          />
          {errors.password && (
            <Text className="text-red-500 mt-1">{errors.password.message}</Text>
          )}
        </Box>
        <Button
          className="bg-primary-500 py-3 rounded-full"
          onPress={handleSubmit(onSubmit)}
        >
          <ButtonText>Login</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
