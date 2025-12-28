import FileWorklogForm from "@/components/file-worklog-form";
import ScreenHeader from "@/components/screen-header";
import { createFileLog } from "@/db/mutations/fileworklog.mutations";
import { useDb } from "@/hooks/useDb";
import { Tabs } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { toast } from "sonner-native";
import { FileLogsCreateInput, FileLogsInsertType } from "type";

const CreateWorkLog = () => {
  const [formData, setFormData] = useState<Partial<FileLogsCreateInput>>({
    journalId: undefined,
    articleId: undefined,
    lepPages: undefined,
    timeTaken: undefined,
    workedAt: undefined,
  });

  const db = useDb();

  const handleSubmit = async (data: Partial<FileLogsInsertType>) => {
    if (
      !formData.journalId ||
      !formData.articleId ||
      !formData.lepPages ||
      !formData.timeTaken ||
      !formData.workedAt
    ) {
      throw new Error("Please fill all required fields");
    }

    const payload: FileLogsCreateInput = {
      journalId: formData.journalId,
      articleId: formData.articleId,
      lepPages: formData.lepPages,
      timeTaken: formData.timeTaken,
      workedAt: formData.workedAt,
    };

    try {
      let row = await createFileLog(db, payload);
      setFormData({
        journalId: undefined,
        articleId: undefined,
        lepPages: undefined,
        timeTaken: undefined,
        workedAt: undefined,
      });
      toast.success("Log saved successfully");
    } catch (error) {
      console.error("Failed to submit file log", error);
      toast.error("Failed to submit file log");
    }
  };
  return (
    <>
      <Tabs.Screen
        options={{
          header: () => <ScreenHeader title="Create Log" />,
          headerShown: true,
        }}
      />
      <View className="screen-x-padding pt-2 flex-1 bg-bg-primary">
        <FileWorklogForm
          value={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
        />
      </View>
    </>
  );
};
export default CreateWorkLog;
