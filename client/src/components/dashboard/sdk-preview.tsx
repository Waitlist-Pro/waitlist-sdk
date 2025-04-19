import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WaitlistForm from "@/components/waitlist/waitlist-form";
import WaitlistFormSettings from "@/components/waitlist/waitlist-form-settings";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Form {
  id: number;
  name: string;
  description?: string;
  collectName: boolean;
  socialSharing: boolean;
  confirmationEmail: boolean;
  [key: string]: any;
}

interface SdkPreviewProps {
  form?: Form | null;
  isLoading: boolean;
}

const SdkPreview = ({ form, isLoading }: SdkPreviewProps) => {
  const { toast } = useToast();
  const [formSettings, setFormSettings] = useState({
    collectName: form?.collectName ?? true,
    socialSharing: form?.socialSharing ?? false,
    confirmationEmail: form?.confirmationEmail ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleCollectNameChange = (value: boolean) => {
    setFormSettings(prev => ({ ...prev, collectName: value }));
  };

  const handleSocialSharingChange = (value: boolean) => {
    setFormSettings(prev => ({ ...prev, socialSharing: value }));
  };

  const handleConfirmationEmailChange = (value: boolean) => {
    setFormSettings(prev => ({ ...prev, confirmationEmail: value }));
  };

  const saveSettings = async () => {
    if (!form) return;
    
    setIsSaving(true);
    try {
      await apiRequest("PUT", `/api/forms/${form.id}`, formSettings);
      
      toast({
        title: "Settings saved",
        description: "Your form settings have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save form settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">SDK Preview</CardTitle>
        <CardDescription>Your current waitlist form</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          </div>
        ) : !form ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-2">No form available</p>
            <p className="text-xs text-gray-400">Create a form from the Integration page</p>
          </div>
        ) : (
          <>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <WaitlistForm
                formId={form.id}
                formName={form.name}
                description={form.description}
                collectName={formSettings.collectName}
                socialSharing={formSettings.socialSharing}
                preview={true}
              />
            </div>

            <WaitlistFormSettings
              collectName={formSettings.collectName}
              onCollectNameChange={handleCollectNameChange}
              socialSharing={formSettings.socialSharing}
              onSocialSharingChange={handleSocialSharingChange}
              confirmationEmail={formSettings.confirmationEmail}
              onConfirmationEmailChange={handleConfirmationEmailChange}
            />

            {(formSettings.collectName !== form.collectName ||
              formSettings.socialSharing !== form.socialSharing ||
              formSettings.confirmationEmail !== form.confirmationEmail) && (
              <Button 
                className="mt-4 w-full" 
                onClick={saveSettings}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            )}

            <div className="mt-6">
              <a href="/integration" className="text-sm font-medium text-primary hover:text-indigo-700">
                Customize Form →
              </a>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SdkPreview;
