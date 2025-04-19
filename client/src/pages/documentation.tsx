import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Documentation = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex-1 min-w-0 mb-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Documentation
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Learn how to use the Waitlist SDK and integrate it with your applications
        </p>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-4">
        <TabsList>
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="sdk">SDK Reference</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="getting-started">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with Waitlist SDK</CardTitle>
              <CardDescription>
                Learn how to quickly set up and use the Waitlist SDK
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-3">Quick Start Guide</h3>
                <div className="p-4 border rounded-md bg-gray-50">
                  <ol className="list-decimal list-inside space-y-3">
                    <li className="pl-2">
                      <span className="font-medium">Create an account</span>
                      <p className="text-sm text-gray-600 mt-1">Sign up for a Waitlist SDK account to get started.</p>
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Create a waitlist form</span>
                      <p className="text-sm text-gray-600 mt-1">Design your waitlist form with our form builder.</p>
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Copy the integration code</span>
                      <p className="text-sm text-gray-600 mt-1">Get the snippet of code to add to your website.</p>
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Add the code to your website</span>
                      <p className="text-sm text-gray-600 mt-1">Paste the code where you want the form to appear.</p>
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Start collecting signups</span>
                      <p className="text-sm text-gray-600 mt-1">Your waitlist form is now live and ready to collect signups.</p>
                    </li>
                  </ol>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Integration Example</h3>
                <div className="p-4 border rounded-md bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{`<script src="https://cdn.waitlist-sdk.com/v1/embed.js"></script>
<div id="waitlist-form" data-form-id="your-form-id"></div>
<script>
  WaitlistSDK.init({
    formId: 'your-form-id',
    selector: '#waitlist-form'
  });
</script>`}</pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Video Tutorial</h3>
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Video tutorial coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sdk">
          <Card>
            <CardHeader>
              <CardTitle>SDK Reference</CardTitle>
              <CardDescription>
                Detailed documentation for the Waitlist SDK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Initialization Options</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        The <code className="bg-gray-100 p-1 rounded">WaitlistSDK.init()</code> function accepts the following options:
                      </p>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="font-mono text-sm">formId</div>
                          <div className="col-span-2 text-sm">The ID of your waitlist form (required)</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="font-mono text-sm">selector</div>
                          <div className="col-span-2 text-sm">CSS selector for the element where the form will be rendered (required)</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="font-mono text-sm">theme</div>
                          <div className="col-span-2 text-sm">Custom theme settings (optional)</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="font-mono text-sm">onSuccess</div>
                          <div className="col-span-2 text-sm">Callback function after successful submission (optional)</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="font-mono text-sm">onError</div>
                          <div className="col-span-2 text-sm">Callback function for error handling (optional)</div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Styling & Customization</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        You can customize the look and feel of your waitlist form using the theme option or CSS variables.
                      </p>
                      <div className="p-4 border rounded-md bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{`WaitlistSDK.init({
  formId: 'your-form-id',
  selector: '#waitlist-form',
  theme: {
    primaryColor: '#4F46E5',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif',
    buttonText: 'Join Now'
  }
})
`}</pre>
                      </div>
                      <p className="text-sm text-gray-600">
                        Alternative CSS customization:
                      </p>
                      <div className="p-4 border rounded-md bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{`.waitlist-sdk-form {
  --waitlist-primary-color: #4F46E5;
  --waitlist-border-radius: 8px;
  --waitlist-font-family: 'Inter', sans-serif;
}
`}</pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Methods & Events</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        The SDK provides several methods for programmatically interacting with the form:
                      </p>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="font-mono text-sm">WaitlistSDK.open()</div>
                          <div className="col-span-2 text-sm">Opens the form if it's configured as a modal</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="font-mono text-sm">WaitlistSDK.close()</div>
                          <div className="col-span-2 text-sm">Closes the form modal</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="font-mono text-sm">WaitlistSDK.reset()</div>
                          <div className="col-span-2 text-sm">Resets the form to its initial state</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="font-mono text-sm">WaitlistSDK.submit(data)</div>
                          <div className="col-span-2 text-sm">Programmatically submits the form with the provided data</div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-4">
                        You can also listen to events:
                      </p>
                      <div className="p-4 border rounded-md bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{`WaitlistSDK.on('submit', function(data) {
  console.log('Form submitted:', data);
});

WaitlistSDK.on('success', function(response) {
  console.log('Submission successful:', response);
});

