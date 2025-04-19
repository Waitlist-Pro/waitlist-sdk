import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Share2 } from "lucide-react";

const subscriberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
});

type SubscriberFormValues = z.infer<typeof subscriberSchema>;

interface WaitlistFormProps {
  formId?: number;
  formName: string;
  description?: string;
  collectName?: boolean;
  socialSharing?: boolean;
  onSuccess?: () => void;
  preview?: boolean;
}

const WaitlistForm = ({
  formId,
  formName,
  description,
  collectName = true,
  socialSharing = false,
  onSuccess,
  preview = false,
}: WaitlistFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<SubscriberFormValues>({
    resolver: zodResolver(subscriberSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const onSubmit = async (values: SubscriberFormValues) => {
    if (preview) {
      toast({
        title: "Preview mode",
        description: "Form submissions are disabled in preview mode",
      });
      return;
    }

    if (!formId) {
      toast({
        title: "Form ID missing",
        description: "Cannot submit without a valid form ID",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const referrer = typeof window !== "undefined" ? window.location.href : "";
      const ipAddress = ""; // This will be captured server-side

      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId,
          email: values.email,
          name: values.name || null,
          referrer,
          ipAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to join waitlist");
      }

      setSubmitted(true);
      form.reset();
      toast({
        title: "Success!",
        description: "You've been added to the waitlist",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join waitlist",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareOnSocialMedia = (platform: string) => {
    const shareText = `I just joined the waitlist for ${formName}! Check it out:`;
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    
    let shareLink = "";
    
    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    
    if (shareLink && typeof window !== "undefined") {
      window.open(shareLink, "_blank");
    }
  };

  return (
    <div className="waitlist-sdk-form text-center">
      <h3 className="text-xl font-bold text-gray-900">{formName}</h3>
      {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}

      {!submitted ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {collectName && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>
        </Form>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="bg-green-50 text-green-700 p-4 rounded-md">
            <p className="font-medium">You're on the list!</p>
            <p className="text-sm mt-1">Thank you for joining our waitlist. We'll keep you updated.</p>
          </div>

          {socialSharing && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Share with friends:</p>
              <div className="flex justify-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => shareOnSocialMedia("twitter")}
                  className="flex items-center"
                >
                  <Share2 className="h-4 w-4 mr-1" /> Twitter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => shareOnSocialMedia("facebook")}
                  className="flex items-center"
                >
                  <Share2 className="h-4 w-4 mr-1" /> Facebook
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => shareOnSocialMedia("linkedin")}
                  className="flex items-center"
                >
                  <Share2 className="h-4 w-4 mr-1" /> LinkedIn
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WaitlistForm;
