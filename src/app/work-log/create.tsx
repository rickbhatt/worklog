import CtrLogForm from "@/components/ctr-log-form";
import FileWorklogForm from "@/components/file-worklog-form";
import ScreenHeader from "@/components/screen-header";
import { Screen } from "@/components/ui/screen";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  createCtrLog,
  DuplicateCtrLogError,
} from "@/db/mutations/ctr.mutations";
import {
  createFileLog,
  DuplicateFileLogError,
} from "@/db/mutations/fileworklog.mutations";
import { useDb } from "@/hooks/useDb";
import { validateForm } from "@/lib/utils";
import React, { useState } from "react";
import { View } from "react-native";
import { toast } from "sonner-native";
import { FileLogsCreateInput } from "type";

const LOG_KINDS = [
  { label: "File log", value: "file" },
  { label: "CTR", value: "ctr" },
] as const;

type LogKind = (typeof LOG_KINDS)[number]["value"];

const CreateWorkLog = () => {
  const [kind, setKind] = useState<LogKind>("file");
  const [ctrWorkedAt, setCtrWorkedAt] = useState<string | undefined>();

  const [formData, setFormData] = useState<Partial<FileLogsCreateInput>>({
    journalId: undefined,
    articleId: undefined,
    lepPages: undefined,
    timeTaken: undefined,
    workedAt: undefined,
    isSml: 0,
    isOT: 0,
    isND: 0,
    isCompensatedFile: 0,
    isQcFile: 0,
    isMdc: 0,
    remarks: undefined,
  });

  const db = useDb();
  const handleSubmit = async () => {
    const requiredFields = [
      { key: "journalId", message: "Please enter a journal ID" },
      { key: "articleId", message: "Please enter an article ID" },
      { key: "lepPages", message: "Please enter LEP pages" },
      { key: "timeTaken", message: "Please enter time taken" },
      { key: "workedAt", message: "Please select worked at date" },
    ] as const;

    const missingField = validateForm(formData, requiredFields);

    if (missingField) {
      toast.error(missingField.message);
      return;
    }

    if (formData.isCompensatedFile && !formData.remarks) {
      toast.error(
        "Please enter the date of work for compensated file in the remarks field",
      );
      return;
    }

    const payload: FileLogsCreateInput = {
      journalId: formData.journalId!,
      articleId: formData.articleId!,
      lepPages: formData.lepPages!,
      timeTaken: formData.timeTaken!,
      workedAt: formData.workedAt!,
      isSml: formData.isSml,
      isOT: formData.isOT,
      isND: formData.isND,
      isCompensatedFile: formData.isCompensatedFile,
      isQcFile: formData.isQcFile,
      isMdc: formData.isMdc,
      remarks: formData.remarks,
    };

    try {
      await createFileLog(db, payload);

      setFormData({
        journalId: undefined,
        articleId: undefined,
        lepPages: undefined,
        timeTaken: undefined,
        workedAt: undefined,
        isSml: 0,
        isOT: 0,
        isND: 0,
        isCompensatedFile: 0,
        isQcFile: 0,
        isMdc: 0,
        remarks: undefined,
      });

      toast.success("Log saved successfully");
    } catch (error) {
      if (error instanceof DuplicateFileLogError) {
        toast.error(error.message);
        return;
      }
      console.error("Failed to submit file log", error);
      toast.error("Failed to submit file log");
    }
  };
  const handleCtrSubmit = async () => {
    if (!ctrWorkedAt) {
      toast.error("Please select worked on date");
      return;
    }

    try {
      await createCtrLog(db, ctrWorkedAt);
      setCtrWorkedAt(undefined);
      toast.success("CTR saved successfully");
    } catch (error) {
      if (error instanceof DuplicateCtrLogError) {
        toast.error(error.message);
        return;
      }
      console.error("Failed to submit CTR log", error);
      toast.error("Failed to save CTR");
    }
  };

  return (
    <Screen
      header={<ScreenHeader title="New log" backButtonVisible />}
    >
      <View className="px-5 pt-3">
        <SegmentedControl options={LOG_KINDS} value={kind} onChange={setKind} />
      </View>
      {kind === "file" ? (
        <FileWorklogForm
          value={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
        />
      ) : (
        <CtrLogForm
          workedAt={ctrWorkedAt}
          onChange={setCtrWorkedAt}
          onSubmit={handleCtrSubmit}
        />
      )}
    </Screen>
  );
};
export default CreateWorkLog;
