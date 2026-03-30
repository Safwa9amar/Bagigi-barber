import { AuthFlow } from "@/components/ui/AuthFlow";
import { useGlobalSearchParams } from "expo-router";

export default function ConfirmCode() {
  const { email } = useGlobalSearchParams<{ email?: string }>();
  return <AuthFlow initialScreen="confirm_code" initialParams={{ email: email || "" }} />;
}
