import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { PlusCircle, Edit, Zap, MessageSquare } from "lucide-react";

interface Activity {
  id: number;
  type: string;
  data: any;
  createdAt: string;
  userId: number;
  formId?: number;
  subscriberId?: number;
}

interface RecentActivityProps {
  activities: Activity[];
  isLoading: boolean;
}

const RecentActivity = ({ activities, isLoading }: RecentActivityProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "new_subscriber":
        return (
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
            <PlusCircle className="h-5 w-5 text-green-600" />
          </span>
        );
      case "form_updated":
        return (
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
            <Edit className="h-5 w-5 text-blue-600" />
          </span>
        );
      case "form_created":
        return (
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
            <Edit className="h-5 w-5 text-blue-600" />
          </span>
        );
      case "sdk_integrated":
        return (
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100">
            <Zap className="h-5 w-5 text-indigo-600" />
          </span>
        );
      case "message":
        return (
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-100">
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
            <PlusCircle className="h-5 w-5 text-gray-600" />
          </span>
        );
    }
  };

  const getActivityTitle = (activity: Activity) => {
    switch (activity.type) {
      case "new_subscriber":
        return "New subscriber joined";
      case "form_updated":
        return "Form updated";
      case "form_created":
        return "New form created";
      case "sdk_integrated":
        return "SDK integrated";
      case "message":
        return "New message";
      default:
        return "Activity";
    }
  };

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case "new_subscriber":
        return (
          <>
            <span>{activity.data?.email || "A subscriber"}</span> subscribed to <span className="font-medium">{activity.data?.formName || "your form"}</span>
          </>
        );
      case "form_updated":
        return (
          <>
            You updated the form <span className="font-medium">{activity.data?.formName || "your form"}</span>
          </>
        );
      case "form_created":
        return (
          <>
            You created a new form: <span className="font-medium">{activity.data?.formName || "new form"}</span>
          </>
        );
      case "sdk_integrated":
        return (
          <>
            SDK was successfully integrated with <span className="font-medium">{activity.data?.website || "your website"}</span>
          </>
        );
      case "message":
        return (
          <>
            <span className="font-medium">{activity.data?.subscriber || "A subscriber"}</span> replied to your welcome message
          </>
        );
      default:
        return "New activity on your account";
    }
  };

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No activity yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="p-4 hover:bg-gray-50">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getActivityTitle(activity)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getActivityDescription(activity)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {activities.length > 0 && (
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <a href="/subscribers" className="text-sm font-medium text-primary hover:text-indigo-700">View all activity <span aria-hidden="true">&rarr;</span></a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
