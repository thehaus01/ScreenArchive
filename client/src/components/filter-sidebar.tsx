import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { GENRES, SCREEN_TASKS, UI_ELEMENTS } from "@shared/schema";
import { X } from "lucide-react";

interface FilterSidebarProps {
  filters: {
    app?: string;
    genre?: string;
    screenTask?: string;
    uiElements?: string[];
  };
  onFiltersChange: (filters: FilterSidebarProps["filters"]) => void;
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
}: FilterSidebarProps) {
  const clearFilters = () => onFiltersChange({});

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
            <h3 className="mb-2 text-sm font-medium">Genre</h3>
            <div className="space-y-2">
              {GENRES.map((genre) => (
                <Button
                  key={genre}
                  variant={filters.genre === genre ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      genre: filters.genre === genre ? undefined : genre,
                    })
                  }
                >
                  {genre}
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
        </div>
      </ScrollArea>
    </div>
  );
}
