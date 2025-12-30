import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { AlertDialogBoxProps } from "type";

const AlertDialogBox = ({
  open,
  onOpenChange,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone.",
  cancelText = "Cancel",
  actionText = "Continue",
  onAction,
}: AlertDialogBoxProps) => {
  const handleAction = () => {
    onAction?.();
    onOpenChange(false);
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className=" bg-dark-200 border-0">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 h-12 justify-center"
            onPress={() => onOpenChange(false)}
          >
            <Text className="text-text-primary font-bold text-base">
              {cancelText}
            </Text>
          </Button>
          <Button className="flex-1 h-12" onPress={handleAction}>
            <Text className="text-text-primary font-bold text-base">
              {actionText}
            </Text>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDialogBox;