WaitlistSDK.on('error', function(error) {
  console.error('Submission error:', error);
});
`}</pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>
                Documentation for the Waitlist SDK REST API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Authentication</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    All API requests require authentication using an API key. You can find your API key in the settings page.
                  </p>
                  <div className="p-4 border rounded-md bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{`curl -X GET "https://api.waitlist-sdk.com/v1/forms" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">API Endpoints</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="endpoint-1">
                      <AccordionTrigger>GET /forms</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-gray-600 mb-2">
                          Returns a list of all your waitlist forms.
                        </p>
                        <div className="p-3 border rounded-md bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto mb-3">
                          <pre className="whitespace-pre-wrap">{`GET /api/forms`}</pre>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Example response:</p>
                        <div className="p-3 border rounded-md bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
                          <pre className="whitespace-pre-wrap">{`[
  {
    "id": 1,
    "name": "Product Launch",
    "description": "Join our waitlist for early access",
    "collectName": true,
    "collectEmail": true,
    "socialSharing": false,
    "confirmationEmail": true,
    "createdAt": "2023-06-01T00:00:00Z",
    "updatedAt": "2023-06-01T00:00:00Z"
  },
  ...
]`}</pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="endpoint-2">
                      <AccordionTrigger>POST /subscribers</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-gray-600 mb-2">
                          Adds a new subscriber to a waitlist form.
                        </p>
                        <div className="p-3 border rounded-md bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto mb-3">
                          <pre className="whitespace-pre-wrap">{`POST /api/subscribers`}</pre>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Request body:</p>
                        <div className="p-3 border rounded-md bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto mb-3">
                          <pre className="whitespace-pre-wrap">{`{
  "formId": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "referrer": "https://example.com"
}`}</pre>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Example response:</p>
                        <div className="p-3 border rounded-md bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
                          <pre className="whitespace-pre-wrap">{`{
  "id": 123,
  "formId": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "referrer": "https://example.com",
  "createdAt": "2023-06-01T12:34:56Z"
}`}</pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="endpoint-3">
                      <AccordionTrigger>GET /subscribers</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-gray-600 mb-2">
                          Returns a list of subscribers. Can be filtered by form ID.
                        </p>
                        <div className="p-3 border rounded-md bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto mb-3">
                          <pre className="whitespace-pre-wrap">{`GET /api/subscribers?formId=1`}</pre>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Example response:</p>
                        <div className="p-3 border rounded-md bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
                          <pre className="whitespace-pre-wrap">{`[
  {
    "id": 123,
    "formId": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "referrer": "https://example.com",
    "createdAt": "2023-06-01T12:34:56Z"
  },
  ...
]`}</pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Common questions about using the Waitlist SDK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>How do I customize the appearance of my waitlist form?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600">
                      You can customize your form in several ways:
                    </p>
                    <ol className="list-decimal list-inside mt-2 space-y-2 text-sm text-gray-600">
                      <li>Use the Form Designer in the dashboard to change colors, fonts, and layout</li>
                      <li>Add custom CSS through the settings page</li>
                      <li>Use the theme option in the SDK initialization code</li>
                      <li>Override the CSS variables in your website's stylesheet</li>
                    </ol>
                    <p className="text-sm text-gray-600 mt-2">
                      For more advanced customization, you can also use the API to create a completely custom interface.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="faq-2">
                  <AccordionTrigger>Can I export my waitlist subscribers?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600">
                      Yes, you can export your subscribers in several formats:
                    </p>
                    <ol className="list-decimal list-inside mt-2 space-y-2 text-sm text-gray-600">
                      <li>CSV export from the Subscribers page</li>
                      <li>JSON export through the API</li>
                      <li>Direct integration with popular marketing platforms</li>
                    </ol>
                    <p className="text-sm text-gray-600 mt-2">
                      To export your subscribers, go to the Subscribers page and click the "Export" button in the top right corner.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="faq-3">
                  <AccordionTrigger>How do I prevent spam submissions?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600">
                      Waitlist SDK includes several features to help prevent spam:
                    </p>
                    <ol className="list-decimal list-inside mt-2 space-y-2 text-sm text-gray-600">
                      <li>Built-in spam detection algorithms</li>
                      <li>Rate limiting to prevent automated submissions</li>
                      <li>Email verification options</li>
                      <li>Optional CAPTCHA integration</li>
                    </ol>
                    <p className="text-sm text-gray-600 mt-2">
                      You can configure these settings in the dashboard under Settings → Security.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="faq-4">
                  <AccordionTrigger>Does the SDK work with single-page applications?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600">
                      Yes, Waitlist SDK works with all modern frameworks and single-page applications, including:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-2 text-sm text-gray-600">
                      <li>React</li>
                      <li>Vue.js</li>
                      <li>Angular</li>
                      <li>Next.js</li>
                      <li>Svelte</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-2">
                      For SPAs, you can either include the script in your HTML or import the SDK as an npm package.
                    </p>
                    <div className="p-3 border rounded-md bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto mt-3">
                      <pre className="whitespace-pre-wrap">{`npm install waitlist-sdk
// Then in your component
import { WaitlistSDK } from 'waitlist-sdk';

useEffect(() => {
  WaitlistSDK.init({
    formId: 'your-form-id',
    selector: '#waitlist-form'
  });
}, []);`}</pre>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
