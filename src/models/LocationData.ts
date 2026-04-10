export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
}

export function locationDataFromJson(json: any): LocationData {
  return {
    latitude: Number(json.latitude),
    longitude: Number(json.longitude),
    city: json.city ?? '',
    state: json.state ?? '',
    country: json.country ?? '',
  };
}

export function locationDataToJson(location: LocationData): any {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    city: location.city,
    state: location.state,
    country: location.country,
  };
}
