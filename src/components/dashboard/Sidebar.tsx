import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { History, Home, Image as ImageIcon, Sparkles } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeView: string;
  onNavigate: (view: string) => void;
  collapsed?: boolean;
}

export function Sidebar({ className, activeView, onNavigate, collapsed = false }: SidebarProps) {
  return (
    <div className={cn("pb-12 border-r bg-sidebar h-full transition-all duration-300", className)}>
      <div className="space-y-4 py-4">
        <div className={cn("px-3 py-2 transition-all duration-300", collapsed ? "px-2" : "px-3")}>
          <div className={cn("flex items-center gap-2 mb-8 transition-all duration-300", collapsed ? "justify-center px-0" : "px-4")}>
            <img 
              src="https://harmless-tapir-303.convex.cloud/api/storage/a16f5f1d-198f-400b-9015-cd0deb4b29d1" 
              alt="Spijker en Co" 
              className={cn(
                "object-contain invert dark:invert-0 transition-all duration-300",
                collapsed ? "h-6 w-auto" : "h-8 w-auto"
              )}
            />
          </div>
          <div className="space-y-1">
            <Button
              variant={activeView === "dashboard" ? "secondary" : "ghost"}
              className={cn("w-full justify-start transition-all", collapsed && "justify-center px-2")}
              onClick={() => onNavigate("dashboard")}
              title="Dashboard"
            >
              <Home className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && "Dashboard"}
            </Button>
            <Button
              variant={activeView === "generate" ? "secondary" : "ghost"}
              className={cn("w-full justify-start transition-all", collapsed && "justify-center px-2")}
              onClick={() => onNavigate("generate")}
              title="Generate"
            >
              <ImageIcon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && "Generate"}
            </Button>
            <Button
              variant={activeView === "history" ? "secondary" : "ghost"}
              className={cn("w-full justify-start transition-all", collapsed && "justify-center px-2")}
              onClick={() => onNavigate("history")}
              title="History"
            >
              <History className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && "History"}
            </Button>
          </div>
        </div>
        
        {!collapsed && (
          <div className="px-3 py-2 animate-in fade-in duration-300">
            <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
              Recent Generations
            </h2>
            <ScrollArea className="h-[300px] px-1">
              <div className="space-y-1 p-2">
                {[1, 2, 3].map((i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    className="w-full justify-start font-normal text-xs h-auto py-2"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-medium">Project Alpha {i}</span>
                      <span className="text-muted-foreground">2 hours ago</span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}