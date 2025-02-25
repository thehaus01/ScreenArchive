import { Screenshot } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PreviewDialogProps {
  screenshot: Screenshot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PreviewDialog({
  screenshot,
  open,
  onOpenChange,
}: PreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{screenshot.title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          <img
            src={screenshot.imageUrl}
            alt={screenshot.title}
            className="w-full rounded-lg"
          />

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {screenshot.description}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">App</h4>
                <p className="text-sm text-muted-foreground">{screenshot.app}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Genre</h4>
                <p className="text-sm text-muted-foreground">{screenshot.genre}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Screen Task</h4>
                <p className="text-sm text-muted-foreground">
                  {screenshot.screenTask}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">UI Elements</h4>
              <div className="flex flex-wrap gap-2">
                {screenshot.uiElements.map((element) => (
                  <Badge key={element} variant="outline">
                    {element}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {screenshot.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
