import { Sidebar } from "@/components/dashboard/Sidebar";
import { UploadPanel } from "@/components/dashboard/UploadPanel";
import { GeneratedImage, ResultsGallery } from "@/components/dashboard/ResultsGallery";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, ArrowRight, Sparkles, Image as ImageIcon, History, Menu, Sun, Moon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const [view, setView] = useState("dashboard"); // dashboard, generate, history
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Theme toggle logic
  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

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
      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "hidden md:block fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 ease-in-out overflow-hidden border-r bg-sidebar",
          isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full opacity-0"
        )}
      >
        <Sidebar activeView={view} onNavigate={setView} className="border-none" />
      </div>
      
      <div 
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          isSidebarOpen ? "md:pl-64" : "md:pl-0"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Desktop Sidebar Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex text-muted-foreground hover:text-foreground"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </Button>

            {/* Mobile Sidebar Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <Sidebar activeView={view} onNavigate={setView} className="border-none" />
              </SheetContent>
            </Sheet>

            {/* Back Button */}
            {view !== "dashboard" && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setView("dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            )}

            <div className="hidden md:flex items-center text-muted-foreground text-sm">
              {view === "dashboard" && "Dashboard"}
              {view === "generate" && "Dashboard / New Generation"}
              {view === "history" && "Dashboard / History"}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          
          {/* Dashboard Home View */}
          {view === "dashboard" && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome back, {user?.name?.split(' ')[0] || "User"}</h1>
                <p className="text-muted-foreground">Ready to create something amazing today?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-primary to-primary/90 text-white border-none shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="h-24 w-24" />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      New Generation
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                      Create new image variations from your assets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="secondary" 
                      className="w-full font-semibold"
                      onClick={() => setView("generate")}
                    >
                      Start Creating
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <History className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      You have generated {images.length} images so far
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setView("history")}
                    >
                      View History
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <ImageIcon className="h-5 w-5" />
                      Gallery
                    </CardTitle>
                    <CardDescription>
                      Manage your generated assets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setView("history")} // Reusing history view for now as gallery
                    >
                      Open Gallery
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary">Recent Generations</h2>
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.slice(0, 5).map((img) => (
                      <div key={img.id} className="aspect-square rounded-lg overflow-hidden border bg-muted">
                        <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                    <p className="text-muted-foreground">No recent generations found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generate View */}
          {view === "generate" && (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Upload - Increased size */}
              <div className="lg:col-span-5 xl:col-span-5 space-y-6">
                <UploadPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
              </div>

              {/* Right Column: Results - Decreased size */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-6">
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
          )}

          {/* History View (Reusing ResultsGallery for now) */}
          {view === "history" && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-primary">Generation History</h2>
              </div>
              <ResultsGallery images={images} onDelete={handleDelete} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}