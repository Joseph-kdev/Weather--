// LocationIQ API response types
export interface LocationIQAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  county?: string;
  state?: string;
  state_code?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
  attraction?: string;
}

export interface LocationIQResponse {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: string;
  lon: string;
  display_name: string;
  address: LocationIQAddress;
  boundingbox: [string, string, string, string];
  distance?: number; // Only if showdistance=1
}

// Custom response types for your app
export interface ReverseGeocodeOptions {
  zoom?: number;
  language?: string;
  addressDetails?: boolean;
  normalizedAddress?: boolean;
  showDistance?: boolean;
  namedetails?: boolean;
}

interface FormattedAddress {
  houseNumber?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  county?: string;
  state?: string;
  stateCode?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
}

interface ReverseGeocodeSuccess {
  success: true;
  displayName: string;
  address: FormattedAddress;
  coordinates: {
    lat: string;
    lon: string;
  };
  boundingBox: [string, string, string, string];
  raw: LocationIQResponse;
}

interface ReverseGeocodeError {
  success: false;
  error: string;
  status?: number;
}

type ReverseGeocodeResult = ReverseGeocodeSuccess | ReverseGeocodeError;

// Main function
export async function reverseGeocode(
  lat: number,
  lon: number,
  options: ReverseGeocodeOptions = {}
): Promise<ReverseGeocodeResult> {
  // Validate required parameters
  if (lat === undefined || lon === undefined) {
    throw new Error('Latitude and longitude are required');
  }

  // Your LocationIQ API key (store in environment variables)
  const API_KEY = process.env.LOCATIONIQ_API_KEY;
  if (!API_KEY) {
    throw new Error('LocationIQ API key is missing');
  }

  // Default parameters
  const defaultParams = {
    key: API_KEY,
    lat: lat.toString(),
    lon: lon.toString(),
    format: 'json' as const,
    addressdetails: options.addressDetails !== undefined ? (options.addressDetails ? 1 : 0) : 1,
    normalizedaddress: options.normalizedAddress !== undefined ? (options.normalizedAddress ? 1 : 0) : 1,
    zoom: options.zoom ?? 18,
    'accept-language': options.language ?? 'en',
    showdistance: options.showDistance ? 1 : 0,
    namedetails: options.namedetails ? 1 : 0,
  };

  // Build URL with query parameters
  const url = new URL('https://us1.locationiq.com/v1/reverse');
  Object.entries(defaultParams).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, value.toString());
    }
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LocationIQ API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as LocationIQResponse;

    // Return formatted response
    return {
      success: true,
      displayName: data.display_name,
      address: {
        houseNumber: data.address?.house_number,
        road: data.address?.road,
        neighbourhood: data.address?.neighbourhood,
        suburb: data.address?.suburb,
        city: data.address?.city,
        county: data.address?.county,
        state: data.address?.state,
        stateCode: data.address?.state_code,
        postcode: data.address?.postcode,
        country: data.address?.country,
        countryCode: data.address?.country_code,
      },
      coordinates: {
        lat: data.lat,
        lon: data.lon,
      },
      boundingBox: data.boundingbox,
      raw: data,
    };

  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    
    // Type guard for Error objects
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return {
          success: false,
          error: 'Request timeout - LocationIQ service took too long to respond',
        };
      } else if (error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error - could not reach LocationIQ service',
        };
      }
      
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: 'An unknown error occurred',
    };
  }
}
