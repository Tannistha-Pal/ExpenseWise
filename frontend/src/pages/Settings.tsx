import { useAppContext } from "@/contexts/AppContext";
import { CURRENCIES } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Globe } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function SettingsPage() {
  const { currency, setCurrency } = useAppContext();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>
        <ThemeToggle />
      </div>

      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Currency</CardTitle>
              <CardDescription>Choose your preferred display currency</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="currency">Display Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" className="w-full sm:w-72 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} — {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will update all monetary values across the app.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <SettingsIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">General</CardTitle>
              <CardDescription>App preferences and customization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">More settings coming soon — theme, notifications, export data, and more.</p>
        </CardContent>
      </Card>
    </div>
  );
}
