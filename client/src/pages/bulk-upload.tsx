import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GENRES, SCREEN_TASKS, UI_ELEMENTS } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function BulkUpload() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [metadata, setMetadata] = useState({
    app: "",
    genre: GENRES[0],
    screenTask: SCREEN_TASKS[0],
    uiElements: [UI_ELEMENTS[0]],
    tags: [],
  });

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    // Convert FileList to array and add to existing files
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);

    // Create preview URLs for the new files
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removeFile = (index: number) => {
    // Remove file from files array
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);

    // Remove preview URL from previewUrls array
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload each file with the same metadata
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData();

        // Add the file
        formData.append("image", file);

        // Add a title based on the filename
        const title = file.name.split('.')[0];
        formData.append("title", title);

        // Add shared metadata
        formData.append("app", metadata.app);
        formData.append("genre", metadata.genre);
        formData.append("screenTask", metadata.screenTask);
        formData.append("uiElements", metadata.uiElements.join(","));
        formData.append("tags", metadata.tags.join(","));

        // Upload the file
        const response = await fetch("/api/screenshots", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return response.json();
      });

      await Promise.all(uploadPromises);

      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({
        queryKey: ["/api/screenshots/filter"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["/api/screenshots/search"],
      });

      toast({
        title: "Success",
        description: `${files.length} screenshots uploaded successfully`,
      });

      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload screenshots",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Upload Multiple Screenshots</h1>
            <div className="flex gap-4">
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || files.length === 0}
              >
                {isUploading ? "Uploading..." : "Upload All"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
              >
                Cancel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="images">Select Screenshots</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesChange}
                />
                <p className="text-sm text-muted-foreground">
                  You can select multiple files at once, or add more files after your initial selection.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="app">App Name (applies to all screenshots)</Label>
                <Input
                  id="app"
                  value={metadata.app}
                  onChange={(e) => setMetadata({ ...metadata, app: e.target.value })}
                  placeholder="Enter application name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre (applies to all screenshots)</Label>
                <Select
                  value={metadata.genre}
                  onValueChange={(value) => setMetadata({ ...metadata, genre: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="screenTask">Screen Task (applies to all screenshots)</Label>
                <Select
                  value={metadata.screenTask}
                  onValueChange={(value) =>
                    setMetadata({ ...metadata, screenTask: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select screen task" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCREEN_TASKS.map((task) => (
                      <SelectItem key={task} value={task}>
                        {task}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="uiElements">UI Elements (applies to all screenshots)</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {UI_ELEMENTS.map((element) => {
                    const isSelected = metadata.uiElements.includes(element);
                    return (
                      <Badge
                        key={element}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setMetadata({
                            ...metadata,
                            uiElements: isSelected
                              ? metadata.uiElements.filter((e) => e !== element)
                              : [...metadata.uiElements, element],
                          });
                        }}
                      >
                        {element}
                        {isSelected && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (applies to all screenshots)</Label>
                <Input
                  id="tags"
                  value={metadata.tags.join(", ")}
                  onChange={(e) =>
                    setMetadata({
                      ...metadata,
                      tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
                    })
                  }
                  placeholder="minimal, modern, etc."
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{files.length} Files Selected</h3>
              <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={files[index].name}
                      className="w-full h-40 object-cover rounded-md border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <p className="text-xs mt-1 truncate">{files[index].name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}