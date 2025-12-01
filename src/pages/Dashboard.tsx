import { Sidebar } from "@/components/dashboard/Sidebar";
import { UploadPanel } from "@/components/dashboard/UploadPanel";
import { GeneratedImage, ResultsGallery } from "@/components/dashboard/ResultsGallery";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Search, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("spijker-history");
    if (saved) {
      try {
        setImages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("spijker-history", JSON.stringify(images.slice(0, 50)));
  }, [images]);

  const handleGenerate = async (data: any) => {
    setIsGenerating(true);
    setProgress(0);
    setStatus("Initializing...");

    // Simulate generation process
    try {
      // Step 1: Uploading
      setStatus("Uploading assets...");
      await new Promise(r => setTimeout(r, 1000));
      setProgress(20);

      // Step 2: Processing
      setStatus("Processing with n8n workflow...");
      await new Promise(r => setTimeout(r, 1500));
      setProgress(45);

      // Step 3: Generating
      setStatus("Generating variations (this may take a moment)...");
      await new Promise(r => setTimeout(r, 2000));
      setProgress(80);

      // Step 4: Finalizing
      setStatus("Finalizing and saving to Drive...");
      await new Promise(r => setTimeout(r, 1000));
      setProgress(100);

      // Mock result
      const newImages: GeneratedImage[] = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + "-" + i,
        url: `https://picsum.photos/seed/${Date.now() + i}/800/800`, // Placeholder
        timestamp: Date.now(),
        prompt: data.description || "Generated Image",
      }));

      setImages(prev => [...newImages, ...prev]);
      toast.success("Generation complete!");
    } catch (error) {
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
      setStatus("");
      setProgress(0);
    }
  };

  const handleDelete = (ids: string[]) => {
    setImages(prev => prev.filter(img => !ids.includes(img.id)));
    toast.success(`Deleted ${ids.length} images`);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Sidebar />
      
      <div className="md:pl-64 flex flex-col min-h-screen transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 md:hidden">
            <span className="font-bold text-primary">SpijkerAI</span>
          </div>
          <div className="hidden md:flex items-center text-muted-foreground text-sm">
            Dashboard / New Generation
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Upload */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-6">
              <UploadPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border rounded-xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-primary">{status}</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Estimated time remaining: {Math.max(0, Math.ceil((100 - progress) / 10))}s
                  </p>
                </motion.div>
              )}

              <ResultsGallery images={images} onDelete={handleDelete} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}