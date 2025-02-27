import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
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
import { Card, CardContent } from "@/components/ui/card";
import { insertUserSchema } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Auth() {
  const { user, loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  const redirectAttempted = useRef(false);

  useEffect(() => {
    // Redirect if already logged in, but only once
    if (user?.isAdmin && !redirectAttempted.current) {
      redirectAttempted.current = true;
      setLocation("/");
    }
  }, [user, setLocation]);

  const form = useForm({
    resolver: zodResolver(
      insertUserSchema.pick({ username: true, password: true }),
    ),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: { username: string; password: string }) {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      console.error("Login error:", error);
    }
  }

  // Don't render the form if user is already authenticated
  if (user) {
    return <div className="min-h-screen bg-background p-6">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-6">Sign In</h1>

            <Alert className="mb-6">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Default login credentials:
                <br />
                Username: <strong>admin</strong>
                <br />
                Password: <strong>admin</strong>
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-3xl font-bold">UI Archive Admin</h2>
          <p className="text-muted-foreground">
            Sign in to manage the screenshot repository. As an admin, you can:
          </p>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Upload new screenshots</li>
            <li>Edit screenshot details</li>
            <li>Delete screenshots</li>
            <li>Manage tags and categories</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
