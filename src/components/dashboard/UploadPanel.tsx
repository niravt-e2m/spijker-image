import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FileText, Image as ImageIcon, Upload, X } from "lucide-react";
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

  const handleClear = () => {
    setImage(null);
    setImagePreview(null);
    setPdf(null);
    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const handleGenerate = () => {
    if (!description && !image) {
      toast.error("Please provide at least an image or a description");
      return;
    }
    onGenerate({ image, pdf, description });
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
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-6 transition-all duration-200 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px]",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
              imagePreview ? "p-2" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="relative w-full h-full min-h-[200px] group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg max-h-[300px]"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                      setImagePreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Click or drag image here</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 10MB</p>
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => pdfInputRef.current?.click()}
            >
              <FileText className="mr-2 h-4 w-4" />
              {pdf ? pdf.name : "Upload detailed instructions..."}
            </Button>
            {pdf && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setPdf(null);
                  if (pdfInputRef.current) pdfInputRef.current.value = "";
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <input
              type="file"
              ref={pdfInputRef}
              className="hidden"
              accept="application/pdf"
              onChange={handlePdfUpload}
            />
          </div>
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
            {isGenerating ? "Processing..." : "Generate Images"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
