export interface House {
  id: string;
  code: string;
  houseName: string;
  ownerName?: string;
  ownerId: string;
  ownerPhone?: string;
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  internetPassword: string;
  photos: string[];
  description: string;
  observations: string;
  pricing: {
    lowSeason: number;
    midSeason: number;
    highSeason: number;
    carnivalPackage: number;
    newYearPackage: number;
  };
  status: HouseStatus;
  occupiedDates: Date[];
  createdAt: Date;
  updatedAt: Date;
}

export type HouseStatus = "available" | "occupied" | "maintenance" | "inactive";

export interface CreateHouseData {
  houseName: string;
  ownerId: string;
  ownerPhone?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  internetPassword: string;
  photos: string[];
  description: string;
  observations: string;
  pricing: {
    lowSeason: number;
    midSeason: number;
    highSeason: number;
    carnivalPackage: number;
    newYearPackage: number;
  };
  status: HouseStatus;
}

export interface UpdateHouseData extends Partial<CreateHouseData> {
  id: string;
}

export interface Filters {
  search?: string;
  status?: HouseStatus;
  city?: string;
  state?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface HouseTableRow extends House {
  _searchText: string;
}
