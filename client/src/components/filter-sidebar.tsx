import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SCREEN_TASKS, UI_ELEMENTS } from "@shared/schema";
import { X } from "lucide-react";
import { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";


import { useQuery } from "@tanstack/react-query";
import { Screenshot } from "@shared/schema";

interface FilterSidebarProps {
  filters: {
    app?: string;
    screenTask?: string;
    uiElements?: string[];
    tags?: string[];
  };
  onFiltersChange: (filters: FilterSidebarProps["filters"]) => void;
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
}: FilterSidebarProps) {
  const clearFilters = () => onFiltersChange({});
  const [appOptions, setAppOptions] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<string[]>([]);

  const { data: screenshots } = useQuery<Screenshot[]>({
    queryKey: ["/api/screenshots"],
    queryFn: async () => {
      const response = await fetch("/api/screenshots");
      if (!response.ok) {
        throw new Error("Failed to fetch screenshots");
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (screenshots) {
      const uniqueApps = Array.from(new Set(screenshots.map((s) => s.app)));
      const uniqueTags = Array.from(new Set(screenshots.flatMap((s) => s.tags || [])));
      
      setAppOptions(uniqueApps);
      setTagOptions(uniqueTags);
      
      // If the current app filter is no longer in the list of apps, clear it
      if (filters.app && !uniqueApps.includes(filters.app)) {
        onFiltersChange({ ...filters, app: undefined });
      }
    }
  }, [screenshots, filters, onFiltersChange]);

  return (
    <div className="w-64 border-r bg-card p-6 hidden md:block">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold">Filters</h2>
        {Object.keys(filters).length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium">App</h3>
            <div className="space-y-2">
              <Button
                variant={filters.app === "" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onFiltersChange({ ...filters, app: "" })}
              >
                Any
              </Button>
              {appOptions.map((app) => (
                <Button
                  key={app}
                  variant={filters.app === app ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      app: filters.app === app ? undefined : app,
                    })
                  }
                >
                  {app}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-medium">Screen Task</h3>
            <div className="space-y-2">
              {SCREEN_TASKS.map((task) => (
                <Button
                  key={task}
                  variant={filters.screenTask === task ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      screenTask: filters.screenTask === task ? undefined : task,
                    })
                  }
                >
                  {task}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-medium">UI Elements</h3>
            <div className="flex flex-wrap gap-2">
              {UI_ELEMENTS.map((element) => {
                const isSelected = filters.uiElements?.includes(element);
                return (
                  <Badge
                    key={element}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        uiElements: isSelected
                          ? filters.uiElements?.filter((e) => e !== element)
                          : [...(filters.uiElements || []), element],
                      })
                    }
                  >
                    {element}
                    {isSelected && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="space-y-4">
            <div className="font-medium">Tags</div>
            <div className="space-y-2">
              {tagOptions.map((tag) => (
                <Button
                  key={tag}
                  variant={(filters.tags || []).includes(tag) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    const currentTags = filters.tags || [];
                    const newTags = currentTags.includes(tag)
                      ? currentTags.filter((t) => t !== tag)
                      : [...currentTags, tag];
                    onFiltersChange({
                      ...filters,
                      tags: newTags.length ? newTags : undefined,
                    });
                  }}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}