import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FileText, Trash2, Upload, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface UploadPanelProps {
  onGenerate: (data: any) => void;
  isGenerating: boolean;
  onClear?: () => void;
}

export function UploadPanel({ onGenerate, isGenerating, onClear }: UploadPanelProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageUpload(files[0]);
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      setPdf(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePdf = () => {
    setPdf(null);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const handleClear = () => {
    removeImage();
    removePdf();
    setName("");
    setDescription("");
    // Notify parent to clear generated images
    if (onClear) {
      onClear();
    }
    toast.success("Cleared all data");
  };

  const handleGenerate = async () => {
    if (!description && !image) {
      toast.error("Please provide at least an image or a description");
      return;
    }

    onGenerate({ image, pdf, name, description, webhookResult: null, isStarting: true });

    try {
      const formData = new FormData();
      if (image) formData.append("image", image);
      if (pdf) formData.append("pdf", pdf);
      if (name) formData.append("name", name);
      if (description) formData.append("description", description);

      toast.info("Starting workflow... Waiting for folder URL from n8n");

      const startTime = Date.now();
      console.log("Sending request to n8n webhook at:", new Date().toISOString());
      console.log("⚠️ n8n MUST respond with folder URL within 2 minutes");
      console.log("⚠️ Add 'Respond to Webhook' node in n8n after creating folder");
      
      // Set timeout to 3 minutes (n8n should respond with folder URL within this time)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("Frontend timeout after 4 minutes - n8n should respond faster");
        controller.abort();
      }, 240000); // 3 minutes
      
      let result;
      
      try {
        const response = await fetch("https://spijkerenco.app.n8n.cloud/webhook-test/upload-image", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        const elapsedTime = (Date.now() - startTime) / 1000;
        console.log(`Response received after ${elapsedTime.toFixed(2)} seconds`);

        console.log("Response status:", response.status);
        
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        if (responseText && responseText.trim()) {
          try {
            result = JSON.parse(responseText);
            console.log("Parsed result:", result);
          } catch {
            console.log("Response is not JSON, treating as URL:", responseText);
            result = { resultUrl: responseText.trim() };
          }
        } else {
          console.warn("Empty response received from n8n");
          throw new Error("Empty response received from n8n webhook");
        }
      } catch (error) {
        clearTimeout(timeoutId);
        
        const elapsedTime = (Date.now() - startTime) / 1000;
        console.log(`❌ Error occurred after ${elapsedTime.toFixed(2)} seconds (${(elapsedTime / 60).toFixed(2)} minutes)`);
        
        if (error instanceof Error) {
          console.log("Error type:", error.name);
          console.log("Error message:", error.message);
          
          if (error.name === 'AbortError') {
            console.log("✅ Frontend timeout triggered (3 minutes)");
            throw new Error("Request timed out after 3 minutes. n8n should respond with folder URL within 2 minutes.");
          } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            console.log("❌ Network/Proxy timeout after ~2 minutes");
            console.log("n8n did NOT respond with folder URL in time");
            console.log("⚠️ You MUST configure n8n to respond immediately with folder URL");
            console.log("⚠️ Add 'Respond to Webhook' node after creating folder");
            
            toast.error(`Network timeout after ${(elapsedTime / 60).toFixed(1)} minutes. n8n must respond with folder URL within 2 minutes. Please add 'Respond to Webhook' node in your n8n workflow.`, {
              duration: 10000
            });
            
            throw new Error("n8n did not respond in time. Configure n8n to respond immediately with folder URL.");
          }
        }
        throw error;
      }
      
      if (result && result.resultUrl) {
        console.log("Got folder URL:", result.resultUrl);
        onGenerate({ 
          image, 
          pdf,
          name,
          description, 
          webhookResult: result, 
          isStarting: false,
          shouldPoll: true
        });
        toast.success("Workflow started! Waiting for images...");
      } else {
        throw new Error("No folder URL received from webhook");
      }
    } catch (error) {
      console.error("Full error details:", error);
      onGenerate({ image, pdf, name, description, webhookResult: null, isStarting: false, error: true });
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Network error. Please check your connection.");
      } else {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to process: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="h-full bg-card dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-border dark:border-zinc-800 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Upload</h2>
        <p className="text-muted-foreground text-sm mt-1">Add your source files</p>
      </div>

      <div className="space-y-5">
        {/* Image Upload Area */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Source Image</Label>
          
          {!image ? (
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-out flex flex-col items-center justify-center text-center cursor-pointer min-h-[180px] group overflow-hidden",
                isDragging 
                  ? "border-primary bg-primary/10 scale-[1.02]" 
                  : "border-border dark:border-zinc-700 hover:border-muted-foreground dark:hover:border-zinc-500 hover:bg-muted/50 dark:hover:bg-zinc-800/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {/* Animated gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex flex-col items-center gap-3">
                <div className={cn(
                  "h-14 w-14 rounded-2xl bg-muted dark:bg-zinc-800 flex items-center justify-center transition-all duration-300",
                  isDragging ? "scale-110 bg-primary/20" : "group-hover:scale-105 group-hover:bg-muted-foreground/20 dark:group-hover:bg-zinc-700"
                )}>
                  <Upload className={cn(
                    "h-6 w-6 transition-all duration-300",
                    isDragging ? "text-primary" : "text-muted-foreground dark:text-zinc-400 group-hover:text-foreground dark:group-hover:text-white"
                  )} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground dark:text-zinc-300 group-hover:text-foreground dark:group-hover:text-white transition-colors">
                    Drop image or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-zinc-600 mt-1">JPG, PNG, WebP • Max 10MB</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 border border-border dark:border-zinc-700 rounded-xl bg-muted/50 dark:bg-zinc-800/50 animate-in fade-in zoom-in-95 duration-300">
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-background dark:bg-zinc-900 border border-border dark:border-zinc-700 shrink-0 shadow-lg">
                <img 
                  src={imagePreview || ""} 
                  alt="Preview" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{image.name}</p>
                <p className="text-xs text-muted-foreground">{(image.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                onClick={removeImage}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          />
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Session Name</Label>
          <Input
            placeholder="Enter a name for this generation..."
            className="bg-background dark:bg-zinc-800/50 border-border dark:border-zinc-700 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all duration-200 rounded-xl h-11"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* PDF Upload */}
        <div className="space-y-2">
          <Label className="text-zinc-400 text-xs uppercase tracking-wider font-medium">Instructions</Label>
          
          {!pdf ? (
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground hover:text-foreground h-12 bg-background dark:bg-zinc-800/50 border-border dark:border-zinc-700 hover:border-muted-foreground dark:hover:border-zinc-500 hover:bg-muted dark:hover:bg-zinc-800 transition-all duration-200 rounded-xl"
              onClick={() => pdfInputRef.current?.click()}
            >
              <FileText className="mr-3 h-4 w-4" />
              Upload PDF instructions...
            </Button>
          ) : (
            <div className="flex items-center gap-4 p-4 border border-border dark:border-zinc-700 rounded-xl bg-muted/50 dark:bg-zinc-800/50 animate-in fade-in zoom-in-95 duration-300">
              <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{pdf.name}</p>
                <p className="text-xs text-muted-foreground">{(pdf.size / 1024).toFixed(0)} KB</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                onClick={removePdf}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <input
            type="file"
            ref={pdfInputRef}
            className="hidden"
            accept="application/pdf"
            onChange={handlePdfUpload}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Description</Label>
          <Textarea
            placeholder="Describe the variations you want..."
            className="min-h-[100px] resize-none bg-background dark:bg-zinc-800/50 border-border dark:border-zinc-700 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all duration-200 rounded-xl"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1 border-border dark:border-zinc-700 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-zinc-800 hover:border-muted-foreground dark:hover:border-zinc-600 transition-all duration-200 rounded-xl h-12"
            onClick={handleClear}
            disabled={isGenerating}
          >
            Clear
          </Button>
          <Button
            className={cn(
              "flex-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-semibold rounded-xl h-12 transition-all duration-300 shadow-lg shadow-purple-500/30 relative overflow-hidden group",
              !isGenerating && "hover:shadow-2xl hover:shadow-purple-500/50 hover:from-purple-500 hover:via-pink-400 hover:to-orange-400",
              isGenerating && "animate-pulse"
            )}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {/* Animated gradient overlay */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            
            {/* Shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            
            {/* Glow effect */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-orange-400/20 blur-xl transition-opacity duration-500" />
            
            {isGenerating ? (
              <span className="flex items-center gap-2 relative z-10">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2 relative z-10 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                Generate
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
