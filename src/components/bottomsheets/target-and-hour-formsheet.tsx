import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { createTargetInfo } from "@/db/mutations/fileworklog.mutations";
import { useDb } from "@/hooks/useDb";
import { validateForm } from "@/lib/utils";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { RefObject, useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";
import { TargetInfoCreateType } from "type";

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.6}
  />
);

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
      backdropComponent={renderBackdrop}
      snapPoints={["90%"]}
      enableDynamicSizing={false}
      handleIndicatorStyle={{
        backgroundColor: "#FFFFFF",
        width: 40,
      }}
      backgroundStyle={{ backgroundColor: "#242424" }}
    >
      <BottomSheetView className="screen-x-padding pt-5">
        {/* form */}
        <View className="flex-col flex-1 gap-y-3">
          <FormInput
            label="Target LEP pages"
            name="targetLepPages"
            onChange={handleOnChange}
            maxLength={2}
            placeholder="63"
            inputMode="numeric"
            autoFocus
            value={formData.targetLepPages}
          />
          <FormInput
            label="Pages per hour"
            name="pagesPerHour"
            onChange={handleOnChange}
            maxLength={2}
            placeholder="9"
            inputMode="numeric"
            value={formData.pagesPerHour}
          />

          <Button onPress={handleOnSubmit} className="py-3 w-full">
            <Text className="btn-label">Save</Text>
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default TargetAndHourForm;
