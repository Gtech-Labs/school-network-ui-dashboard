export interface City {
  id: string;
  name: string;
  provinceId?: string;
  suburbs: string[];
}

export interface Province {
  id: string;
  name: string;
  countryId?: string;
  cities?: City[];
}

export interface Country {
  id: string;
  name: string;
  code?: string;
  language?: string;
  provinces?: Province[];
  stats?: {
    provinces: number;
    cities: number;
    suburbs: number;
  };
}

export type GeographyEntityType = 'country' | 'province' | 'city' | 'suburb';

export interface SelectedEntity {
  id: string;
  type: GeographyEntityType;
  name: string;
  parentId?: string;
}
