import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";
import { ToggleChip } from "@/components/ui/toggle-chip";
import { getCurrentDate } from "@/lib/utils";
import React from "react";
import { Text as RNText, View } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
  useKeyboardState,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FieldName, FileWorklogFormProps } from "type";

const FILE_TYPES = [
  { label: "MNL", value: "0" },
  { label: "SML", value: "1" },
] as const;

const FileWorklogForm = ({
  value,
  onSubmit,
  onChange,
}: FileWorklogFormProps) => {
  const { bottom } = useSafeAreaInsets();

  const keyboard = useKeyboardState();

  const handleInputChange = (field: FieldName, rawValue: string | number) => {
    if (field === "isSml") {
      const smlValue = Number(rawValue);

      onChange((prev) => ({
        ...prev,
        isSml: smlValue,
        lepPages: smlValue === 1 ? 15 : undefined,
        isND: smlValue === 0 ? 0 : prev.isND,
      }));
    } else if (field === "isND") {
      const ndValue = Number(rawValue);
      onChange((prev) => ({
        ...prev,
        isND: ndValue,
        lepPages: ndValue === 1 ? 0 : 15,
        timeTaken: ndValue === 1 ? 0 : prev.timeTaken,
      }));
    } else if (field === "isQcFile") {
      const qcValue = Number(rawValue);
      onChange((prev) => ({
        ...prev,
        isQcFile: qcValue,
        remarks: qcValue === 1 ? "QC" : "",
      }));
    } else {
      onChange((prev) => ({
        ...prev,
        [field]: rawValue,
      }));
    }
  };

  const toggle = (field: FieldName, current: number | null | undefined) =>
    handleInputChange(field, current === 1 ? 0 : 1);

  // "Mark as" chips (they replace the old checkboxes). ND only applies to SML.
  const markAs: { field: FieldName; label: string; value?: number | null }[] = [
    ...(value.isSml === 1
      ? [{ field: "isND" as FieldName, label: "ND file", value: value.isND }]
      : []),
    { field: "isOT", label: "OT file", value: value.isOT },
    { field: "isQcFile", label: "QC file", value: value.isQcFile },
    {
      field: "isCompensatedFile",
      label: "Compensatory",
      value: value.isCompensatedFile,
    },
  ];

  return (
    <View className="flex-1">
      <KeyboardAwareScrollView
        bottomOffset={bottom + 88}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="flex-col gap-[22px] px-5 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: keyboard.isVisible ? 16 : 24,
        }}
      >
        <View className="flex-row gap-3">
          <FormInput
            label="Journal ID"
            autoCapitalize="characters"
            name="journalId"
            maxLength={4}
            autoFocus={true}
            placeholder="NPP2, MDR2…"
            value={value.journalId}
            onChange={handleInputChange}
            rowMode
          />
          <FormInput
            label="Article ID"
            name="articleId"
            inputMode="numeric"
            maxLength={5}
            placeholder="2345"
            value={value.articleId}
            onChange={handleInputChange}
            rowMode
          />
        </View>

        <View className="form-group">
          <RNText className="form-label">File type</RNText>
          <SegmentedControl
            options={FILE_TYPES}
            value={value.isSml === 1 ? "1" : value.isSml === 0 ? "0" : undefined}
            onChange={(v) => handleInputChange("isSml", v)}
          />
        </View>

        <View className="flex-row gap-3">
          <FormInput
            label="LEP pages"
            value={value.lepPages}
            inputMode="numeric"
            maxLength={3}
            placeholder="63"
            editable={value.isSml !== 1}
            name="lepPages"
            onChange={handleInputChange}
            suffix="pages"
            numeric
            rowMode
          />
          <FormInput
            label="Time taken"
            name="timeTaken"
            inputMode="numeric"
            timePreview
            maxLength={3}
            editable={value.isND !== 1}
            value={value.timeTaken}
            placeholder="60"
            onChange={handleInputChange}
            suffix="min"
            numeric
            rowMode
          />
        </View>

        <View className="form-group">
          <RNText className="form-label">Mark as</RNText>
          <View className="flex-row flex-wrap gap-2">
            {markAs.map((chip) => (
              <ToggleChip
                key={chip.field}
                label={chip.label}
                selected={chip.value === 1}
                onToggle={() => toggle(chip.field, chip.value)}
              />
            ))}
          </View>
        </View>

        <FormInput
          label="Worked on"
          name="workedAt"
          placeholder="Select a date"
          value={value.workedAt}
          onChange={handleInputChange}
          inputType="date"
          maxDate={new Date(getCurrentDate())}
        />
        <FormInput
          label="Remarks"
          name="remarks"
          inputType="textarea"
          placeholder="Anything worth remembering about this file…"
          value={value.remarks}
          onChange={handleInputChange}
        />
      </KeyboardAwareScrollView>
      <KeyboardStickyView
        className="bg-background px-5 pt-4"
        style={{ paddingBottom: keyboard.isVisible ? 12 : Math.max(bottom, 16) }}
      >
        <Button className="w-full" onPress={() => onSubmit(value)}>
          <Text>Save log</Text>
        </Button>
      </KeyboardStickyView>
    </View>
  );
};

export default FileWorklogForm;
