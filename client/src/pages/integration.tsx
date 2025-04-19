import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clipboard, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import WaitlistForm from "@/components/waitlist/waitlist-form";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  collectName: z.boolean().default(true),
  collectEmail: z.boolean().default(true),
  socialSharing: z.boolean().default(false),
  confirmationEmail: z.boolean().default(true),
  customCss: z.string().optional(),
  redirectUrl: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const Integration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("create-form");
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: forms, isLoading: isFormsLoading } = useQuery({
    queryKey: ['/api/forms'],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      collectName: true,
      collectEmail: true,
      socialSharing: false,
      confirmationEmail: true,
      customCss: "",
      redirectUrl: "",
    },
  });

  const createFormMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/forms", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Form created successfully",
        description: "Your new waitlist form is ready to use",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      form.reset();
      setSelectedFormId(data.id);
      setActiveTab("integration-code");
    },
    onError: (error: any) => {
      toast({
        title: "Error creating form",
        description: error.message || "There was an error creating your form",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createFormMutation.mutate(data);
  };

  const updatePreview = form.watch();

  const getIntegrationCode = (formId: number) => {
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
    if (!selectedFormId) return;
    
    navigator.clipboard.writeText(getIntegrationCode(selectedFormId));
    setCopied(true);
    
    toast({
      title: "Code copied",
      description: "Integration code copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex-1 min-w-0 mb-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Integration
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Create and integrate waitlist forms for your products
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="create-form">Create Form</TabsTrigger>
          <TabsTrigger value="form-designer">Form Designer</TabsTrigger>
          <TabsTrigger value="integration-code">Integration Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>New Waitlist Form</CardTitle>
                <CardDescription>
                  Create a new form to collect waitlist signups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Form Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Product Launch" {...field} />
                          </FormControl>
                          <FormDescription>
                            Internal name to identify this form
                          </FormDescription>
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
                            <Textarea 
                              placeholder="Join our waitlist for early access..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Text displayed to users on the waitlist form
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="collectName"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Collect Name</FormLabel>
                              <FormDescription>
                                Include name field in form
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="socialSharing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Social Sharing</FormLabel>
                              <FormDescription>
                                Add social sharing options
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmationEmail"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Confirmation Email</FormLabel>
                              <FormDescription>
                                Send confirmation emails
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="redirectUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Redirect URL (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/thank-you" 
                              {...field}
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormDescription>
                            Redirect users after form submission
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={createFormMutation.isPending}
                    >
                      {createFormMutation.isPending ? "Creating..." : "Create Form"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Form Preview</CardTitle>
                <CardDescription>
                  See how your form will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <WaitlistForm 
                    formName={updatePreview.name || "Join Our Waitlist"}
                    description={updatePreview.description || "Be the first to know when we launch"}
                    collectName={updatePreview.collectName}
                    socialSharing={updatePreview.socialSharing}
                    preview={true}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="form-designer">
          <Card>
            <CardHeader>
              <CardTitle>Form Designer</CardTitle>
              <CardDescription>
                Customize the appearance of your waitlist form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Advanced form customization will be available in future updates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integration-code">
          <Card>
            <CardHeader>
              <CardTitle>Integration Code</CardTitle>
              <CardDescription>
                Copy this code and add it to your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedFormId && !isFormsLoading && forms?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't created any forms yet.</p>
                  <Button onClick={() => setActiveTab("create-form")}>
                    Create Your First Form
                  </Button>
                </div>
              ) : isFormsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {!selectedFormId && forms && forms.length > 0 && (
                    <div className="mb-4">
                      <FormLabel>Select a form</FormLabel>
                      <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedFormId || ""}
                        onChange={(e) => setSelectedFormId(Number(e.target.value))}
                      >
                        <option value="">Select a form</option>
                        {forms.map((form) => (
                          <option key={form.id} value={form.id}>
                            {form.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {selectedFormId && (
                    <>
                      <div className="bg-gray-900 rounded-md p-4 text-gray-100 font-mono text-sm overflow-auto">
                        <pre className="whitespace-pre-wrap">
                          {getIntegrationCode(selectedFormId)}
                        </pre>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-4 flex items-center" 
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
                      
                      <div className="mt-6">
                        <h3 className="text-base font-medium mb-2">Implementation Steps:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                          <li>Copy the code above</li>
                          <li>Paste it into your website's HTML where you want the form to appear</li>
                          <li>The waitlist form will automatically appear and collect signups</li>
                          <li>Submissions will appear in your dashboard</li>
                        </ol>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Integration;
