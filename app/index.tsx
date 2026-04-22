import { Redirect } from "expo-router";

export default function Index() {
  // In a real app, you would check auth state here
  // For now, we redirect to the login screen
  return <Redirect href="/(auth)/login" />;
}
