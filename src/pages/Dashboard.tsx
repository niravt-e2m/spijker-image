import { Sidebar } from "@/components/dashboard/Sidebar";
import { UploadPanel } from "@/components/dashboard/UploadPanel";
import { GeneratedImage, ResultsGallery } from "@/components/dashboard/ResultsGallery";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, ArrowRight, Sparkles, Image as ImageIcon, History, Menu, Sun, Moon, PanelLeftClose, PanelLeftOpen, Copy, Check, ExternalLink } from "lucide-react";
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
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [driveLink, setDriveLink] = useState<string | null>(null);

  // Theme toggle logic - Default to dark mode
  useEffect(() => {
    setTheme("dark");
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
    // Handle start of generation
    if (data.isStarting) {
      setIsGenerating(true);
      setProgress(10);
      setStatus("Processing with n8n workflow... This may take up to 10 minutes");
      return;
    }

    // Handle error
    if (data.error) {
      setIsGenerating(false);
      setProgress(0);
      setStatus("");
      return;
    }

    try {
      setProgress(50);
      setStatus("Processing with n8n workflow... This may take up to 10 minutes");
      
      // If we have webhook result, proceed to fetch images
      if (data.webhookResult && data.webhookResult.resultUrl) {
        setProgress(70);
        setStatus("Fetching generated images from Google Drive...");
      }

      // Check if webhook returned results with Google Drive folder
      if (data.webhookResult && data.webhookResult.resultUrl) {
        const folderUrl = data.webhookResult.resultUrl;
        
        // Store the Drive link for display
        setDriveLink(folderUrl);
        
        // Show the Drive link to user
        toast.success(
          <div className="flex flex-col gap-2">
            <p>Processing complete! Drive folder created.</p>
            <a 
              href={folderUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              Open in Drive <ExternalLink className="h-3 w-3" />
            </a>
          </div>,
          { duration: 10000 }
        );
        
        // Extract folder ID from URL
        const folderIdMatch = folderUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
        
        if (folderIdMatch) {
          const folderId = folderIdMatch[1];
          
          // Get Google API key from environment variable
          const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
          
          if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            toast.error("Google API key not configured. Please add VITE_GOOGLE_DRIVE_API_KEY to .env.local");
            setIsGenerating(false);
            return;
          }

          // Fetch images from Google Drive
          const driveResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType,thumbnailLink)`
          );

          if (!driveResponse.ok) {
            throw new Error("Failed to fetch images from Google Drive");
          }

          const driveData = await driveResponse.json();
          
          // Process Drive files into images
          const newImages: GeneratedImage[] = driveData.files
            .filter((file: any) => file.mimeType.startsWith('image/'))
            .map((file: any) => ({
              id: file.id,
              url: `https://drive.google.com/uc?export=view&id=${file.id}`,
              timestamp: Date.now(),
              prompt: data.description || "Generated Image",
              name: file.name,
              driveUrl: `https://drive.google.com/file/d/${file.id}/view`,
              folderId: folderId,
            }));

          setImages(prev => [...newImages, ...prev]);
          setProgress(100);
          toast.success(`Generated ${newImages.length} images successfully!`);
        } else {
          throw new Error("Could not extract folder ID from result URL");
        }
      } else {
        throw new Error("No result URL received from webhook");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Generation failed. Please try again.");
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
      {/* Top Header Bar - Full Width with Logo */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 h-16 items-center justify-between bg-background dark:bg-[#313133] border-b border-sidebar-border">
        <div className="flex items-center gap-6 px-6">
          {/* Logo - Smaller size */}
          <img 
            src="https://harmless-tapir-303.convex.cloud/api/storage/a16f5f1d-198f-400b-9015-cd0deb4b29d1" 
            alt="Spijker en Co" 
            className="h-5 w-auto object-contain invert dark:invert-0 transition-all"
          />


        </div>
        
        <div className="flex items-center gap-4 px-6">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Desktop Sidebar - Starts below header */}
      <div 
        className={cn(
          "hidden md:block fixed left-0 bottom-0 top-16 z-30 transition-all duration-300 ease-in-out overflow-hidden border-r bg-sidebar",
          isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full opacity-0"
        )}
      >
        <Sidebar activeView={view} onNavigate={setView} className="border-none" />
      </div>

      {/* Sidebar Toggle Button - Attached to sidebar edge */}
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn(
          "hidden md:flex fixed top-20 z-50 text-muted-foreground hover:text-foreground bg-background border rounded-r-md rounded-l-none shadow-sm transition-all duration-300 ease-in-out",
          isSidebarOpen ? "left-64" : "left-0"
        )}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
      </Button>
      
      <div 
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out pt-16",
          isSidebarOpen ? "md:pl-64" : "md:pl-0"
        )}
      >
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <div className="flex items-center gap-2 px-6 py-4 border-b">
                  <img 
                    src="https://harmless-tapir-303.convex.cloud/api/storage/a16f5f1d-198f-400b-9015-cd0deb4b29d1" 
                    alt="Spijker en Co" 
                    className="h-8 w-auto object-contain invert dark:invert-0 transition-all"
                  />
                </div>
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
                Back
              </Button>
            )}
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
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-2"
              >
                <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back, {user?.name?.split(' ')[0] || "User"}</h1>
                <p className="text-muted-foreground">Ready to create something amazing today?</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <Card className="bg-gradient-to-br from-[#68074F] to-[#68074F]/90 text-white border-none shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="h-24 w-24" />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Sparkles className="h-5 w-5" />
                      New Generation
                    </CardTitle>
                    <CardDescription className="text-white/80">
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
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
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-primary">Recent Generations</h2>
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.slice(0, 5).map((img, index) => (
                      <motion.div 
                        key={img.id} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        className="aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer"
                      >
                        <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                    <p className="text-muted-foreground">No recent generations found</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
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
                {/* Drive Link Display */}
                {driveLink && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white mb-1">Google Drive Folder</p>
                        <p className="text-xs text-muted-foreground truncate">{driveLink}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(driveLink);
                            toast.success("Link copied to clipboard!");
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <a href={driveLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="secondary" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open
                          </Button>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}

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
                      This may take up to 10 minutes. Please wait...
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
                <h2 className="text-2xl font-bold text-white">Generation History</h2>
              </div>
              <ResultsGallery images={images} onDelete={handleDelete} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}