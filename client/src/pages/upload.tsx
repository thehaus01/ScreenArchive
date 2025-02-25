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
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function Upload() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertScreenshotSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      description: "",
      app: "",
      genre: GENRES[0],
      screenTask: SCREEN_TASKS[0],
      uiElements: [UI_ELEMENTS[0]],
      tags: [],
    },
  });

  async function onSubmit(data: any) {
    try {
      setIsUploading(true);
      await apiRequest("POST", "/api/screenshots", data);
      await queryClient.invalidateQueries({ queryKey: ["/api/screenshots"] });
      toast({
        title: "Success",
        description: "Screenshot uploaded successfully",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload screenshot",
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

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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