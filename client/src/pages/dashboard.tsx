import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import StatsCard from "@/components/dashboard/stats-card";
import RecentActivity from "@/components/dashboard/recent-activity";
import SdkPreview from "@/components/dashboard/sdk-preview";
import IntegrationCode from "@/components/dashboard/integration-code";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useLocation } from "wouter";

const Dashboard = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: stats, isLoading: isStatsLoading, error: statsError } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    retry: 2,
  });

  const { data: forms, isLoading: isFormsLoading, error: formsError } = useQuery({
    queryKey: ['/api/forms'],
    retry: 2,
  });

  const { data: activities, isLoading: isActivitiesLoading, error: activitiesError } = useQuery({
    queryKey: ['/api/activities'],
    retry: 2,
  });

  useEffect(() => {
    if (statsError) {
      toast({
        title: "Error loading dashboard data",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  }, [statsError, toast]);

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your data is being prepared for download",
    });
  };

  const handleNewForm = () => {
    navigate("/integration");
  };

  const selectedForm = forms && forms.length > 0 ? forms[0] : null;

  return (
    <div>
      {/* Dashboard tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="overview">
            <TabsList className="flex overflow-x-auto">
              <TabsTrigger value="overview" className="px-4 py-4 text-sm font-medium whitespace-nowrap focus:outline-none">
                Overview
              </TabsTrigger>
              <TabsTrigger value="sdk-configuration" className="px-4 py-4 text-sm font-medium whitespace-nowrap focus:outline-none">
                SDK Configuration
              </TabsTrigger>
              <TabsTrigger value="form-designer" className="px-4 py-4 text-sm font-medium whitespace-nowrap focus:outline-none">
                Form Designer
              </TabsTrigger>
              <TabsTrigger value="integrate" className="px-4 py-4 text-sm font-medium whitespace-nowrap focus:outline-none">
                Integrate
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your waitlist, customize forms, and track subscriber growth.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button variant="outline" onClick={handleExport} className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleNewForm} className="ml-3 flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Form
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard 
            title="Total Subscribers"
            value={isStatsLoading ? "Loading..." : stats?.totalSubscribers.toString() || "0"}
            icon="users"
            change={12.5}
            changeType="increase"
            color="indigo"
          />
          <StatsCard 
            title="This Month"
            value={isStatsLoading ? "Loading..." : stats?.thisMonth.toString() || "0"}
            icon="clock"
            change={8.2}
            changeType="increase"
            color="green"
          />
          <StatsCard 
            title="Conversion Rate"
            value={isStatsLoading ? "Loading..." : `${stats?.conversionRate.toString() || "0"}%`}
            icon="percentage"
            change={1.5}
            changeType="decrease"
            color="yellow"
          />
          <StatsCard 
            title="Active Forms"
            value={isStatsLoading ? "Loading..." : stats?.activeForms.toString() || "0"}
            icon="layout"
            color="blue"
          />
        </div>

        {/* Recent activity and SDK preview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent activity */}
          <div className="lg:col-span-2">
            <RecentActivity 
              activities={activities || []} 
              isLoading={isActivitiesLoading}
            />
          </div>

          {/* SDK preview */}
          <div className="lg:col-span-1 space-y-6">
            <SdkPreview form={selectedForm} isLoading={isFormsLoading} />
            <IntegrationCode formId={selectedForm?.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
