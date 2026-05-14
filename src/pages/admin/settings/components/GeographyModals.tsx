import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GeographyEntityType } from '../types';
import { Loader2 } from 'lucide-react';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  type: GeographyEntityType | string;
  initialName?: string;
  isEditing?: boolean;
  isLoading?: boolean;
}

export const EntityModal: React.FC<EntityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  type,
  initialName = '',
  isEditing = false,
  isLoading = false,
}) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (isOpen) setName(initialName);
  }, [isOpen, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isLoading) {
      await onSave(name);
      if (!isLoading) onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit' : 'Add New'} {type}</DialogTitle>
            <DialogDescription>
              Enter the name for the {type}. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter ${type} name`}
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  entityType: string;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  entityType,
  isLoading = false,
}) => {
  const getDeleteDescription = () => {
    switch (entityType) {
      case 'country':
        return (
          <>
            This will permanently delete the country <strong>{entityName}</strong> and all its associated 
            <span className="font-semibold text-destructive"> provinces, cities, and suburbs</span>. 
            This action cannot be undone.
          </>
        );
      case 'province':
        return (
          <>
            This will permanently delete the province <strong>{entityName}</strong> and all its 
            <span className="font-semibold text-destructive"> cities and suburbs</span>. 
            This action cannot be undone.
          </>
        );
      case 'city':
        return (
          <>
            This will permanently delete the city <strong>{entityName}</strong> and all its 
            <span className="font-semibold text-destructive"> suburbs</span>. 
            This action cannot be undone.
          </>
        );
      default:
        return (
          <>
            This will permanently delete <strong>{entityName}</strong>. 
            This action cannot be undone.
          </>
        );
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {getDeleteDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="destructive"
              onClick={onConfirm} 
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : `Delete ${entityType}`}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
