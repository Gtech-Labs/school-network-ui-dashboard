import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Image, File } from 'lucide-react';

interface DocumentViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    name: string;
    type: string;
    uploadedDate: string;
    url: string;
  } | null;
}

function getDocIcon(type: string) {
  if (type.includes('image') || type.includes('Photo') || type.includes('photo')) return Image;
  if (type.includes('PDF') || type.includes('pdf') || type.includes('Report') || type.includes('Certificate') || type.includes('record')) return FileText;
  return File;
}

export function DocumentViewerDialog({ open, onOpenChange, document }: DocumentViewerDialogProps) {
  if (!document) return null;

  const Icon = getDocIcon(document.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            {document.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30 p-8 min-h-[250px]">
            <Icon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="font-medium text-foreground">{document.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{document.type}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Uploaded: {new Date(document.uploadedDate).toLocaleDateString()}
            </p>
          </div>
          <div className="rounded-md border border-border p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">File Name</span>
              <span className="font-medium">{document.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{document.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Upload Date</span>
              <span className="font-medium">{new Date(document.uploadedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
