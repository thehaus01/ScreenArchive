import { useState } from "react";
import { Screenshot } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import placeholderDashboard from "../assets/placeholder-dashboard.svg";
import placeholderFeed from "../assets/placeholder-feed.svg";
import { placeholderDashboard, placeholderFeed } from "@/lib/placeholders";

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

  return (
    <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-lg">
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