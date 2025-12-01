import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { History, Home, Image as ImageIcon, Settings, Sparkles } from "lucide-react";
import { useState } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const [active, setActive] = useState("generate");

  return (
    <div className={cn("pb-12 w-64 border-r bg-sidebar h-screen hidden md:block fixed left-0 top-0 z-30", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-4 mb-8">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-primary">
              Spijker<span className="text-secondary">AI</span>
            </h2>
          </div>
          <div className="space-y-1">
            <Button
              variant={active === "generate" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActive("generate")}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Generate
            </Button>
            <Button
              variant={active === "history" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActive("history")}
            >
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
            <Button
              variant={active === "settings" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActive("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
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
      </div>
    </div>
  );
}
