import DynamicIcon from "@/components/dynamic-icon";
import { Portal } from "@rn-primitives/portal";
import { CameraView } from "expo-camera";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
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
            onPress={onClose}
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
  );
};

export default QrScannerView;
