import { Sidebar } from "@/components/dashboard/Sidebar";
import { UploadPanel } from "@/components/dashboard/UploadPanel";
import { GeneratedImage, ResultsGallery } from "@/components/dashboard/ResultsGallery";
import { Button } from "@/components/ui/button";
import { supabase, ImageGeneration } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, ArrowRight, Sparkles, Image as ImageIcon, History, Menu, Sun, Moon, PanelLeftClose, PanelLeftOpen, Copy, Check, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Helper function to clean Drive URLs (remove leading '=' from Excel/CSV exports)
const cleanDriveUrl = (url: string | null): string | null => {
  if (!url) return null;
  const cleaned = url.trim();
  return cleaned.startsWith('=') ? cleaned.substring(1) : cleaned;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [view, setView] = useState("dashboard"); // dashboard, generate, history
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [refreshSessions, setRefreshSessions] = useState(0);
  const [currentSessionName, setCurrentSessionName] = useState<string>("");

  // Debug: Log images state changes
  useEffect(() => {
    console.log("📸 Images state updated:", images.length, "images");
    console.log("Images:", images.map(img => ({ id: img.id, name: img.name })));
  }, [images]);

  // Theme toggle logic - Default to dark mode
  useEffect(() => {
    setTheme("dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

  // Don't load from localStorage on mount - we use Supabase for history
  // Images should only appear when:
  // 1. User generates new images
  // 2. User clicks a session in the sidebar

  // Clear images when navigating to generate view (for fresh start)
  useEffect(() => {
    if (view === "generate" && images.length > 0 && !isGenerating) {
      // Only clear if we're not in the middle of generating
      // This prevents clearing during active generation
      const hasRecentGeneration = images.some(img => Date.now() - img.timestamp < 60000); // Within last minute
      if (!hasRecentGeneration) {
        console.log("Clearing old images on generate view");
        setImages([]);
        setDriveLink(null);
      }
    }
    
    // Load all images when navigating to history view
    if (view === "history") {
      loadAllImages();
    }
  }, [view]);

  const handleGenerate = async (data: any) => {
    // Handle start of generation
    if (data.isStarting) {
      // Clear previous generation data completely
      setImages([]);
      setDriveLink(null);
      setStatus("");
      
      setIsGenerating(true);
      setShowUrlInput(false);
      setStatus("Processing with n8n workflow... Please wait");
      
      // Create session in Supabase with a default name
      try {
        const sessionId = `session_${Date.now()}`;
        // Use provided name, or reference image name, or timestamp
        const sessionName = data.name 
          ? data.name
          : data.image 
            ? data.image.name.replace(/\.[^/.]+$/, '') // Remove file extension
            : `Generation ${new Date().toLocaleString()}`;
        setCurrentSessionName(sessionName); // Store for later use
        await supabase.createSession({
          session_id: sessionId,
          name: sessionName,
          session_name: sessionName,
          folder_id: "",
          folder_url: null,
          reference_image_url: data.image ? URL.createObjectURL(data.image) : null,
          status: 'processing',
          total_images: 8,
          generated_count: 0,
        });
        console.log("Created session:", sessionId, "with name:", defaultName);
        // Trigger sidebar refresh
        setRefreshSessions(prev => prev + 1);
      } catch (error) {
        console.error("Failed to create session:", error);
      }
      
      return;
    }

    // Handle network timeout (not an error, just need manual URL)
    if (data.networkTimeout) {
      setShowUrlInput(true);
      setStatus("n8n is still processing... Paste the Drive folder URL when ready");
      return;
    }

    // Handle error
    if (data.error) {
      setIsGenerating(false);
      setShowUrlInput(false);
      setStatus("");
      return;
    }

    try {
      // Check if webhook returned results with Google Drive folder
      if (data.webhookResult && data.webhookResult.resultUrl) {
        // Remove leading '=' if present (Excel/CSV export issue)
        let folderUrl = data.webhookResult.resultUrl.trim();
        if (folderUrl.startsWith('=')) {
          folderUrl = folderUrl.substring(1);
        }
        
        // Store the Drive link for display
        setDriveLink(folderUrl);
        
        // Extract folder ID from URL
        const folderIdMatch = folderUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
        
        if (!folderIdMatch) {
          throw new Error("Could not extract folder ID from result URL");
        }
        
        const folderId = folderIdMatch[1];
        
        // Update session with folder info
        try {
          const sessions = await supabase.fetchSessions();
          const processingSession = sessions.find(s => s.status === 'processing');
          if (processingSession) {
            await supabase.updateSession(processingSession.session_id, {
              folder_id: folderId,
              folder_url: folderUrl,
            });
          }
        } catch (error) {
          console.error("Failed to update session:", error);
        }
        
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
        const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
        
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
          console.error("❌ Google Drive API key not configured");
          toast.error("Google API key not configured. Please add VITE_GOOGLE_DRIVE_API_KEY to .env.local", { duration: 10000 });
          setIsGenerating(false);
          return;
        }
        
        console.log("✅ Using API key:", apiKey.substring(0, 10) + "...");
        console.log("📁 Folder ID:", folderId);

        // If shouldPoll flag is set, start polling
        if (data.shouldPoll) {
          setStatus("Waiting for n8n to generate images... Checking every 30 seconds");
          
          let attempts = 0;
          const maxAttempts = 20; // 20 * 30s = 10 minutes
          
          const pollForImages = async () => {
            attempts++;
            console.log(`Polling attempt ${attempts}/${maxAttempts} for folder ${folderId}`);
            
            try {
              const driveResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink,iconLink,size)&pageSize=100`
              );

              if (!driveResponse.ok) {
                const errorText = await driveResponse.text();
                console.error("Drive API error:", driveResponse.status, errorText);
                
                if (driveResponse.status === 403) {
                  toast.error("Google Drive API access denied. Check your API key and permissions.", { duration: 8000 });
                  throw new Error("Drive API: Access denied (403). Check API key and enable Google Drive API in Google Cloud Console.");
                } else if (driveResponse.status === 404) {
                  toast.error("Folder not found. Check if the folder ID is correct.", { duration: 8000 });
                  throw new Error("Drive API: Folder not found (404)");
                } else {
                  toast.error(`Drive API error: ${driveResponse.status}`, { duration: 8000 });
                  throw new Error(`Failed to fetch from Google Drive: ${driveResponse.status}`);
                }
              }

              const driveData = await driveResponse.json();
              console.log("=== Drive API Response ===");
              console.log("Full response:", driveData);
              console.log("Total files in folder:", driveData.files?.length || 0);
              console.log("All files:", driveData.files);
              
              const imageFiles = driveData.files?.filter((file: any) => {
                console.log(`File: ${file.name}, MimeType: ${file.mimeType}, Starts with image: ${file.mimeType?.startsWith('image/')}`);
                return file.mimeType?.startsWith('image/');
              }) || [];
              
              console.log(`✅ Found ${imageFiles.length} image files out of ${driveData.files?.length || 0} total files`);
              console.log("Image files details:", imageFiles);
              
              if (imageFiles.length > 0) {
                // Images found!
                const newImages: GeneratedImage[] = imageFiles.map((file: any) => {
                  // Try using webContentLink if available
                  const imageUrl = file.webContentLink 
                    ? file.webContentLink.replace('&export=download', '')
                    : `https://lh3.googleusercontent.com/d/${file.id}=w1000`;
                  
                  console.log(`Image ${file.name}:`, {
                    id: file.id,
                    usingUrl: imageUrl
                  });
                  
                  // Check if file has webContentLink (indicates it's publicly accessible)
                  if (!file.webContentLink && !file.thumbnailLink) {
                    console.warn(`⚠️ File ${file.name} may not be publicly accessible`);
                  }
                  
                  return {
                    id: file.id,
                    url: imageUrl,
                    timestamp: Date.now(),
                    prompt: currentSessionName || data.description || "Generated Image",
                    name: file.name,
                    driveUrl: `https://drive.google.com/file/d/${file.id}/view`,
                    folderId: folderId,
                  };
                });

                console.log(`✅ Found ${newImages.length} images, updating gallery`);
                console.log("Image URLs:", newImages.map(img => ({ name: img.name, url: img.url, id: img.id })));
                console.log("📊 Current state - Images in gallery:", newImages.length);
                
                // Check if any files lack public access indicators
                const hasAccessIssues = imageFiles.some((f: any) => !f.webContentLink && !f.thumbnailLink);
                if (hasAccessIssues) {
                  toast.warning(
                    "Some images may not load. Ensure the Google Drive folder is set to 'Anyone with the link can view'",
                    { duration: 8000 }
                  );
                }
                
                // Update images (replace with ALL latest images from Drive)
                console.log(`🔄 Updating gallery with ${newImages.length} images`);
                setImages(newImages);
                setStatus(`Found ${imageFiles.length} images, checking for more...`);
                
                // Show toast for progress
                if (imageFiles.length < 8) {
                  toast.info(`Found ${imageFiles.length}/8 images so far...`, { duration: 3000 });
                }
                
                // Update session with current images
                try {
                  const sessions = await supabase.fetchSessions();
                  const processingSession = sessions.find(s => s.status === 'processing' && s.folder_id === folderId);
                  if (processingSession) {
                    const imageData = newImages.map(img => ({
                      id: img.id,
                      url: img.url,
                      name: img.name,
                      driveUrl: img.driveUrl,
                    }));
                    
                    await supabase.updateSession(processingSession.session_id, {
                      generated_count: imageFiles.length,
                      images: imageData,
                      status: imageFiles.length >= 8 ? 'completed' : 'processing',
                    });
                    // Trigger sidebar refresh after updating session
                    setRefreshSessions(prev => prev + 1);
                  }
                } catch (error) {
                  console.error("Failed to update session:", error);
                }
                
                // Continue polling to check if more images are being uploaded
                if (attempts < maxAttempts && imageFiles.length < 8) {
                  console.log(`⏳ Continuing to poll... Found ${imageFiles.length}/8 images`);
                  setTimeout(pollForImages, 30000); // Check again in 30 seconds
                } else {
                  // Max attempts reached or all images found, stop polling
                  console.log(`✅ Polling complete! Found ${imageFiles.length} images`);
                  setIsGenerating(false);
                  setStatus("");
                  toast.success(`Generated ${imageFiles.length} images successfully!`);
                  // Final refresh when generation completes
                  setRefreshSessions(prev => prev + 1);
                }
                return;
              }
              
              // No images yet
              if (attempts < maxAttempts) {
                setStatus(`Waiting for images... (checked ${attempts} times, will check ${maxAttempts - attempts} more times)`);
                setTimeout(pollForImages, 30000); // Check again in 30 seconds
              } else {
                throw new Error("Timeout: No images found after 10 minutes. Check the Drive folder manually.");
              }
            } catch (error) {
              console.error("Polling error:", error);
              if (attempts < maxAttempts) {
                // Retry on error
                setTimeout(pollForImages, 30000);
              } else {
                setIsGenerating(false);
                setStatus("");
                toast.error(error instanceof Error ? error.message : "Failed to fetch images");
              }
            }
          };
          
          // Start polling after 30 seconds
          setTimeout(pollForImages, 30000);
          return;
        }

        // Direct fetch (if not polling)
        setStatus("Fetching generated images from Google Drive...");
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
            url: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`,
            timestamp: Date.now(),
            prompt: data.description || "Generated Image",
            name: file.name,
            driveUrl: `https://drive.google.com/file/d/${file.id}/view`,
            folderId: folderId,
          }));

        setImages(prev => [...newImages, ...prev]);
        toast.success(`Generated ${newImages.length} images successfully!`);
      } else {
        throw new Error("No result URL received from webhook");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
      setStatus("");
    }
  };

  const handleDelete = (ids: string[]) => {
    setImages(prev => prev.filter(img => !ids.includes(img.id)));
    toast.success(`Deleted ${ids.length} images`);
  };

  const loadAllImages = async () => {
    try {
      toast.info("Loading all images from history...");
      const sessions = await supabase.fetchSessions();
      
      const allImages: GeneratedImage[] = [];
      
      for (const session of sessions) {
        if (session.images && session.images.length > 0) {
          const sessionImages: GeneratedImage[] = session.images.map((img: any) => ({
            id: img.id,
            url: img.url,
            timestamp: new Date(session.created_at).getTime(),
            prompt: session.session_name || session.name || session.session_id,
            name: img.name,
            driveUrl: img.driveUrl,
            folderId: session.folder_id,
          }));
          allImages.push(...sessionImages);
        }
      }
      
      setImages(allImages);
      toast.success(`Loaded ${allImages.length} images from ${sessions.length} sessions`);
    } catch (error) {
      console.error("Failed to load all images:", error);
      toast.error("Failed to load images from history");
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Top Header Bar - Full Width with Logo */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 h-16 items-center justify-between bg-background dark:bg-[#313133] border-b border-sidebar-border">
        <div className="flex items-center gap-6 px-6">
          {/* Logo - Smaller size */}
          <button 
            onClick={() => setView("dashboard")}
            className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
            aria-label="Go to dashboard"
          >
            <img 
              src="https://harmless-tapir-303.convex.cloud/api/storage/a16f5f1d-198f-400b-9015-cd0deb4b29d1" 
              alt="Spijker en Co" 
              className="h-5 w-auto object-contain invert dark:invert-0 transition-all"
            />
          </button>
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
          isSidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full opacity-0"
        )}
      >
        <Sidebar 
          activeView={view} 
          onNavigate={setView}
          refreshTrigger={refreshSessions}
          onSessionSelect={async (session) => {
            const cleanedUrl = cleanDriveUrl(session.folder_url);
            setDriveLink(cleanedUrl);
            setCurrentSessionName(session.session_name || session.name || session.session_id);
            
            // If session has images stored, load them
            if (session.images && session.images.length > 0) {
              const sessionImages: GeneratedImage[] = session.images.map((img: any) => ({
                id: img.id,
                url: img.url,
                timestamp: new Date(session.created_at).getTime(),
                prompt: session.session_name || session.name || session.session_id,
                name: img.name,
                driveUrl: img.driveUrl,
                folderId: session.folder_id,
              }));
              setImages(sessionImages);
            } 
            // If no images but has folder_id, fetch from Drive
            else if (session.folder_id && session.folder_url) {
              toast.info("Fetching images from Drive...");
              try {
                // Clean folder_id (remove leading '=' if present)
                const cleanFolderId = session.folder_id.trim().replace(/^=/, '');
                console.log("Fetching from folder:", cleanFolderId);
                
                const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
                const response = await fetch(
                  `https://www.googleapis.com/drive/v3/files?q='${cleanFolderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)&pageSize=100`
                );
                
                if (response.ok) {
                  const data = await response.json();
                  const imageFiles = data.files?.filter((f: any) => f.mimeType?.startsWith('image/')) || [];
                  
                  if (imageFiles.length > 0) {
                    console.log("📸 Image files from Drive:", imageFiles);
                    
                    const fetchedImages: GeneratedImage[] = imageFiles.map((file: any) => {
                      // Log what we got from Drive API
                      console.log(`File ${file.name}:`, {
                        id: file.id,
                        thumbnailLink: file.thumbnailLink,
                        webContentLink: file.webContentLink,
                        hasThumbnail: !!file.thumbnailLink,
                        hasWebContent: !!file.webContentLink
                      });
                      
                      // Try using the file's direct link if available, otherwise use thumbnail
                      const imageUrl = file.webContentLink 
                        ? file.webContentLink.replace('&export=download', '')
                        : `https://lh3.googleusercontent.com/d/${file.id}=w1000`;
                      
                      console.log(`Using URL for ${file.name}:`, imageUrl);
                      
                      return {
                        id: file.id,
                        url: imageUrl,
                        timestamp: new Date(session.created_at).getTime(),
                        prompt: session.session_name || session.name || session.session_id,
                        name: file.name,
                        driveUrl: `https://drive.google.com/file/d/${file.id}/view`,
                        folderId: cleanFolderId,
                      };
                    });
                    
                    setImages(fetchedImages);
                    toast.success(`Loaded ${imageFiles.length} images from Drive`);
                  } else {
                    setImages([]);
                    toast.info("No images found in this folder");
                  }
                } else {
                  setImages([]);
                  toast.error("Failed to fetch images from Drive");
                }
              } catch (error) {
                console.error("Error fetching from Drive:", error);
                setImages([]);
                toast.error("Error loading images");
              }
            } else {
              setImages([]);
            }
            
            setView("history");
          }}
          className="border-none" 
        />
      </div>

      {/* Sidebar Toggle Button - Attached to sidebar edge */}
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn(
          "hidden md:flex fixed top-20 z-50 text-muted-foreground hover:text-foreground bg-background border rounded-r-md rounded-l-none shadow-sm transition-all duration-300 ease-in-out",
          isSidebarOpen ? "left-80" : "left-0"
        )}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
      </Button>
      
      <div 
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out pt-16",
          isSidebarOpen ? "md:pl-80" : "md:pl-0"
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
              <SheetContent side="left" className="p-0 w-80">
                <div className="flex items-center gap-2 px-6 py-4 border-b">
                  <button 
                    onClick={() => setView("dashboard")}
                    className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    aria-label="Go to dashboard"
                  >
                    <img 
                      src="https://harmless-tapir-303.convex.cloud/api/storage/a16f5f1d-198f-400b-9015-cd0deb4b29d1" 
                      alt="Spijker en Co" 
                      className="h-8 w-auto object-contain invert dark:invert-0 transition-all"
                    />
                  </button>
                </div>
                <Sidebar 
                  activeView={view} 
                  onNavigate={setView}
                  refreshTrigger={refreshSessions}
                  onSessionSelect={async (session) => {
                    const cleanedUrl = cleanDriveUrl(session.folder_url);
                    setDriveLink(cleanedUrl);
                    setCurrentSessionName(session.session_name || session.name || session.session_id);
                    
                    // If session has images stored, load them
                    if (session.images && session.images.length > 0) {
                      const sessionImages: GeneratedImage[] = session.images.map((img: any) => ({
                        id: img.id,
                        url: img.url,
                        timestamp: new Date(session.created_at).getTime(),
                        prompt: session.session_name || session.name || session.session_id,
                        name: img.name,
                        driveUrl: img.driveUrl,
                        folderId: session.folder_id,
                      }));
                      setImages(sessionImages);
                    } 
                    // If no images but has folder_id, fetch from Drive
                    else if (session.folder_id && session.folder_url) {
                      toast.info("Fetching images from Drive...");
                      try {
                        // Clean folder_id (remove leading '=' if present)
                        const cleanFolderId = session.folder_id.trim().replace(/^=/, '');
                        console.log("Fetching from folder:", cleanFolderId);
                        
                        const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
                        const response = await fetch(
                          `https://www.googleapis.com/drive/v3/files?q='${cleanFolderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)&pageSize=100`
                        );
                        
                        if (response.ok) {
                          const data = await response.json();
                          const imageFiles = data.files?.filter((f: any) => f.mimeType?.startsWith('image/')) || [];
                          
                          if (imageFiles.length > 0) {
                            const fetchedImages: GeneratedImage[] = imageFiles.map((file: any) => {
                              // Try using webContentLink if available
                              const imageUrl = file.webContentLink 
                                ? file.webContentLink.replace('&export=download', '')
                                : `https://lh3.googleusercontent.com/d/${file.id}=w1000`;
                              
                              return {
                                id: file.id,
                                url: imageUrl,
                                timestamp: new Date(session.created_at).getTime(),
                                prompt: session.session_name || session.name || session.session_id,
                                name: file.name,
                                driveUrl: `https://drive.google.com/file/d/${file.id}/view`,
                                folderId: cleanFolderId,
                              };
                            });
                            setImages(fetchedImages);
                            toast.success(`Loaded ${imageFiles.length} images from Drive`);
                          } else {
                            setImages([]);
                            toast.info("No images found in this folder");
                          }
                        } else {
                          setImages([]);
                          toast.error("Failed to fetch images from Drive");
                        }
                      } catch (error) {
                        console.error("Error fetching from Drive:", error);
                        setImages([]);
                        toast.error("Error loading images");
                      }
                    } else {
                      setImages([]);
                    }
                    
                    setView("history");
                  }}
                  className="border-none" 
                />
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
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {user?.name?.split(' ')[0] || "User"}</h1>
                <p className="text-muted-foreground">Ready to create something amazing today?</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <Card className="bg-gradient-to-br from-[#68074F] to-[#68074F]/90 text-white border-none shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-[#68074F]/50 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                    <Sparkles className="h-24 w-24 group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
                      onClick={() => {
                        // Clear old data when starting new generation
                        setImages([]);
                        setDriveLink(null);
                        setStatus("");
                        setView("generate");
                      }}
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
                  <Card className="group cursor-pointer hover:shadow-xl hover:shadow-[#f0826a]/10 transition-all duration-300 hover:border-[#f0826a]/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f0826a]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center gap-2 text-foreground group-hover:text-[#f0826a] transition-colors duration-300">
                        <History className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>
                        You have generated {images.length} images so far
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:border-[#f0826a] group-hover:text-[#f0826a] transition-all duration-300"
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
                  <Card className="group cursor-pointer hover:shadow-xl hover:shadow-[#f0826a]/10 transition-all duration-300 hover:border-[#f0826a]/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f0826a]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center gap-2 text-foreground group-hover:text-[#f0826a] transition-colors duration-300">
                        <ImageIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        Gallery
                      </CardTitle>
                      <CardDescription>
                        Manage your generated assets
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:border-[#f0826a] group-hover:text-[#f0826a] transition-all duration-300"
                        onClick={() => setView("history")}
                      >
                        Open Gallery
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>


            </motion.div>
          )}

          {/* Generate View */}
          {view === "generate" && (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Upload - Increased size */}
              <div className="lg:col-span-5 xl:col-span-5 space-y-6">
                <UploadPanel 
                  onGenerate={handleGenerate} 
                  isGenerating={isGenerating}
                  onClear={() => {
                    setImages([]);
                    setDriveLink(null);
                  }}
                />
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
                        <p className="text-sm font-medium text-foreground mb-1">Google Drive Folder</p>
                        <p className="text-xs text-muted-foreground truncate">{driveLink}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const folderIdMatch = driveLink.match(/folders\/([a-zA-Z0-9_-]+)/);
                            if (folderIdMatch) {
                              const folderId = folderIdMatch[1];
                              const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
                              
                              try {
                                toast.info("Refreshing images...");
                                const response = await fetch(
                                  `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)&pageSize=100`
                                );
                                const data = await response.json();
                                const imageFiles = data.files?.filter((file: any) => file.mimeType?.startsWith('image/')) || [];
                                
                                if (imageFiles.length > 0) {
                                  const newImages: GeneratedImage[] = imageFiles.map((file: any) => {
                                    // Add timestamp to bust cache
                                    const imageUrl = `https://lh3.googleusercontent.com/d/${file.id}?t=${Date.now()}`;
                                    
                                    return {
                                      id: file.id,
                                      url: imageUrl,
                                      timestamp: Date.now(),
                                      prompt: "Generated Image",
                                      name: file.name,
                                      driveUrl: `https://drive.google.com/file/d/${file.id}/view`,
                                      folderId: folderId,
                                    };
                                  });
                                  
                                  console.log("Refreshed images:", newImages);
                                  setImages(newImages);
                                  toast.success(`Loaded ${imageFiles.length} images!`);
                                } else {
                                  toast.info("No images found yet. They may still be uploading.");
                                }
                              } catch (error) {
                                toast.error("Failed to refresh images");
                              }
                            }
                          }}
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
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
                    <div className="flex items-center justify-center gap-3">
                      <span className="animate-spin text-2xl">⏳</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{status}</p>
                        <p className="text-xs text-muted-foreground">
                          Waiting for n8n to complete... This may take several minutes
                        </p>
                      </div>
                    </div>
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
                <h2 className="text-2xl font-bold text-foreground">Generation History</h2>
              </div>
              <ResultsGallery images={images} onDelete={handleDelete} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}