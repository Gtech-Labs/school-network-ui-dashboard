import React, { useState } from 'react';
import { ChevronRight, ChevronDown, MapPin, Building2, Building, Home, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Country, Province, City, Suburb, SelectedEntity } from '../types';

interface GeographyTreeProps {
  countries: Country[];
  selectedEntity: SelectedEntity | null;
  onSelect: (entity: SelectedEntity) => void;
  onAdd: (type: string, parentId?: string) => void;
}

export const GeographyTree: React.FC<GeographyTreeProps> = ({
  countries,
  selectedEntity,
  onSelect,
  onAdd,
}) => {
  return (
    <div className="space-y-1 p-2">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Geography</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAdd('country')}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1">
        {countries.map((country) => (
          <CountryNode
            key={country.id}
            country={country}
            selectedEntity={selectedEntity}
            onSelect={onSelect}
            onAdd={onAdd}
          />
        ))}
      </div>
    </div>
  );
};

const CountryNode = ({ country, selectedEntity, onSelect, onAdd }: { 
  country: Country; 
  selectedEntity: SelectedEntity | null; 
  onSelect: (e: SelectedEntity) => void;
  onAdd: (type: string, parentId?: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedEntity?.id === country.id && selectedEntity?.type === 'country';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        "group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer transition-colors",
        isSelected && "bg-accent text-accent-foreground"
      )} onClick={() => onSelect({ id: country.id, type: 'country', name: country.name })}>
        <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-transparent">
            {country.provinces && country.provinces.length > 0 ? (
              isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
            ) : <div className="w-3" />}
          </Button>
        </CollapsibleTrigger>
        <MapPin className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-medium flex-1 truncate">{country.name}</span>
      </div>
      <CollapsibleContent className="pl-4 space-y-1 border-l ml-4 mt-1 border-muted">
        {country.provinces?.map((province) => (
          <ProvinceNode
            key={province.id}
            province={province}
            selectedEntity={selectedEntity}
            onSelect={onSelect}
            onAdd={onAdd}
          />
        ))}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
          onClick={(e) => { e.stopPropagation(); onAdd('province', country.id); }}
        >
          <Plus className="h-3 w-3" /> Add Province
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
};

const ProvinceNode = ({ province, selectedEntity, onSelect, onAdd }: { 
  province: Province; 
  selectedEntity: SelectedEntity | null; 
  onSelect: (e: SelectedEntity) => void;
  onAdd: (type: string, parentId?: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedEntity?.id === province.id && selectedEntity?.type === 'province';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        "group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer transition-colors",
        isSelected && "bg-accent text-accent-foreground"
      )} onClick={() => onSelect({ id: province.id, type: 'province', name: province.name, parentId: province.countryId })}>
        <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-transparent">
            {province.cities && province.cities.length > 0 ? (
              isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
            ) : <div className="w-3" />}
          </Button>
        </CollapsibleTrigger>
        <Building2 className="h-4 w-4 text-emerald-500" />
        <span className="text-sm flex-1 truncate">{province.name}</span>
      </div>
      <CollapsibleContent className="pl-4 space-y-1 border-l ml-4 mt-1 border-muted">
        {province.cities?.map((city) => (
          <CityNode
            key={city.id}
            city={city}
            selectedEntity={selectedEntity}
            onSelect={onSelect}
            onAdd={onAdd}
          />
        ))}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
          onClick={(e) => { e.stopPropagation(); onAdd('city', province.id); }}
        >
          <Plus className="h-3 w-3" /> Add City
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
};

const CityNode = ({ city, selectedEntity, onSelect, onAdd }: { 
  city: City; 
  selectedEntity: SelectedEntity | null; 
  onSelect: (e: SelectedEntity) => void;
  onAdd: (type: string, parentId?: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedEntity?.id === city.id && selectedEntity?.type === 'city';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        "group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer transition-colors",
        isSelected && "bg-accent text-accent-foreground"
      )} onClick={() => onSelect({ id: city.id, type: 'city', name: city.name, parentId: city.provinceId })}>
        <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-transparent">
            {city.suburbs && city.suburbs.length > 0 ? (
              isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
            ) : <div className="w-3" />}
          </Button>
        </CollapsibleTrigger>
        <Building className="h-4 w-4 text-amber-500" />
        <span className="text-sm flex-1 truncate">{city.name}</span>
      </div>
      <CollapsibleContent className="pl-4 space-y-1 border-l ml-4 mt-1 border-muted">
        {city.suburbs?.map((suburbName, index) => (
          <div 
            key={`${city.id}-${suburbName}-${index}`}
            className={cn(
              "group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer transition-colors",
              selectedEntity?.id === suburbName && selectedEntity?.type === 'suburb' && "bg-accent text-accent-foreground"
            )}
            onClick={() => onSelect({ id: suburbName, type: 'suburb', name: suburbName, parentId: city.id })}
          >
            <div className="w-4" />
            <Home className="h-4 w-4 text-purple-500" />
            <span className="text-sm flex-1 truncate">{suburbName}</span>
          </div>
        ))}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
          onClick={(e) => { e.stopPropagation(); onAdd('suburb', city.id); }}
        >
          <Plus className="h-3 w-3" /> Add Suburb
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
};
