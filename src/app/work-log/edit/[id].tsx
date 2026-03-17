import FileWorklogForm from "@/components/file-worklog-form";
import ScreenHeader from "@/components/screen-header";
import { updateFileLogById } from "@/db/mutations/fileworklog.mutations";
import { getFileLogById } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import { Tabs, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { toast } from "sonner-native";
import { FileLogsCreateInput, FileLogsInsertType } from "type";

const EditFileLog = () => {
  const { id } = useLocalSearchParams();

  const [formData, setFormData] = useState<Partial<FileLogsCreateInput>>({});

  const db = useDb();

  // fetch file log by id
  const getFileLog = async () => {
    try {
      const row = await getFileLogById(db, id as string);

      const initialData: FileLogsCreateInput = {
        journalId: row.journalId,
        articleId: row.articleId,
        lepPages: row.lepPages,
        timeTaken: row.timeTaken,
        workedAt: row.workedAt,
        isSml: row.isSml,
        isOT: row.isOT,
        isND: row.isND,
        remarks: row.remarks,
      };

      setFormData(initialData);
    } catch (error) {
      toast.error("Failed to get log");
    }
  };

  const handleSubmit = async (data: Partial<FileLogsInsertType>) => {
    try {
      let row = await updateFileLogById({
        db,
        id: id as string,
        data,
      });

      toast.success(`Updated ${row?.journalId}-${row?.articleId} successfully`);
    } catch (error) {
      console.error("Failed to submit file log", error);
      toast.error("Failed to submit file log");
    }
  };

  useEffect(() => {
    if (id) {
      getFileLog();
    }
  }, [id]);

  return (
    <>
      <Tabs.Screen
        options={{
          headerShown: true,
          header: () => (
            <ScreenHeader title="Edit Log" backButtonVisible={true} />
          ),
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

export default EditFileLog;
