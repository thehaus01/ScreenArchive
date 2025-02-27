import { useState } from "react";
import { Screenshot } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { placeholderDashboard, placeholderFeed } from "@/lib/placeholders";
import { useAuth } from "@/hooks/use-auth"; // Added import for useAuth

interface ScreenshotCardProps {
  screenshot: Screenshot;
}

export default function ScreenshotCard({ screenshot }: ScreenshotCardProps) {
  // Function to get the appropriate image source
  const getImageSource = (path: string) => {
    if (path === "/placeholder-dashboard.svg") return placeholderDashboard;
    if (path === "/placeholder-feed.svg") return placeholderFeed;
    return path;
  };

  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const deleteScreenshot = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/screenshots/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete screenshot");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["screenshots"]);
    },
  });

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this screenshot?")) {
      await deleteScreenshot.mutateAsync(screenshot.id);
    }
  };

  // Admin controls are now shown to everyone since authentication is disabled
  const adminControls = (
    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => setLocation(`/edit/${screenshot.id}`)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="destructive" size="icon" onClick={handleDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg group">
      <div className="relative">
        {adminControls}
        {/*Added adminControls here based on the context of the original code*/}
      </div>
      <div className="aspect-video relative">
        <img
          src={getImageSource(screenshot.imagePath)}
          alt={screenshot.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">{screenshot.title}</h3>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <span>{screenshot.app}</span>
          <span className="mx-2">•</span>
          <span>{screenshot.genre}</span>
        </div>
        <div className="text-sm text-muted-foreground mb-2">
          <span>{screenshot.screenTask}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {screenshot.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}