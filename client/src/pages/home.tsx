import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Screenshot } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import FilterSidebar from "@/components/filter-sidebar";
import ScreenshotGrid from "@/components/screenshot-grid";
import { Search } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    app?: string;
    genre?: string;
    screenTask?: string;
    uiElements?: string[];
    tags?: string[];
  }>({});

  const { data: screenshots = [], isLoading } = useQuery<Screenshot[]>({
    queryKey: [searchQuery ? "/api/screenshots/search" : "/api/screenshots/filter", { ...filters, q: searchQuery }],
    queryFn: async ({ queryKey }) => {
      const [endpoint, params] = queryKey;
      const searchParams = new URLSearchParams();

      if (searchQuery) {
        searchParams.append("q", searchQuery);
      } else {
        Object.entries(params as Record<string, any>).forEach(([key, value]) => {
          if (value) {
            if (Array.isArray(value)) {
              searchParams.append(key, value.join(","));
            } else {
              searchParams.append(key, String(value));
            }
          }
        });
      }

      const url = `${endpoint}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      console.log("Fetching screenshots from:", url); // Debug log
      const response = await fetch(url, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch screenshots");
      }
      const data = await response.json();
      console.log("Fetched screenshots:", data); // Debug log
      return data;
    },
  });

  return (
    <div className="flex min-h-screen bg-background">
      <FilterSidebar filters={filters} onFiltersChange={setFilters} />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search screenshots..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[300px] rounded-lg" />
              ))}
            </div>
          ) : (
            <ScreenshotGrid screenshots={screenshots} />
          )}
        </div>
      </main>
    </div>
  );
}