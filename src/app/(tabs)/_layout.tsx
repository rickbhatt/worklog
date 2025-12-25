import { Tabs } from "expo-router";

const TabsLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="create-work-log" options={{ headerShown: false }} />
      <Tabs.Screen name="insights" options={{ headerShown: false }} />
    </Tabs>
  );
};

export default TabsLayout;
