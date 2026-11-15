import AlertDialogBox from "@/components/alert-dialogbox";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlatList } from "@/components/ui/gesture-scroll";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { SectionCaption } from "@/components/ui/list-group";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import {
  addJournalId,
  deleteJournalId,
  DuplicateJournalIdError,
  renameJournalId,
} from "@/db/mutations/journal.mutations";
import { getJournalIdsWithLogCount } from "@/db/queries/journal.queries";
import { useDb } from "@/hooks/useDb";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/theme-provider";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Pencil, Plus, Trash2, X } from "lucide-react-native";
import React, { useState } from "react";
import { Text as RNText, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const JOURNAL_ID_MAX_LENGTH = 4;

const ManageJid = () => {
  const db = useDb();
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();

  const { data } = useLiveQuery(getJournalIdsWithLogCount(db));

  const [text, setText] = useState("");
  // The Journal ID being renamed; null while adding.
  const [editing, setEditing] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const resetForm = () => {
    setText("");
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error("Please enter a journal ID");
      return;
    }
    try {
      if (editing) {
        const id = await renameJournalId(db, editing, text);
        toast.success(
          id === editing ? "No changes" : `Renamed ${editing} to ${id}`,
        );
      } else {
        const id = await addJournalId(db, text);
        toast.success(`Added ${id}`);
      }
      resetForm();
    } catch (error) {
      if (error instanceof DuplicateJournalIdError) {
        toast.error(error.message);
        return;
      }
      console.error("Failed to save journal ID", error);
      toast.error("Failed to save journal ID");
    }
  };

  const handleDelete = async (journalId: string) => {
    try {
      await deleteJournalId(db, journalId);
      if (editing === journalId) resetForm();
      toast.success(`Deleted ${journalId}`);
    } catch (error) {
      console.error("Failed to delete journal ID", error);
      toast.error("Failed to delete journal ID");
    }
  };

  const deleting = data.find((d) => d.journalId === toDelete);

  return (
    <>
      <Screen
        header={<ScreenHeader title="Manage JID" backButtonVisible />}
      >
        <FlatList
          keyExtractor={(item) => item.journalId}
          data={data}
          className="flex-1"
          contentContainerClassName="gap-3 px-5 pt-2"
          contentContainerStyle={{ paddingBottom: bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="gap-5 pb-1">
              <View className="gap-2">
                <SectionCaption>
                  {editing ? `Rename ${editing}` : "Add journal ID"}
                </SectionCaption>
                <View className="flex-row gap-2.5">
                  <Input
                    value={text}
                    onChangeText={(t) => setText(t.toUpperCase())}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={JOURNAL_ID_MAX_LENGTH}
                    placeholder="NPP2, MDR2…"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    containerClassName="flex-1"
                  />
                  {editing && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-[52px] w-[52px]"
                      onPress={resetForm}
                      accessibilityLabel="Cancel rename"
                    >
                      <Icon
                        as={X}
                        size={18}
                        strokeWidth={2}
                        className="text-foreground"
                      />
                    </Button>
                  )}
                  <Button size="sm" className="h-[52px]" onPress={handleSubmit}>
                    {!editing && (
                      <Icon
                        as={Plus}
                        size={18}
                        strokeWidth={2.2}
                        className="text-on-accent"
                      />
                    )}
                    <Text className="text-sm">
                      {editing ? "Update" : "Add"}
                    </Text>
                  </Button>
                </View>
                <RNText className="caption px-1">
                  These are the suggestions shown when you type a Journal ID.
                  Renaming or deleting one doesn&apos;t change your logs.
                </RNText>
              </View>
              {data.length > 0 && (
                <SectionCaption>Saved · {data.length}</SectionCaption>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const isEditing = editing === item.journalId;
            return (
              <Card
                className="flex-row items-center gap-3 rounded-[18px] py-3 pl-4 pr-3"
                style={isEditing ? { borderColor: colors.accent } : undefined}
              >
                <View className="min-w-0 flex-1 gap-0.5">
                  <RNText
                    className={cn(
                      "font-manrope-bold text-lg text-foreground",
                      isEditing && "text-accent",
                    )}
                  >
                    {item.journalId}
                  </RNText>
                  <RNText className="caption">
                    {item.logCount === 0
                      ? "Not used in any log"
                      : `${item.logCount} ${item.logCount === 1 ? "log" : "logs"}`}
                  </RNText>
                </View>
                <Button
                  variant="secondary"
                  size="icon"
                  onPress={() => {
                    setEditing(item.journalId);
                    setText(item.journalId);
                  }}
                  accessibilityLabel={`Rename ${item.journalId}`}
                >
                  <Icon
                    as={Pencil}
                    size={18}
                    strokeWidth={1.8}
                    className="text-foreground"
                  />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onPress={() => setToDelete(item.journalId)}
                  accessibilityLabel={`Delete ${item.journalId}`}
                >
                  <Icon
                    as={Trash2}
                    size={18}
                    strokeWidth={1.8}
                    className="text-accent"
                  />
                </Button>
              </Card>
            );
          }}
          ListEmptyComponent={
            <View className="items-center gap-1 pt-16">
              <RNText className="section-title">No journal IDs yet</RNText>
              <RNText className="caption">
                They&apos;re saved when you log a file, or add one above
              </RNText>
            </View>
          }
        />
      </Screen>

      <AlertDialogBox
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete ${toDelete}?`}
        description={
          deleting && deleting.logCount > 0
            ? `It won't be suggested anymore. The ${deleting.logCount} ${
                deleting.logCount === 1 ? "log" : "logs"
              } using it stay as they are, and it's saved again if you log or edit a file with it.`
            : "It won't be suggested anymore."
        }
        actionText="Delete"
        onAction={() => toDelete && handleDelete(toDelete)}
      />
    </>
  );
};

export default ManageJid;
