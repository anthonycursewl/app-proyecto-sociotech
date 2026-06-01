import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/common/SText";
import * as LucideIcons from "lucide-react-native";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[AppErrorBoundary]", error.message, info.componentStack);
  }

  private handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <LucideIcons.AlertTriangle size={48} color="#EF4444" strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.message}>
            La aplicación encontró un error inesperado. Por favor, reinicia la app.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.debug}>{this.state.error.message}</Text>
          )}
          <View style={styles.button} onTouchEnd={this.handleRestart}>
            <LucideIcons.RefreshCw size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.buttonText}>Reiniciar</Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  debug: {
    fontSize: 11,
    color: "#94A3B8",
    fontFamily: "monospace",
    textAlign: "center",
    marginBottom: 24,
    padding: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    overflow: "hidden",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4CB1B1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
