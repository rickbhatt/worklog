import DynamicIcon from "@/components/dynamic-icon";
import ScannerFrame from "@/components/qrscanner/scanner-frame";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Portal } from "@rn-primitives/portal";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { toast } from "sonner-native";

interface QrScannerProps {
  value: string | null;
  onScan: (value: string) => void;
}

const QrScanner = ({ value: externalValue, onScan }: QrScannerProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [localValue, setLocalValue] = useState<string | undefined>();

  const value = externalValue ?? localValue;

  const handlePress = async () => {
    if (permission?.granted) {
      setScanned(false);
      setIsScanning(true);
      return;
    }
    if (permission?.canAskAgain) {
      const result = await requestPermission();
      if (result.granted) {
        setScanned(false);
        setIsScanning(true);
      } else {
        toast.info("Please allow camera access to scan QR code");
      }
    } else {
      toast.info("Please allow camera access to scan QR code");
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    console.log("🚀 ~ handleBarcodeScanned ~ data:", data);
    if (scanned) return;

    setScanned(true);
    setLocalValue(data);
    onScan?.(data);
    setIsScanning(false);
  };

  return (
    <>
      <Button onPress={handlePress} variant="outline" className="h-12">
        <Text
          className={cn(
            "base-paragraph text-left flex-1",
            value ? "text-text-primary" : "text-text-primary/60",
          )}
        >
          {value ? value : "Scan QR code"}
        </Text>
      </Button>

      {isScanning && (
        <Portal name="qr-scanner">
          <View className="absolute inset-0 bg-black">
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />
            <ScannerFrame />
            <View className="flex-row absolute top-14 screen-x-padding">
              <Pressable
                onPress={() => setIsScanning(false)}
                className="bg-black/60 h-12 w-12 flex-row items-center justify-center p-2 rounded-full"
              >
                <DynamicIcon
                  family="Ionicons"
                  name="chevron-back"
                  size={24}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          </View>
        </Portal>
      )}
    </>
  );
};

export default QrScanner;
