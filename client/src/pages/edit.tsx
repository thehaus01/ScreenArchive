
import { useParams, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Screenshot, GENRES, SCREEN_TASKS, UI_ELEMENTS } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

export default function Edit() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<Screenshot>>({});

  const { data: screenshot } = useQuery<Screenshot>({
    queryKey: [`/api/screenshots/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/screenshots/${id}`);
      return response.json();
    },
  });

  useEffect(() => {
    if (screenshot) {
      setFormData(screenshot);
    }
  }, [screenshot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    
    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          form.append(key, value.join(','));
        } else {
          form.append(key, value.toString());
        }
      }
    });

    // Add image if selected
    const fileInput = document.querySelector<HTMLInputElement>('#image');
    if (fileInput?.files?.length) {
      form.append('image', fileInput.files[0]);
    }

    await fetch(`/api/screenshots/${id}`, {
      method: 'PATCH',
      body: form,
    });
    queryClient.invalidateQueries({ queryKey: ['/api/screenshots/filter'] });
    setLocation('/');
  };

  if (!screenshot) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Screenshot</h1>
        <div className="flex gap-4">
          <Button type="submit">Update Screenshot</Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setLocation("/")}
          >
            Cancel
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Current Screenshot</h3>
          <img 
            src={screenshot.imagePath} 
            alt={screenshot.title} 
            className="w-full max-w-xl rounded-lg border"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">Replace Screenshot Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.length) {
                setFormData({ ...formData });
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="app">App Name</Label>
        <Input
          id="app"
          value={formData.app || ''}
          onChange={(e) => setFormData({ ...formData, app: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="genre">Genre</Label>
        <Select
          value={formData.genre}
          onValueChange={(value) => setFormData({ ...formData, genre: value })}
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
        <Label htmlFor="screenTask">Screen Task</Label>
        <Select
          value={formData.screenTask}
          onValueChange={(value) => setFormData({ ...formData, screenTask: value })}
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
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={(formData.tags || []).join(', ')}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit">Save Changes</Button>
        <Button type="button" variant="outline" onClick={() => setLocation('/')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
