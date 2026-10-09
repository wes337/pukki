import { useEffect, useRef, useState } from "react";
import { Alert, BackHandler, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import * as ExpoLinking from "expo-linking";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { colors, siteOrigin } from "./src/config.json";
import { invitationUrl, isExternalUrl, isSiteUrl } from "./src/navigation";
import { Loading } from "./src/Loading";

export default function App() {
  const webview = useRef<WebView>(null);
  const canGoBack = useRef(false);
  const currentUrl = useRef(siteOrigin);
  const [source, setSource] = useState<{ uri: string } | null>(null);
  const [webviewKey, setWebviewKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [fontsLoaded] = useFonts({ AmoreChristmas: require("../frontend/public/fonts/AmoreChristmas.otf") });

  useEffect(() => {
    let active = true;
    let receivedLink = false;
    const subscription = ExpoLinking.addEventListener("url", ({ url }) => {
      const target = invitationUrl(url);
      if (!target) return;
      receivedLink = true;
      setSource({ uri: target });
    });
    void ExpoLinking.getInitialURL().then((url) => {
      if (active && !receivedLink) setSource({ uri: (url && invitationUrl(url)) || siteOrigin });
    }).catch(() => {
      if (active && !receivedLink) setSource({ uri: siteOrigin });
    });
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!canGoBack.current) return false;
      webview.current?.goBack();
      return true;
    });
    return () => subscription.remove();
  }, []);

  function openExternal(url: string) {
    if (!isExternalUrl(url)) return;
    void Linking.openURL(url).catch(() => Alert.alert("Couldn't open this link."));
  }

  function showError() {
    setFailed(true);
    setLoading(false);
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.screen}>
        {source && <WebView
          key={webviewKey}
          ref={webview}
          source={source}
          style={styles.screen}
          originWhitelist={["*"]}
          onShouldStartLoadWithRequest={(request) => {
            if (isSiteUrl(request.url)) return true;
            if (request.isTopFrame !== false) openExternal(request.url);
            return false;
          }}
          onOpenWindow={({ nativeEvent: { targetUrl } }) => {
            if (isSiteUrl(targetUrl)) setSource({ uri: targetUrl });
            else openExternal(targetUrl);
          }}
          onNavigationStateChange={(navigation) => {
            canGoBack.current = navigation.canGoBack;
            if (isSiteUrl(navigation.url)) currentUrl.current = navigation.url;
          }}
          onLoadStart={({ nativeEvent }) => {
            if (isSiteUrl(nativeEvent.url)) currentUrl.current = nativeEvent.url;
            setLoading(true);
            setFailed(false);
          }}
          onLoadEnd={() => setLoading(false)}
          onError={showError}
          onHttpError={({ nativeEvent }) => {
            if (nativeEvent.statusCode >= 400 && nativeEvent.url === currentUrl.current) showError();
          }}
          onContentProcessDidTerminate={showError}
          onRenderProcessGone={showError}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          domStorageEnabled
          incognito={false}
          mixedContentMode="never"
          allowFileAccess={false}
          allowsBackForwardNavigationGestures
          contentInsetAdjustmentBehavior="never"
        />}
        {(loading || failed) && <View style={styles.overlay}>
          {failed ? <View style={styles.error}>
            <Text accessibilityRole="header" style={[styles.title, fontsLoaded && styles.headingFont]}>Couldn't load Pukki.</Text>
            <Text style={styles.message}>Check your connection and try again.</Text>
            <Pressable accessibilityRole="button" style={styles.retry} onPress={() => {
              setFailed(false);
              setLoading(true);
              canGoBack.current = false;
              setSource({ uri: currentUrl.current });
              // Recreate the view so Retry also recovers a terminated native renderer.
              setWebviewKey((key) => key + 1);
            }}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View> : <Loading />}
        </View>}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  overlay: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24 },
  error: { alignItems: "center", gap: 16, maxWidth: 340, width: "100%" },
  title: { color: colors.red, fontSize: 30, textAlign: "center", textShadowColor: colors.redShadow, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 0 },
  headingFont: { fontFamily: "AmoreChristmas" },
  message: { color: colors.text, fontSize: 16, textAlign: "center" },
  retry: { backgroundColor: colors.red, borderColor: colors.redBorder, borderWidth: 1, borderRadius: 6, minHeight: 46, alignSelf: "stretch", justifyContent: "center", alignItems: "center" },
  retryText: { color: colors.white, fontSize: 18, fontWeight: "700", textShadowColor: colors.redShadow, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 0 },
});
