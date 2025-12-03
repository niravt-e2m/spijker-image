import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Download, ExternalLink, Trash2, Maximize2 } from "lucide-react";
import { useState } from "react";

export interface GeneratedImage {
  id: string;
  url: string;
  timestamp: number;
  prompt: string;
  name?: string;
  driveUrl?: string;
  folderId?: string;
}

interface ResultsGalleryProps {
  images: GeneratedImage[];
  onDelete: (ids: string[]) => void;
}

export function ResultsGallery({ images, onDelete }: ResultsGalleryProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === images.length) {
      setSelected([]);
    } else {
      setSelected(images.map((img) => img.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Results Gallery</h2>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={() => onDelete(selected)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selected.length})
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download ({selected.length})
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={handleSelectAll}>
            {selected.length === images.length ? "Deselect All" : "Select All"}
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-muted-foreground bg-muted/20">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Download className="h-8 w-8 opacity-50" />
          </div>
          <p className="text-lg font-medium text-foreground">No images generated yet</p>
          <p className="text-sm">Upload a source image and click Generate to start</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {images.map((image) => (
            <div
              key={image.id}
              className={cn(
                "group relative aspect-square rounded-xl overflow-hidden border bg-card shadow-sm transition-all hover:shadow-md",
                selected.includes(image.id) && "ring-2 ring-secondary"
              )}
            >
              <iframe
                src={`https://drive.google.com/file/d/${image.id}/preview`}
                className="w-full h-full object-cover pointer-events-none"
                allow="autoplay"
                loading="lazy"
                style={{ border: 'none' }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                <div className="flex justify-between items-start">
                  <Checkbox
                    checked={selected.includes(image.id)}
                    onCheckedChange={() => toggleSelect(image.id)}
                    className="border-white data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                  />
                  <a 
                    href={image.driveUrl || `https://drive.google.com/file/d/${image.id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 border-none text-white">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
                
                <div className="space-y-2">
                  {image.prompt && (
                    <p className="text-xs text-white font-semibold truncate">{image.prompt}</p>
                  )}
                  {image.name && (
                    <p className="text-xs text-white/70 font-medium truncate">{image.name}</p>
                  )}
                  <div className="flex gap-2 justify-end">
                    <a 
                      href={`https://drive.google.com/uc?export=download&id=${image.id}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white text-primary hover:bg-white/90">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    {image.driveUrl && (
                      <a 
                        href={image.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white text-primary hover:bg-white/90">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
