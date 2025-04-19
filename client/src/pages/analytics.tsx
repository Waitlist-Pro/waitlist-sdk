import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock data - in a real app, this would come from your API
const generateMockAnalytics = () => {
  const subscriberData = [
    { date: "2023-01", count: 35 },
    { date: "2023-02", count: 42 },
    { date: "2023-03", count: 67 },
    { date: "2023-04", count: 89 },
    { date: "2023-05", count: 112 },
    { date: "2023-06", count: 138 },
    { date: "2023-07", count: 165 },
    { date: "2023-08", count: 193 },
    { date: "2023-09", count: 221 },
    { date: "2023-10", count: 252 },
    { date: "2023-11", count: 276 },
    { date: "2023-12", count: 312 },
  ];

  const conversionData = [
    { date: "2023-01", rate: 15 },
    { date: "2023-02", rate: 18 },
    { date: "2023-03", rate: 20 },
    { date: "2023-04", rate: 22 },
    { date: "2023-05", rate: 25 },
    { date: "2023-06", rate: 24 },
    { date: "2023-07", rate: 26 },
    { date: "2023-08", rate: 27 },
    { date: "2023-09", rate: 26 },
    { date: "2023-10", rate: 28 },
    { date: "2023-11", rate: 30 },
    { date: "2023-12", rate: 32 },
  ];

  const sourceData = [
    { name: "Direct", value: 35 },
    { name: "Social Media", value: 25 },
    { name: "Referral", value: 20 },
    { name: "Search", value: 15 },
    { name: "Other", value: 5 },
  ];

  return {
    subscriberData,
    conversionData,
    sourceData,
  };
};

const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];

const Analytics = () => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("all");
  
  const { data: forms, isLoading: isFormsLoading } = useQuery({
    queryKey: ['/api/forms'],
  });

  const [selectedFormId, setSelectedFormId] = useState<string>("all");

  // In a real app, this would be a query to your analytics API
  const mockAnalytics = generateMockAnalytics();
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track the performance of your waitlist forms.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <div className="w-40">
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
          <div className="w-32">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscribers Growth</CardTitle>
            <CardDescription>Total signups over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={mockAnalytics.subscriberData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Subscribers"
                    stroke="#4F46E5"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Percentage of visitors who sign up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockAnalytics.conversionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="rate"
                    name="Conversion Rate %"
                    fill="#0EA5E9"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your subscribers come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockAnalytics.sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockAnalytics.sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Subscriber Engagement</CardTitle>
            <CardDescription>How subscribers interact with your forms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <p className="text-muted-foreground">
                Detailed engagement analytics coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
