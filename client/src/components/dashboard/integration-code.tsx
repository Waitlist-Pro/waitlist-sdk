import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IntegrationCodeProps {
  formId?: number;
}

const IntegrationCode = ({ formId }: IntegrationCodeProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const getIntegrationCode = () => {
    if (!formId) return "";
    
    return `<script src="${window.location.origin}/sdk/waitlist-sdk.js"></script>
<div id="waitlist-form" data-form-id="${formId}"></div>
<script>
  WaitlistSDK.init({
    formId: '${formId}',
    selector: '#waitlist-form'
  });
</script>`;
  };

  const copyToClipboard = () => {
    if (!formId) {
      toast({
        title: "No form selected",
        description: "Please create or select a form first",
        variant: "destructive",
      });
      return;
    }
    
    navigator.clipboard.writeText(getIntegrationCode());
    setCopied(true);
    
    toast({
      title: "Code copied",
      description: "Integration code copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">Integration Code</CardTitle>
        <CardDescription>Copy this code to your website</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {!formId ? (
          <p className="text-sm text-gray-500">
            Create a form first to get your integration code
          </p>
        ) : (
          <>
            <div className="bg-gray-900 rounded-md p-4 text-gray-100 font-mono text-sm overflow-auto">
              <pre className="whitespace-pre-wrap">
                {getIntegrationCode()}
              </pre>
            </div>
            <Button 
              variant="outline" 
              className="mt-3 flex items-center" 
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationCode;
