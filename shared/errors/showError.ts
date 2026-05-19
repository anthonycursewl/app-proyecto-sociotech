import { Alert } from "react-native";
import { getApiErrorMessage } from "./apiError";

export function showErrorAlert(error: unknown, title = "Error") {
  Alert.alert(title, getApiErrorMessage(error));
}
