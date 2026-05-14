import React from 'react';
import { Edit2, Trash2, Plus, MapPin, Building2, Building, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SelectedEntity, Country, Province, City, Suburb } from '../types';

interface GeographyDetailProps {
  selectedEntity: SelectedEntity | null;
  data: any; // The full object (Country, Province, etc.)
  onEdit: (entity: SelectedEntity) => void;
  onDelete: (entity: SelectedEntity) => void;
  onAddChild: (type: string, parentId: string) => void;
}

export const GeographyDetail: React.FC<GeographyDetailProps> = ({
  selectedEntity,
  data,
  onEdit,
  onDelete,
  onAddChild,
}) => {
  if (!selectedEntity) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Select a location</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Select a country, province, city or suburb from the tree on the left to manage its details.
          </p>
        </div>
      </div>
    );
  }

  const getIcon = () => {
    switch (selectedEntity.type) {
      case 'country': return <MapPin className="h-5 w-5 text-blue-500" />;
      case 'province': return <Building2 className="h-5 w-5 text-emerald-500" />;
      case 'city': return <Building className="h-5 w-5 text-amber-500" />;
      case 'suburb': return <Home className="h-5 w-5 text-purple-500" />;
    }
  };

  const getChildType = () => {
    switch (selectedEntity.type) {
      case 'country': return 'province';
      case 'province': return 'city';
      case 'city': return 'suburb';
      default: return null;
    }
  };

  const children = data?.provinces || data?.cities || data?.suburbs || [];
  const childType = getChildType();

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getIcon()}
            <Badge variant="outline" className="capitalize">{selectedEntity.type}</Badge>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{selectedEntity.name}</h2>
          <div className="flex items-center text-sm text-muted-foreground gap-2">
             {/* Breadcrumb-like path could go here if we tracked it */}
             Geography <ArrowRight className="h-3 w-3" /> {selectedEntity.name}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(selectedEntity)}>
            <Edit2 className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => onDelete(selectedEntity)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-none bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Status</p>
              <p className="font-semibold text-emerald-500">Active</p>
            </div>
            {childType && (
              <div>
                <p className="text-xs text-muted-foreground uppercase capitalize">{childType}s</p>
                <p className="font-semibold">{children.length}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground uppercase">ID</p>
              <p className="font-mono text-[10px] text-muted-foreground truncate">{selectedEntity.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {childType && (
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-card/50 px-6 py-4">
            <div>
              <CardTitle className="capitalize">{childType}s</CardTitle>
              <CardDescription>Manage {childType}s within {selectedEntity.name}</CardDescription>
            </div>
            <Button size="sm" onClick={() => onAddChild(childType, selectedEntity.id)}>
              <Plus className="h-4 w-4 mr-2" /> Add {childType}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[400px]">Name</TableHead>
                  <TableHead>Sub-entities</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No {childType}s found. Click "Add {childType}" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  children.map((child: any, index: number) => {
                    const isSuburb = selectedEntity.type === 'city';
                    const childName = isSuburb ? child : child.name;
                    const childId = isSuburb ? `${selectedEntity.id}-${child}-${index}` : child.id;
                    
                    return (
                      <TableRow key={childId}>
                        <TableCell className="font-medium">{childName}</TableCell>
                        <TableCell>
                          {!isSuburb ? (
                            <Badge variant="secondary">
                              {child.cities?.length || child.suburbs?.length || 0} items
                            </Badge>
                          ) : (
                            <Badge variant="outline">Suburb</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit({ id: isSuburb ? childName : child.id, type: childType, name: childName, parentId: selectedEntity.id })}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete({ id: isSuburb ? childName : child.id, type: childType, name: childName, parentId: selectedEntity.id })}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
