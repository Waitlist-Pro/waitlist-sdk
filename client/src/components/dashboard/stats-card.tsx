import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, Users, Clock, PercentIcon, LayoutIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: "users" | "clock" | "percentage" | "layout";
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  color: "indigo" | "green" | "yellow" | "blue";
}

const StatsCard = ({
  title,
  value,
  icon,
  change,
  changeType = "neutral",
  color,
}: StatsCardProps) => {
  const getIcon = (): ReactNode => {
    const iconClasses = "h-6 w-6";
    
    switch (icon) {
      case "users":
        return <Users className={iconClasses} />;
      case "clock":
        return <Clock className={iconClasses} />;
      case "percentage":
        return <PercentIcon className={iconClasses} />;
      case "layout":
        return <LayoutIcon className={iconClasses} />;
      default:
        return <Users className={iconClasses} />;
    }
  };

  const getBgColor = (): string => {
    switch (color) {
      case "indigo":
        return "bg-indigo-100";
      case "green":
        return "bg-green-100";
      case "yellow":
        return "bg-yellow-100";
      case "blue":
        return "bg-blue-100";
      default:
        return "bg-indigo-100";
    }
  };

  const getTextColor = (): string => {
    switch (color) {
      case "indigo":
        return "text-primary";
      case "green":
        return "text-green-600";
      case "yellow":
        return "text-yellow-600";
      case "blue":
        return "text-blue-500";
      default:
        return "text-primary";
    }
  };

  const getChangeColor = (): string => {
    if (changeType === "increase") return "text-green-600";
    if (changeType === "decrease") return "text-red-600";
    return "text-gray-600";
  };

  const getChangeIcon = (): ReactNode => {
    if (changeType === "increase") {
      return <ArrowUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" />;
    }
    if (changeType === "decrease") {
      return <ArrowDownIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500" />;
    }
    return null;
  };

  return (
    <Card className="bg-white overflow-hidden shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${getBgColor()} rounded-md p-3`}>
            <div className={getTextColor()}>{getIcon()}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor()}`}>
                  {getChangeIcon()}
                  <span className="sr-only">{changeType === "increase" ? "Increased by" : "Decreased by"}</span>
                  {change}%
                </div>
              )}
            </dd>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
