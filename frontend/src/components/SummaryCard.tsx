import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
}: Props) {
  return (
    <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            iconBg
          )}
        >
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-foreground/80 truncate">{title}</p>
          <p className="text-2xl font-bold text-foreground truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
