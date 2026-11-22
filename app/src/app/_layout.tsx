import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Fredoka_500Medium } from "@expo-google-fonts/fredoka/500Medium";
import { NunitoSans_400Regular } from "@expo-google-fonts/nunito-sans/400Regular";
import { NunitoSans_600SemiBold } from "@expo-google-fonts/nunito-sans/600SemiBold";
import { NunitoSans_800ExtraBold } from "@expo-google-fonts/nunito-sans/800ExtraBold";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StoreProvider } from "../data/store";
import { Loading } from "../components/ui";
import { AuthProvider } from "../auth/session";
export default function Layout() {
  const [loaded, error] = useFonts({
    Fredoka_500Medium,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_800ExtraBold,
  });
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {!loaded && !error ? (
        <Loading />
      ) : (
        <AuthProvider>
          <StoreProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#FFF9F1" },
                animation: "fade",
                title: "Mi amigo invisible",
              }}
            />
          </StoreProvider>
        </AuthProvider>
      )}
    </SafeAreaProvider>
  );
}
