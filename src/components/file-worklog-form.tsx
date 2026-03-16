import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { getCurrentDate } from "@/lib/utils";
import React from "react";
import { Text, View } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
  useKeyboardState,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FieldName, FileWorklogFormProps } from "type";

const FileWorklogForm = ({
  value,
  onSubmit,
  onChange,
}: FileWorklogFormProps) => {
  const { bottom } = useSafeAreaInsets();

  const keyboard = useKeyboardState();

  const handleInputChange = (field: FieldName, rawValue: string | number) => {
    if (field === "isSml") {
      let smlValue = Number(rawValue);

      onChange({
        ...value,
        isSml: smlValue,
        lepPages: smlValue === 1 ? 15 : undefined,
        isND: smlValue === 0 ? 0 : value.isND,
      });
    } else if (field === "isND") {
      let ndValue = Number(rawValue);
      onChange({
        ...value,
        isND: ndValue,
        lepPages: ndValue === 1 ? 0 : 15,
      });
    } else {
      onChange({
        ...value,
        [field]: rawValue,
      });
    }
  };

  return (
    <View className="flex-1">
      <KeyboardAwareScrollView
        bottomOffset={bottom}
        className="screen-x-padding"
        contentContainerClassName="flex-col gap-5"
        contentContainerStyle={{
          paddingBottom: keyboard.isVisible ? 0 : bottom,
        }}
      >
        <FormInput
          label="Journal ID"
          autoCapitalize="words"
          name="journalId"
          maxLength={4}
          // autoFocus={true}
          placeholder="NPP2, MDR2,..."
          value={value.journalId}
          onChange={handleInputChange}
        />
        <FormInput
          label="Journal ID"
          autoCapitalize="words"
          name="journalId"
          maxLength={4}
          // autoFocus={true}
          placeholder="NPP2, MDR2,..."
          value={value.journalId}
          onChange={handleInputChange}
        />
        <FormInput
          label="Journal ID"
          autoCapitalize="words"
          name="journalId"
          maxLength={4}
          // autoFocus={true}
          placeholder="NPP2, MDR2,..."
          value={value.journalId}
          onChange={handleInputChange}
        />
        <FormInput
          label="Article ID"
          name="articleId"
          inputMode="numeric"
          maxLength={5}
          placeholder="2345"
          value={value.articleId}
          onChange={handleInputChange}
        />

        <FormInput
          inputType="checkbox"
          label="SML file?"
          name="isSml"
          value={value.isSml}
          onChange={handleInputChange}
        />

        {value.isSml === 1 && (
          <FormInput
            inputType="checkbox"
            label="ND file?"
            name="isND"
            value={value.isND}
            onChange={handleInputChange}
          />
        )}

        <FormInput
          label="LEP Pages"
          value={value.lepPages}
          inputMode="numeric"
          maxLength={3}
          placeholder="63"
          editable={value.isSml === 0}
          name="lepPages"
          onChange={handleInputChange}
        />

        <FormInput
          label="Time taken (minutes)"
          name="timeTaken"
          inputMode="numeric"
          maxLength={3}
          value={value.timeTaken}
          placeholder="60"
          onChange={handleInputChange}
        />
        <FormInput
          inputType="checkbox"
          label="OT file?"
          name="isOT"
          value={value.isOT}
          onChange={handleInputChange}
        />
        <FormInput
          label="Worked At"
          name="workedAt"
          placeholder={"YYYY-MM-DD"}
          value={value.workedAt}
          onChange={handleInputChange}
          inputType="date"
          maxDate={new Date(getCurrentDate())}
        />
        <FormInput
          label="Remarks"
          name="remarks"
          inputType="textarea"
          placeholder="Type your remarks here..."
          value={value.remarks}
          onChange={handleInputChange}
        />
      </KeyboardAwareScrollView>
      <KeyboardStickyView
        className="py-2.5 bg-bg-primary flex-row items-center"
        offset={{ closed: -bottom, opened: 0 }}
      >
        <Button className="py-3 w-full" onPress={() => onSubmit(value)}>
          <Text className="text-text-primary font-bold text-base">Save</Text>
        </Button>
      </KeyboardStickyView>
    </View>
  );
};

export default FileWorklogForm;
