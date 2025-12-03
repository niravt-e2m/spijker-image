import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { History, Home, Image as ImageIcon, Trash2, AlertTriangle } from "lucide-react";
import { supabase, ImageGeneration } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeView: string;
  onNavigate: (view: string) => void;
  onSessionSelect?: (session: ImageGeneration) => void;
  refreshTrigger?: number;
}

export function Sidebar({ className, activeView, onNavigate, onSessionSelect, refreshTrigger }: SidebarProps) {
  const [sessions, setSessions] = useState<ImageGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  // Refresh sessions when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      loadSessions();
    }
  }, [refreshTrigger]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      console.log("📥 Loading sessions from Supabase...");
      const data = await supabase.fetchSessions();
      console.log("✅ Loaded sessions:", data.length, "sessions");
      console.log("Sessions data:", data);
      setSessions(data);
    } catch (error) {
      console.error("❌ Failed to load sessions:", error);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (sessionId: string, sessionName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete({ id: sessionId, name: sessionName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;
    
    try {
      await supabase.deleteSession(sessionToDelete.id);
      setSessions(prev => prev.filter(s => s.session_id !== sessionToDelete.id));
      toast.success("Session deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete session");
    } finally {
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };



  return (
    <div className={cn("pb-12 w-80 border-r bg-sidebar h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant={activeView === "dashboard" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start transition-all duration-300 group relative overflow-hidden",
                activeView === "dashboard" 
                  ? "bg-[#f0826a] text-white shadow-lg shadow-[#f0826a]/30" 
                  : "hover:bg-[#f0826a]/90 hover:text-white hover:shadow-md hover:shadow-[#f0826a]/20"
              )}
              onClick={() => onNavigate("dashboard")}
            >
              <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300 relative z-10" />
              <span className="relative z-10">Dashboard</span>
              {activeView !== "dashboard" && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
            </Button>
            <Button
              variant={activeView === "generate" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start transition-all duration-300 group relative overflow-hidden",
                activeView === "generate" 
                  ? "bg-[#f0826a] text-white shadow-lg shadow-[#f0826a]/30" 
                  : "hover:bg-[#f0826a]/90 hover:text-white hover:shadow-md hover:shadow-[#f0826a]/20"
              )}
              onClick={() => onNavigate("generate")}
            >
              <ImageIcon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300 relative z-10" />
              <span className="relative z-10">Generate</span>
              {activeView !== "generate" && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
            </Button>
            <Button
              variant={activeView === "history" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start transition-all duration-300 group relative overflow-hidden",
                activeView === "history" 
                  ? "bg-[#f0826a] text-white shadow-lg shadow-[#f0826a]/30" 
                  : "hover:bg-[#f0826a]/90 hover:text-white hover:shadow-md hover:shadow-[#f0826a]/20"
              )}
              onClick={() => {
                onNavigate("history");
              }}
            >
              <History className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300 relative z-10" />
              <span className="relative z-10">History</span>
              {activeView !== "history" && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
            Recent Generations
          </h2>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {loading ? (
                <div className="text-center py-4 text-xs text-muted-foreground">Loading...</div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">No history yet</div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-2 w-full bg-sidebar-accent/30 rounded-lg p-1 hover:bg-[#f0826a]/15 transition-all duration-300 hover:shadow-md hover:shadow-[#f0826a]/20 hover:border hover:border-[#f0826a]/30 group cursor-pointer"
                  >
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start font-normal text-xs h-8 min-w-0 hover:bg-transparent px-2 overflow-hidden group-hover:text-[#f0826a] transition-colors duration-300"
                      onClick={() => onSessionSelect?.(session)}
                    >
                      <span className="font-medium truncate block text-left w-full group-hover:translate-x-1 transition-transform duration-300">
                        {(session.session_name || session.session_id).replace(/^=/, '')}
                      </span>
                    </Button>
                    <button
                      className="h-8 w-8 shrink-0 flex items-center justify-center rounded-md bg-red-500/10 text-red-400/70 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/20 hover:border-red-500 hover:scale-110 hover:shadow-lg hover:shadow-red-500/30"
                      onClick={(e) => {
                        handleDeleteClick(session.session_id, (session.session_name || session.session_id).replace(/^=/, ''), e);
                      }}
                      title="Delete session"
                    >
                      <Trash2 className="h-4 w-4 hover:rotate-12 transition-transform duration-300" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <AlertDialogTitle className="text-xl">Delete Session</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{sessionToDelete?.name}"</span>?
              <br />
              <br />
              This will permanently delete the session from the database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}