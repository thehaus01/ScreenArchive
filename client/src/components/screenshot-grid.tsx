import { Screenshot } from "@shared/schema";
import ScreenshotCard from "./screenshot-card";

interface ScreenshotGridProps {
  screenshots: Screenshot[];
}

export default function ScreenshotGrid({ screenshots }: ScreenshotGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {screenshots.map((screenshot) => (
        <ScreenshotCard key={screenshot.id} screenshot={screenshot} />
      ))}
    </div>
  );
}
