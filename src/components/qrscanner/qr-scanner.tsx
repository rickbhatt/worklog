import QrScannerView from "@/components/qrscanner/qrscanner-view";
import SettingsPermissionAlert from "@/components/qrscanner/settings-permission-alert";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { PressableScale } from "@/components/ui/pressable";
import { useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { ScanLine } from "lucide-react-native";
import React, { useState } from "react";
import { toast } from "sonner-native";

interface QrScannerProps {
  value: string | null;
  /** Called with the scanned (or typed) sheet URL. */
  onScan: (value: string | null) => void;
  placeholder?: string;
}

/**
 * Sheet URL field: type or paste a link, or tap the QR button inside the field
 * to scan one with the camera.
 */
const QrScanner = ({
  value,
  onScan,
  placeholder = "Paste or scan the sheet link",
}: QrScannerProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showSettingsPrompt, setShowSettingsPrompt] = useState(false);

  // handles the button press to open the scanner
  const handlePress = async () => {
    onScan(null);
    if (permission?.granted) {
      setScanned(false);
      setIsScanning(true);
      return;
    }

    const result = await requestPermission();

    if (result.granted) {
      setScanned(false);
      setIsScanning(true);
      return;
    }
    if (result.canAskAgain) {
      toast.info("Please allow camera access to scan QR code");
    } else {
      setShowSettingsPrompt(true);
    }
  };
  const handleScan = (data: string) => {
    if (scanned) return;

    setScanned(true);

    onScan(data);
    setIsScanning(false);
    setScanned(false);
  };

  return (
    <>
      <Input
        value={value ?? ""}
        onChangeText={(text) => onScan(text || null)}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        inputMode="url"
        numberOfLines={1}
        accessibilityLabel="Sheet URL"
        right={
          <PressableScale
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handlePress();
            }}
            accessibilityRole="button"
            accessibilityLabel="Scan QR code"
            className="h-10 w-10 items-center justify-center rounded-[10px] bg-accent-soft"
          >
            <Icon
              as={ScanLine}
              size={18}
              strokeWidth={1.8}
              className="text-accent"
            />
          </PressableScale>
        }
      />
      <QrScannerView
        visible={isScanning}
        onClose={() => setIsScanning(false)}
        onScan={handleScan}
      />
      <SettingsPermissionAlert
        open={showSettingsPrompt}
        onOpenChange={setShowSettingsPrompt}
      />
    </>
  );
};

export default QrScanner;
