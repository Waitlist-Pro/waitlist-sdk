import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

const Subscribers = () => {
  const { toast } = useToast();
  const [selectedFormId, setSelectedFormId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: forms, isLoading: isFormsLoading } = useQuery({
    queryKey: ['/api/forms'],
  });

  const { data: subscribers, isLoading: isSubscribersLoading } = useQuery({
    queryKey: ['/api/subscribers', selectedFormId !== "all" ? { formId: selectedFormId } : null],
  });

  const filteredSubscribers = subscribers?.filter(sub => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sub.email.toLowerCase().includes(query) || 
      (sub.name && sub.name.toLowerCase().includes(query))
    );
  });

  const handleExport = () => {
    // Create CSV content
    const headers = ["Email", "Name", "Form", "Date Joined", "Referrer"];
    const csvContent = [
      headers.join(","),
      ...(filteredSubscribers || []).map(sub => {
        const form = forms?.find(f => f.id === sub.formId);
        return [
          sub.email,
          sub.name || "",
          form?.name || "",
          new Date(sub.createdAt).toISOString().split("T")[0],
          sub.referrer || ""
        ].join(",");
      })
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Your subscribers have been exported to CSV",
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Subscribers
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view all subscribers from your waitlist forms.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button variant="outline" onClick={handleExport} className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-64">
              <Select
                value={selectedFormId}
                onValueChange={setSelectedFormId}
                disabled={isFormsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  {forms?.map(form => (
                    <SelectItem key={form.id} value={form.id.toString()}>
                      {form.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscribers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isSubscribersLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
          ) : filteredSubscribers?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No subscribers match your search" : "No subscribers yet"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Date Joined</TableHead>
                    <TableHead>Referrer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers?.map((subscriber) => {
                    const form = forms?.find(f => f.id === subscriber.formId);
                    return (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>{subscriber.name || "-"}</TableCell>
                        <TableCell>{form?.name || "-"}</TableCell>
                        <TableCell title={new Date(subscriber.createdAt).toLocaleString()}>
                          {formatDistanceToNow(new Date(subscriber.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={subscriber.referrer || ""}>
                          {subscriber.referrer || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscribers;
