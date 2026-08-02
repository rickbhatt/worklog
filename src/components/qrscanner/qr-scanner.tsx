import QrScannerView from "@/components/qrscanner/qrscanner-view";
import SettingsPermissionAlert from "@/components/qrscanner/settings-permission-alert";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import { Text } from "react-native";
import { toast } from "sonner-native";

interface QrScannerProps {
  value: string | null;
  onScan: (value: string | null) => void;
}

const QrScanner = ({ value, onScan }: QrScannerProps) => {
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
      <Button onPress={handlePress} variant="outline" className="h-12">
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          className={cn(
            "base-paragraph text-left flex-1",
            value ? "text-text-primary" : "text-text-primary/60",
          )}
        >
          {value ? value : "Tap to scan QR code"}
        </Text>
      </Button>
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
