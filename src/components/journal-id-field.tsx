import FormInput from "@/components/form-input";
import { PressableScale } from "@/components/ui/pressable";
import { searchJournalIds } from "@/db/queries/journal.queries";
import { useDb } from "@/hooks/useDb";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/theme-provider";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { FieldName } from "type";

/** Characters to type before suggestions are searched. */
const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Suggestion state for the Journal ID field: saved IDs similar to what's typed,
 * and whether the dropdown should show.
 */
export const useJournalIdSuggestions = (value: string | null | undefined) => {
  const db = useDb();
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // Set after picking a suggestion so the list stays closed until the next edit.
  const [picked, setPicked] = useState<string | null>(null);

  const query = (value ?? "").trim().toUpperCase();
  const tooShort = query.length < MIN_QUERY_LENGTH;

  // Search only once typing pauses, so the list doesn't resize on every key.
  const debouncedQuery =
    useDebounce({ value: query, delay: SEARCH_DEBOUNCE_MS }) ?? "";

  useEffect(() => {
    let cancelled = false;
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      return;
    }
    searchJournalIds(db, debouncedQuery)
      .then((ids) => !cancelled && setSuggestions(ids))
      .catch((e) => console.error("[searchJournalIds] failed", e));
    return () => {
      cancelled = true;
    };
  }, [db, debouncedQuery]);

  // Nothing similar saved, or the only match is what's already typed: close it.
  // Dropping below the minimum length closes it right away, without the delay.
  const open =
    focused &&
    !tooShort &&
    picked !== query &&
    suggestions.length > 0 &&
    !(suggestions.length === 1 && suggestions[0] === query);

  return {
    open,
    suggestions,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    markPicked: (id: string) => setPicked(id),
  };
};

export const JournalIdInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
}: {
  value: string | null | undefined;
  onChange: (field: FieldName, rawValue: string | number) => void;
  onFocus: () => void;
  onBlur: () => void;
}) => (
  <FormInput
    label="Journal ID"
    autoCapitalize="characters"
    name="journalId"
    maxLength={4}
    autoFocus={true}
    placeholder="NPP2, MDR2…"
    value={value}
    onChange={onChange}
    onFocus={onFocus}
    onBlur={onBlur}
    rowMode
  />
);

/** Saved Journal IDs similar to the typed one; tap one to fill the field. */
export const JournalIdSuggestions = ({
  query,
  suggestions,
  onSelect,
}: {
  query: string;
  suggestions: string[];
  onSelect: (journalId: string) => void;
}) => {
  const { shadows } = useTheme();
  const q = query.trim().toUpperCase();

  return (
    <View
      accessibilityRole="menu"
      className="-mt-3.5 overflow-hidden rounded-[14px] border border-line bg-surface"
      style={{ boxShadow: shadows.card }}
    >
      {suggestions.map((id, i) => {
        const at = q ? id.indexOf(q) : -1;
        return (
          <PressableScale
            key={id}
            accessibilityRole="menuitem"
            accessibilityLabel={`Use journal ID ${id}`}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(id);
            }}
            className={cn(
              "h-12 justify-center px-4",
              i > 0 && "border-t border-line",
            )}
          >
            <Text className="font-inter-medium text-base text-foreground">
              {at >= 0 ? (
                <>
                  {id.slice(0, at)}
                  <Text className="font-inter-semibold text-accent">
                    {id.slice(at, at + q.length)}
                  </Text>
                  {id.slice(at + q.length)}
                </>
              ) : (
                id
              )}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
};
