import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    label: string;
  };
  valueColor?: string;
  changeColor?: string;
  onClick?: () => void;
}

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  valueColor = "text-gray-900",
  changeColor = "text-green-600",
  onClick
}: StatsCardProps) => {
  const formatPercentage = (value?: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '0%';
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <Card
      onClick={onClick}
      className={onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor}`}>
          {value}
        </div>
        {change && (
          <p className="text-xs text-muted-foreground">
            <span className={changeColor}>
              {formatPercentage(change.value)}
            </span> {change.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}; 