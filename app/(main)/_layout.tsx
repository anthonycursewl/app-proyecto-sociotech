import { Stack } from "expo-router";
import { useRouteGuard } from "@/shared/permissions/useRouteGuard";

export default function MainLayout() {
  useRouteGuard();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="access-denied" />
      <Stack.Screen name="home" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="services" />
      <Stack.Screen name="patients" />
      <Stack.Screen name="appointments" />
      <Stack.Screen name="appointments/create" />
      <Stack.Screen name="appointments/[id]" />
      <Stack.Screen name="records" />
      <Stack.Screen name="records/[id]" />
      <Stack.Screen name="audit" />
      <Stack.Screen name="audit/[id]" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="settings/notifications" />
      <Stack.Screen name="settings/security" />
      <Stack.Screen name="settings/appearance" />
      <Stack.Screen name="settings/language" />
      <Stack.Screen name="settings/help" />
      <Stack.Screen name="settings/about" />
      <Stack.Screen name="admin/appointments" />
      <Stack.Screen name="admin/records" />
      <Stack.Screen name="admin/records/create" />
      <Stack.Screen name="admin/records/[id]" />
      <Stack.Screen name="admin/records/me" />
      <Stack.Screen name="admin/patients/[id]" />
      <Stack.Screen name="admin/doctors/index" />
      <Stack.Screen name="doctors" />
      <Stack.Screen name="doctor/profile" />
      <Stack.Screen name="doctor/[id]" />
      <Stack.Screen name="doctor/edit-profile" />
      <Stack.Screen name="patient/edit" />
      <Stack.Screen name="roles" />
      <Stack.Screen name="users" />
    </Stack>
  );
}