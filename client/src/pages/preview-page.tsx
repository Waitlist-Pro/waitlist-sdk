import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { Form } from '@/lib/types';

const PreviewPage = () => {
  const { formId } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        if (!formId) {
          setError('No form ID provided');
          setLoading(false);
          return;
        }
        
        const res = await apiRequest('GET', `/api/forms/${formId}`);
        const data = await res.json();
        setForm(data);
        setLoading(false);

        // Initialize the waitlist SDK
        const script = document.createElement('script');
        script.src = `/sdk/waitlist-sdk.js`;
        script.async = true;
        script.onload = () => {
          // @ts-ignore
          if (window.WaitlistSDK) {
            // @ts-ignore
            window.WaitlistSDK.init({
              formId: formId,
              selector: '#waitlist-form-container',
              theme: {
                primaryColor: '#3b82f6',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                buttonText: 'Join Waitlist'
              },
              onSuccess: (data: any) => {
                console.log('Waitlist signup successful', data);
              },
              onError: (error: any) => {
                console.error('Waitlist signup error', error);
              }
            });
          }
        };
        document.body.appendChild(script);
        
        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      } catch (err) {
        console.error('Error fetching form', err);
        setError('Error fetching form details');
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const codeSnippet = `
<div id="waitlist-form-container"></div>

<script src="${window.location.origin}/sdk/waitlist-sdk.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    WaitlistSDK.init({
      formId: "${formId}",
      selector: "#waitlist-form-container",
      theme: {
        primaryColor: "#3b82f6",
        borderRadius: "8px",
        fontFamily: "Inter, sans-serif",
        buttonText: "Join Waitlist"
      },
      onSuccess: function(data) {
        console.log("Waitlist signup successful", data);
      },
      onError: function(error) {
        console.error("Waitlist signup error", error);
      }
    });
  });
</script>
`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-muted-foreground">{error || 'Form not found'}</p>
        <Button className="mt-4" variant="outline" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Form Preview: {form.name}</h1>
      <p className="text-muted-foreground mb-8">{form.description || 'No description provided'}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg">
                <div id="waitlist-form-container"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="code">
            <TabsList className="mb-4">
              <TabsTrigger value="code">Integration Code</TabsTrigger>
              <TabsTrigger value="settings">Form Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="code">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Copy and paste this code into your website to embed the waitlist form.
                  </p>
                  
                  <div className="relative">
                    <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-xs">
                      <code>{codeSnippet}</code>
                    </pre>
                    <Button 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => {
                        navigator.clipboard.writeText(codeSnippet);
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Form Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Form Name</h3>
                      <p className="text-muted-foreground">{form.name}</p>
                    </div>
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium">Description</h3>
                      <p className="text-muted-foreground">{form.description || 'No description'}</p>
                    </div>
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium">Form Fields</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        <li>Email {form.collectEmail ? '(Required)' : '(Optional)'}</li>
                        <li>Name {form.collectName ? '(Required)' : '(Optional)'}</li>
                      </ul>
                    </div>
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium">Features</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        <li>Social Sharing: {form.socialSharing ? 'Enabled' : 'Disabled'}</li>
                        <li>Confirmation Email: {form.confirmationEmail ? 'Enabled' : 'Disabled'}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="mt-8">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back to Forms
        </Button>
      </div>
    </div>
  );
};

export default PreviewPage;