import FileWorklogForm from "@/components/file-worklog-form";
import ScreenHeader from "@/components/screen-header";
import { Screen } from "@/components/ui/screen";
import {
  DuplicateFileLogError,
  updateFileLogById,
} from "@/db/mutations/fileworklog.mutations";
import { getFileLogById } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
        isCompensatedFile: row.isCompensatedFile,
        isQcFile: row.isQcFile,
        isMdc: row.isMdc,
        remarks: row.remarks,
      };

      setFormData(initialData);
    } catch (error) {
      toast.error("Failed to get log");
    }
  };

  const handleSubmit = async (data: Partial<FileLogsInsertType>) => {
    if (formData.isCompensatedFile && !data.remarks) {
      toast.error(
        "Please enter the date of work for compensated file in the remarks field",
      );
      return;
    }
    try {
      let row = await updateFileLogById({
        db,
        id: id as string,
        data,
      });

      toast.success(`Updated ${row?.journalId}-${row?.articleId} successfully`);
    } catch (error) {
      if (error instanceof DuplicateFileLogError) {
        toast.error(error.message);
        return;
      }
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
    <Screen
      header={<ScreenHeader title="Edit log" backButtonVisible />}
    >
      <FileWorklogForm
        value={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
      />
    </Screen>
  );
};

export default EditFileLog;
