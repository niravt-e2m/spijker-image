import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FileText, Image as ImageIcon, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface UploadPanelProps {
  onGenerate: (data: any) => void;
  isGenerating: boolean;
}

export function UploadPanel({ onGenerate, isGenerating }: UploadPanelProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
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
    setDescription("");
  };

  const handleGenerate = async () => {
    if (!description && !image) {
      toast.error("Please provide at least an image or a description");
      return;
    }

    // Notify parent to start generating (sets isGenerating to true)
    onGenerate({ image, pdf, description, webhookResult: null, isStarting: true });

    try {
      // Create FormData for the webhook
      const formData = new FormData();
      if (image) formData.append("image", image);
      if (pdf) formData.append("pdf", pdf);
      if (description) formData.append("description", description);

      // Show processing message
      toast.info("Processing... This may take up to 10 minutes");

      // Call the n8n webhook with 10 minute timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 minutes

      const response = await fetch("https://spijkerenco.app.n8n.cloud/webhook-test/upload-image", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed to process the request");
      }

      const result = await response.json();
      
      // Pass the result to the parent component
      onGenerate({ image, pdf, description, webhookResult: result, isStarting: false });
      
      toast.success("Processing complete!");
    } catch (error) {
      // Notify parent that generation failed
      onGenerate({ image, pdf, description, webhookResult: null, isStarting: false, error: true });
      
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Request timed out after 10 minutes. Please try again.");
      } else {
        console.error("Error calling webhook:", error);
        toast.error("Failed to process. Please try again.");
      }
    }
  };

  return (
    <Card className="h-full border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">Input Source</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Upload Area */}
        <div className="space-y-2">
          <Label>Source Image</Label>
          
          {!image ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-6 transition-all duration-200 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px]",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Click or drag image here</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 10MB</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-3 border rounded-xl bg-muted/20">
              <div className="h-16 w-16 rounded-lg overflow-hidden bg-background border shrink-0">
                <img 
                  src={imagePreview || ""} 
                  alt="Preview" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{image.name}</p>
                <p className="text-xs text-muted-foreground">{(image.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
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

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            placeholder="Describe the image variations you want..."
            className="min-h-[120px] resize-none focus-visible:ring-primary"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-muted-foreground text-right">
            {description.length}/500 characters
          </p>
        </div>

        {/* PDF Upload */}
        <div className="space-y-2">
          <Label>Instructions (PDF)</Label>
          
          {!pdf ? (
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground hover:text-foreground h-12"
              onClick={() => pdfInputRef.current?.click()}
            >
              <FileText className="mr-2 h-4 w-4" />
              Upload detailed instructions...
            </Button>
          ) : (
            <div className="flex items-center gap-4 p-3 border rounded-xl bg-muted/20">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{pdf.name}</p>
                <p className="text-xs text-muted-foreground">{(pdf.size / 1024).toFixed(0)} KB</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
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

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1 border-primary text-primary hover:bg-primary/5"
            onClick={handleClear}
            disabled={isGenerating}
          >
            Clear All
          </Button>
          <Button
            className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-semibold"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Processing...
              </span>
            ) : (
              "Generate Images"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}