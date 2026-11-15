import { Icon } from "@/components/ui/icon";
import { PressableScale } from "@/components/ui/pressable";
import { Portal } from "@rn-primitives/portal";
import { CameraView } from "expo-camera";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import ScannerFrame from "./scanner-frame";

interface QrScannerViewProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

const QrScannerView = ({ visible, onClose, onScan }: QrScannerViewProps) => {
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false); // fresh scan session every time it opens
    }
  }, [visible]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
  };
  if (!visible) return null;

  return (
    <Portal name="qr-scanner">
      <View className="absolute inset-0 bg-background">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
        <ScannerFrame />
        <View className="flex-row absolute top-14 px-5">
          <PressableScale
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close scanner"
            className="h-11 w-11 items-center justify-center rounded-[14px] border border-line bg-surface"
          >
            <Icon
              as={ChevronLeft}
              size={20}
              strokeWidth={2}
              className="text-foreground"
            />
          </PressableScale>
        </View>
      </View>
    </Portal>
  );
};

export default QrScannerView;
