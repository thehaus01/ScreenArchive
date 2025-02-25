import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  insertScreenshotSchema,
  GENRES,
  SCREEN_TASKS,
  UI_ELEMENTS,
} from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export default function Upload() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(insertScreenshotSchema),
    defaultValues: {
      title: "",
      imagePath: "",
      description: "",
      app: "",
      genre: GENRES[0],
      screenTask: SCREEN_TASKS[0],
      uiElements: [UI_ELEMENTS[0]],
      tags: [],
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a preview URL for the selected image
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  async function onSubmit(data: any) {
    try {
      setIsUploading(true);

      const formData = new FormData();
      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      const imageFile = fileInput?.files?.[0];

      if (!imageFile) {
        throw new Error("Please select an image");
      }

      // Append all form data
      formData.append("image", imageFile);
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("app", data.app);
      formData.append("genre", data.genre);
      formData.append("screenTask", data.screenTask);
      formData.append("uiElements", data.uiElements.join(","));
      formData.append("tags", data.tags.join(","));

      const response = await fetch("/api/screenshots", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload screenshot");
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/screenshots"] });
      toast({
        title: "Success",
        description: "Screenshot uploaded successfully",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload screenshot",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold mb-6">Upload Screenshot</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Screenshot Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </FormControl>
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                <FormMessage />
              </FormItem>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="app"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENRES.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="screenTask"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Screen Task</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select screen task" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SCREEN_TASKS.map((task) => (
                          <SelectItem key={task} value={task}>
                            {task}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value.join(", ")}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((tag) => tag.trim())
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload Screenshot"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}