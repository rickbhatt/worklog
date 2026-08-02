import AlertDialogBox from "@/components/alert-dialogbox";
import React from "react";
import { Linking } from "react-native";

const SettingsPermissionAlert = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const handleOnOpenSettings = () => {
    onOpenChange(false);
    Linking.openSettings();
  };

  return (
    <AlertDialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Camera access needed"
      description="Camera permission is blocked. Enable it in Settings to scan QR codes."
      cancelText="Cancel"
      actionText="Open Settings"
      onAction={handleOnOpenSettings}
    />
  );
};

export default SettingsPermissionAlert;
