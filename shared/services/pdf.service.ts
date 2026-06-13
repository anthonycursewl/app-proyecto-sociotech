import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { HttpClient } from "@/shared/http/http.client";
import { Alert } from "react-native";

function getBaseUrl() {
  const url = __DEV__
    ? process.env.EXPO_PUBLIC_API_URL_DEV
    : process.env.EXPO_PUBLIC_API_URL_PROD;
  return url?.replace(/\/api$/, "") ?? "";
}

async function downloadAndShare(path: string, filename: string) {
  const token = await HttpClient.getAccessToken();
  if (!token) {
    Alert.alert("Error", "Debes iniciar sesión para descargar documentos");
    return;
  }

  try {
    const url = `${getBaseUrl()}${path}`;
    const destination = new File(Paths.cache, filename);
    const file = await File.downloadFileAsync(url, destination, {
      headers: { Authorization: `Bearer ${token}` },
      idempotent: true,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/pdf",
        dialogTitle: filename,
      });
    } else {
      Alert.alert("Descargado", `Archivo guardado en: ${file.uri}`);
    }
  } catch (err: any) {
    const msg =
      err?.message?.includes("404")
        ? "Documento no encontrado"
        : err?.message?.includes("403")
          ? "No tienes permiso para descargar este documento"
          : err?.message || "Error al descargar el documento";
    Alert.alert("Error", msg);
  }
}

export const pdfService = {
  downloadPrescription: (medicalRecordId: string) =>
    downloadAndShare(
      `/pdf/prescriptions/${medicalRecordId}`,
      `receta-${medicalRecordId.slice(0, 8)}.pdf`,
    ),

  downloadClinicalHistory: (patientId: string) =>
    downloadAndShare(
      `/pdf/clinical-history/${patientId}`,
      `historial-${patientId.slice(0, 8)}.pdf`,
    ),

  downloadAppointment: (appointmentId: string) =>
    downloadAndShare(
      `/pdf/appointments/${appointmentId}`,
      `cita-${appointmentId.slice(0, 8)}.pdf`,
    ),
};
