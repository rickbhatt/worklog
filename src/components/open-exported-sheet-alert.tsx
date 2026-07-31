import AlertDialogBox from "@/components/alert-dialogbox";
import React from "react";
import { Linking } from "react-native";

const OpenExportSheetUrl = ({
  open,
  onDismiss,
  url,
}: {
  open: boolean;
  onDismiss: () => void;
  url: string | null;
}) => {
  const handleOpenSheetUrl = () => {
    if (!url) return;
    Linking.openURL(url);
  };

  return (
    <AlertDialogBox
      open={open}
      onOpenChange={onDismiss}
      title="Data Exported"
      description="Exported data can be found here."
      cancelText="Cancel"
      actionText="Open Link"
      onAction={handleOpenSheetUrl}
    />
  );
};

export default OpenExportSheetUrl;
