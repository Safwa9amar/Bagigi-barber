import { AuthFlow } from "@/components/ui/AuthFlow";
import { useGlobalSearchParams } from "expo-router";

export default function ForgotPassword() {
  const { email } = useGlobalSearchParams<{ email?: string }>();
  return <AuthFlow initialScreen="forgot_password" initialParams={{ email: email || "" }} />;
}
