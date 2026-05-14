import React, { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { GeographyTree } from './components/GeographyTree';
import { GeographyDetail } from './components/GeographyDetail';
import { EntityModal, DeleteConfirmModal } from './components/GeographyModals';
import { SelectedEntity } from './types';
import { useToast } from '@/components/ui/use-toast';
import { 
  useCountries, 
  useCreateCountry, 
  useUpdateCountry, 
  useDeleteCountry,
  useCreateProvince,
  useUpdateProvince,
  useDeleteProvince,
  useCreateCity,
  useUpdateCity,
  useDeleteCity
} from '@/hooks/useSettings';
import { Loader2 } from 'lucide-react';

export const GeographySettings: React.FC = () => {
  const { data: countries, isLoading } = useCountries();
  
  // Country mutations
  const createCountry = useCreateCountry();
  const updateCountry = useUpdateCountry();
  const deleteCountry = useDeleteCountry();

  // Province mutations
  const createProvince = useCreateProvince();
  const updateProvince = useUpdateProvince();
  const deleteProvince = useDeleteProvince();

  // City mutations
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const deleteCity = useDeleteCity();
  
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
  const { toast } = useToast();

  // Modal states
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: string;
    isEditing: boolean;
    parentId?: string;
    entity?: SelectedEntity;
  }>({ type: 'country', isEditing: false });

  const isSaving = createCountry.isPending || updateCountry.isPending || 
                   createProvince.isPending || updateProvince.isPending || 
                   createCity.isPending || (modalConfig.type !== 'suburb' && updateCity.isPending);
  
  const isDeleting = deleteCountry.isPending || deleteProvince.isPending || deleteCity.isPending || (modalConfig.type === 'suburb' && updateCity.isPending);

  const getFullSelectedData = () => {
    if (!selectedEntity || !countries) return null;

    if (selectedEntity.type === 'country') {
      return countries.find(c => c.id === selectedEntity.id);
    }
    
    if (selectedEntity.type === 'province') {
      for (const c of countries) {
        const p = c.provinces?.find(p => p.id === selectedEntity.id);
        if (p) return p;
      }
    }

    if (selectedEntity.type === 'city') {
      for (const c of countries) {
        for (const p of c.provinces || []) {
          const city = p.cities?.find(ct => ct.id === selectedEntity.id);
          if (city) return city;
        }
      }
    }

    if (selectedEntity.type === 'suburb') {
      return { name: selectedEntity.name };
    }

    return null;
  };

  const handleAdd = (type: string, parentId?: string) => {
    setModalConfig({ type, isEditing: false, parentId });
    setIsEntityModalOpen(true);
  };

  const handleEdit = (entity: SelectedEntity) => {
    setModalConfig({ type: entity.type, isEditing: true, entity });
    setIsEntityModalOpen(true);
  };

  const handleDeleteRequest = (entity: SelectedEntity) => {
    setModalConfig({ ...modalConfig, entity });
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (name: string) => {
    try {
      const type = modalConfig.type;
      const isEditing = modalConfig.isEditing;
      const entity = modalConfig.entity;
      const parentId = modalConfig.parentId;

      if (isEditing && entity) {
        switch (type) {
          case 'country':
            await updateCountry.mutateAsync({ id: entity.id, data: { name } });
            break;
          case 'province':
            await updateProvince.mutateAsync({ id: entity.id, data: { name } });
            break;
          case 'city':
            await updateCity.mutateAsync({ id: entity.id, data: { name } });
            break;
          case 'suburb':
            // Update suburb name in parent city
            const parentCity = countries?.flatMap(c => c.provinces || [])
              .flatMap(p => p.cities || [])
              .find(city => city.id === entity.parentId);
            
            if (parentCity) {
              const updatedSuburbs = parentCity.suburbs.map(s => s === entity.name ? name : s);
              await updateCity.mutateAsync({ id: parentCity.id, data: { suburbs: updatedSuburbs } });
            }
            break;
        }
      } else {
        switch (type) {
          case 'country':
            await createCountry.mutateAsync({ name, code: 'XX', language: 'English' });
            break;
          case 'province':
            await createProvince.mutateAsync({ name, country: { id: parentId } });
            break;
          case 'city':
            await createCity.mutateAsync({ name, province: { id: parentId }, suburbs: [] });
            break;
          case 'suburb':
            // Add suburb to parent city
            const parentCity = countries?.flatMap(c => c.provinces || [])
              .flatMap(p => p.cities || [])
              .find(city => city.id === parentId);
            
            if (parentCity) {
              const updatedSuburbs = [...parentCity.suburbs, name];
              await updateCity.mutateAsync({ id: parentCity.id, data: { suburbs: updatedSuburbs } });
            }
            break;
        }
      }

      toast({
        title: "Success",
        description: `${type} "${name}" ${isEditing ? 'updated' : 'created'} successfully.`,
      });
      
      if (isEditing && entity.id === selectedEntity?.id) {
        setSelectedEntity({ ...selectedEntity!, name });
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to save ${modalConfig.type}.`, variant: "destructive" });
    }
  };

  const handleConfirmDelete = async () => {
    const entity = modalConfig.entity;
    if (!entity) return;

    try {
      switch (entity.type) {
        case 'country':
          await deleteCountry.mutateAsync(entity.id);
          break;
        case 'province':
          await deleteProvince.mutateAsync(entity.id);
          break;
        case 'city':
          await deleteCity.mutateAsync(entity.id);
          break;
        case 'suburb':
          // Remove suburb from parent city
          const parentCity = countries?.flatMap(c => c.provinces || [])
            .flatMap(p => p.cities || [])
            .find(city => city.id === entity.parentId);
          
          if (parentCity) {
            const updatedSuburbs = parentCity.suburbs.filter(s => s !== entity.name);
            await updateCity.mutateAsync({ id: parentCity.id, data: { suburbs: updatedSuburbs } });
          }
          break;
      }

      toast({ title: "Deleted", description: `${entity.type} "${entity.name}" has been removed.` });
      if (selectedEntity?.id === entity.id) setSelectedEntity(null);
    } catch (error) {
      toast({ title: "Error", description: `Failed to delete ${entity.type}.`, variant: "destructive" });
    }
    setIsDeleteModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-220px)] border rounded-lg overflow-hidden bg-card">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-muted/10">
          <GeographyTree 
            countries={countries || []} 
            selectedEntity={selectedEntity} 
            onSelect={setSelectedEntity}
            onAdd={handleAdd}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <GeographyDetail 
            selectedEntity={selectedEntity}
            data={getFullSelectedData()}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onAddChild={handleAdd}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <EntityModal
        isOpen={isEntityModalOpen}
        onClose={() => setIsEntityModalOpen(false)}
        onSave={handleSave}
        type={modalConfig.type}
        initialName={modalConfig.isEditing ? modalConfig.entity?.name : ''}
        isEditing={modalConfig.isEditing}
        isLoading={isSaving}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        entityName={modalConfig.entity?.name || ''}
        entityType={modalConfig.entity?.type || ''}
        isLoading={isDeleting}
      />
    </div>
  );
};
