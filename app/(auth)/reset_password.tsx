import { AuthFlow } from "@/components/ui/AuthFlow";
import { useGlobalSearchParams } from "expo-router";

export default function ResetPassword() {
  const { email } = useGlobalSearchParams<{ email?: string }>();
  return <AuthFlow initialScreen="reset_password" initialParams={{ email: email || "" }} />;
}
