import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { useSheetBottomPadding, useSheetStyles } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { createTargetInfo } from "@/db/mutations/fileworklog.mutations";
import { useDb } from "@/hooks/useDb";
import { validateForm } from "@/lib/utils";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { RefObject, useState } from "react";
import { Text as RNText, View } from "react-native";
import { toast } from "sonner-native";
import { TargetInfoCreateType } from "type";

const TargetAndHourForm = ({
  ref,
}: {
  ref: RefObject<BottomSheetModal | null>;
}) => {
  const [formData, setFormData] = useState<Partial<TargetInfoCreateType>>({
    targetLepPages: undefined,
    pagesPerHour: undefined,
  });

  const db = useDb();

  const sheetStyles = useSheetStyles();

  const bottomPadding = useSheetBottomPadding();

  const handleOnChange = (fieldName: string, rawValue: number | string) => {
    setFormData({
      ...formData,
      [fieldName]: rawValue,
    });
  };

  const handleOnSubmit = async () => {
    const requiredFields = [
      { key: "targetLepPages", message: "Please enter target LEP pages" },
      { key: "pagesPerHour", message: "Please enter pages per hour" },
    ] as const;

    const missingField = validateForm(formData, requiredFields);

    if (missingField) {
      toast.error(missingField.message);
      return;
    }

    const payload: TargetInfoCreateType = {
      targetLepPages: formData.targetLepPages!,
      pagesPerHour: formData.pagesPerHour!,
    };

    try {
      await createTargetInfo(db, payload);
      toast.success("Target and hour created successfully");
      ref?.current?.close();
    } catch (error) {
      console.error("Failed to create target and hour", error);
      toast.error("Failed to create target and hour");
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      name="new-target"
      {...sheetStyles}
      enableDynamicSizing
    >
      <BottomSheetView
        className="gap-5 px-5 pt-2"
        style={{ paddingBottom: bottomPadding }}
      >
        <View className="gap-1">
          <RNText className="title-pushed text-[22px]">New target</RNText>
          <RNText className="caption">
            Applies from today and replaces the active target.
          </RNText>
        </View>

        <View className="flex-row gap-3">
          <FormInput
            label="LEP pages / day"
            name="targetLepPages"
            onChange={handleOnChange}
            maxLength={2}
            placeholder="63"
            inputMode="numeric"
            autoFocus
            value={formData.targetLepPages}
            numeric
            rowMode
          />
          <FormInput
            label="Pages / hour"
            name="pagesPerHour"
            onChange={handleOnChange}
            maxLength={2}
            placeholder="9"
            inputMode="numeric"
            value={formData.pagesPerHour}
            numeric
            rowMode
          />
        </View>

        <Button onPress={handleOnSubmit}>
          <Text>Save target</Text>
        </Button>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default TargetAndHourForm;
