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
      <AlertDialogContent>
        <AlertDialogHeader className="gap-1.5">
          <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            className="h-12 flex-1"
            onPress={() => onOpenChange(false)}
          >
            <Text>{cancelText}</Text>
          </Button>
          <Button size="sm" className="h-12 flex-1" onPress={handleAction}>
            <Text>{actionText}</Text>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDialogBox;
