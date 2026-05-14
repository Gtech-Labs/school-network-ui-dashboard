import api from './index';

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

export interface Province {
  id: string;
  name: string;
  countryId?: string;
  cities?: City[];
}

export interface City {
  id: string;
  name: string;
  provinceId?: string;
  suburbs: string[];
}

export const settingsApi = {
  getCountries: async () => {
    const response = await api.get<Country[]>('/settings/countries');
    return response.data;
  },

  getCountry: async (id: string) => {
    const response = await api.get<Country>(`/settings/countries/${id}`);
    return response.data;
  },

  createCountry: async (data: Partial<Country>) => {
    const response = await api.post<Country>('/settings/countries', data);
    return response.data;
  },

  updateCountry: async (id: string, data: Partial<Country>) => {
    const response = await api.patch<Country>(`/settings/countries/${id}`, data);
    return response.data;
  },

  deleteCountry: async (id: string) => {
    await api.delete(`/settings/countries/${id}`);
  },

  // Province API
  createProvince: async (data: Partial<Province>) => {
    const response = await api.post<Province>('/settings/provinces', data);
    return response.data;
  },

  updateProvince: async (id: string, data: Partial<Province>) => {
    const response = await api.patch<Province>(`/settings/provinces/${id}`, data);
    return response.data;
  },

  deleteProvince: async (id: string) => {
    await api.delete(`/settings/provinces/${id}`);
  },

  // City API
  createCity: async (data: Partial<City>) => {
    const response = await api.post<City>('/settings/cities', data);
    return response.data;
  },

  updateCity: async (id: string, data: Partial<City>) => {
    const response = await api.patch<City>(`/settings/cities/${id}`, data);
    return response.data;
  },

  deleteCity: async (id: string) => {
    await api.delete(`/settings/cities/${id}`);
  },
};
