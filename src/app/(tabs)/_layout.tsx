import AlertDialogBox from "@/components/alert-dialogbox";
import TabBar from "@/components/tab-bar";
import { checkTargetInfoExists } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import { useTheme } from "@/theme/theme-provider";
import { Tabs, useRouter } from "expo-router";
import { useState } from "react";

const TabsLayout = () => {
  const [isTargetAlertOpen, setIsTargetAlertOpen] = useState<boolean>(false);

  const router = useRouter();

  const db = useDb();

  const { colors } = useTheme();

  return (
    <>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          // Tab screens render their own title (see TabTitle).
          headerShown: false,
          sceneStyle: { backgroundColor: colors.bg },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "History" }} />
        <Tabs.Screen
          name="dummy-create-work-log"
          listeners={() => ({
            tabPress: async (e) => {
              e.preventDefault();
              let latestTargetInfo = await checkTargetInfoExists(db);
              if (!latestTargetInfo) {
                setIsTargetAlertOpen(true);
              } else {
                router.push("/work-log/create");
              }
            },
          })}
          options={{ title: "New log" }}
        />
        <Tabs.Screen name="insights" options={{ title: "Insights" }} />
        <Tabs.Screen
          name="dummy-settings"
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault();
              router.push("/settings");
            },
          })}
          options={{ title: "Settings" }}
        />
      </Tabs>
      <AlertDialogBox
        open={isTargetAlertOpen}
        onOpenChange={setIsTargetAlertOpen}
        title="LEP target not set"
        description="You need to set a LEP target first"
        cancelText="Cancel"
        actionText="Okay"
        onAction={() => router.push("/settings/target-hour")}
      />
    </>
  );
};

export default TabsLayout;
