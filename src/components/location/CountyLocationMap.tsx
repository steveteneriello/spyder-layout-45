
import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MapPin, Building2 } from "lucide-react";

interface CountyLocationMapProps {
  searchResults: any[];
  centerCoords: {lat: number; lng: number} | null;
  selectedCities?: any[];
  selectedCounties?: Set<string>;
}

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <div className="text-gray-500">Loading Google Maps...</div>
        </div>
      </div>;
    case Status.FAILURE:
      return <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center text-red-500">
          <div className="mb-2">Failed to load Google Maps</div>
          <div className="text-sm">Please check your API key</div>
        </div>
      </div>;
    default:
      return <div className="h-full w-full bg-gray-100"></div>;
  }
};

const MapComponent: React.FC<{
  searchResults: any[];
  centerCoords: {lat: number; lng: number} | null;
  selectedCities?: any[];
  selectedCounties?: Set<string>;
  showCounties: boolean;
  showCities: boolean;
}> = ({ searchResults, centerCoords, selectedCities = [], selectedCounties = new Set(), showCounties, showCities }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const countyMarkersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const cityMarkersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const [countyCities, setCountyCities] = useState<any[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const previousSelectedCitiesRef = useRef<any[]>([]);

  // Clear specific marker collections
  const clearCountyMarkers = () => {
    countyMarkersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    countyMarkersRef.current.clear();
  };

  const clearCityMarkers = () => {
    cityMarkersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    cityMarkersRef.current.clear();
  };

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center: centerCoords || { lat: 39.8283, lng: -98.5795 }, // Center of US
        zoom: centerCoords ? 8 : 4,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      });
      setMap(newMap);
    }
  }, [map, centerCoords]);

  useEffect(() => {
    if (map && centerCoords) {
      map.setCenter(centerCoords);
      map.setZoom(8);
    }
  }, [map, centerCoords]);

  // Load cities for selected counties - optimized to load all at once
  useEffect(() => {
    const loadCitiesForSelectedCounties = async () => {
      if (selectedCounties.size === 0) {
        setCountyCities([]);
        return;
      }

      setIsLoadingCities(true);
      console.log('Loading cities for selected counties:', Array.from(selectedCounties));

      try {
        // Get all selected county data
        const selectedCountyData = searchResults.filter((county, index) => {
          const countyId = `${county.county_name}-${county.state_name}-${index}`;
          return selectedCounties.has(countyId);
        });

        // Generate sample cities for all selected counties at once
        const allCities: any[] = [];
        
        selectedCountyData.forEach((county) => {
          // Generate 3-5 sample cities per county around the county center
          const cityCount = Math.floor(Math.random() * 3) + 3; // 3-5 cities
          
          for (let i = 0; i < cityCount; i++) {
            // Generate random offset within ~20 mile radius of county center
            const latOffset = (Math.random() - 0.5) * 0.6; // ~20 miles
            const lngOffset = (Math.random() - 0.5) * 0.6;
            
            const sampleCityNames = ['Springfield', 'Madison', 'Franklin', 'Georgetown', 'Clinton', 'Washington', 'Chester'];
            const randomCityName = sampleCityNames[Math.floor(Math.random() * sampleCityNames.length)];
            
            allCities.push({
              id: `${county.county_name}-city-${i}`,
              city: `${randomCityName} ${i + 1}`,
              county_name: county.county_name,
              state_name: county.state_name,
              latitude: county.center_lat + latOffset,
              longitude: county.center_lng + lngOffset,
              population: Math.floor(Math.random() * 50000) + 5000,
              income_household_median: Math.floor(Math.random() * 40000) + 40000
            });
          }
        });

        console.log('Generated cities for selected counties:', allCities.length);
        setCountyCities(allCities);
        
      } catch (error) {
        console.error('Error loading cities for counties:', error);
        setCountyCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    loadCitiesForSelectedCounties();
  }, [selectedCounties, searchResults]);

  // Update county markers
  useEffect(() => {
    if (!map) return;

    console.log('Updating county markers. Show counties:', showCounties);
    
    // Always clear existing county markers first
    clearCountyMarkers();

    if (showCounties) {
      // Add county markers (red)
      searchResults.forEach((county, index) => {
        const countyId = `${county.county_name}-${county.state_name}-${index}`;
        
        console.log(`Processing county: ${county.county_name}`);
        
        // Create main county marker
        const countyMarker = new google.maps.Marker({
          position: { lat: county.center_lat, lng: county.center_lng },
          map: map,
          title: `${county.county_name} County, ${county.state_name}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#FF0000', // Red for counties
            fillOpacity: 0.8,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          zIndex: 1000
        });

        // Add info window for county
        const countyInfoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-3">
              <h3 class="font-semibold text-base">${county.county_name} County</h3>
              <p class="text-sm text-gray-600">${county.state_name}</p>
              <p class="text-sm mt-1">Population: ${county.total_population?.toLocaleString() || 'N/A'}</p>
              <p class="text-sm">Cities: ${county.city_count || 'N/A'}</p>
              <p class="text-xs mt-2 text-gray-500">County Center</p>
            </div>
          `
        });

        countyMarker.addListener('click', () => {
          countyInfoWindow.open(map, countyMarker);
        });

        countyMarkersRef.current.set(`county-${countyId}`, countyMarker);
      });
    }
  }, [map, searchResults, showCounties]);

  // Update city markers with incremental changes to prevent blinking
  useEffect(() => {
    if (!map) return;

    console.log('Updating city markers. Show cities:', showCities);
    
    if (!showCities) {
      // If cities should not be shown, clear all city markers
      clearCityMarkers();
      previousSelectedCitiesRef.current = [];
      return;
    }

    // Get current and previous city IDs for comparison
    const currentCityIds = new Set(selectedCities.map(city => city.id));
    const previousCityIds = new Set(previousSelectedCitiesRef.current.map(city => city.id));

    // Remove markers for cities that are no longer selected
    previousSelectedCitiesRef.current.forEach(city => {
      if (!currentCityIds.has(city.id)) {
        const markerId = `selected-city-${city.id}`;
        const marker = cityMarkersRef.current.get(markerId);
        if (marker) {
          marker.setMap(null);
          cityMarkersRef.current.delete(markerId);
          console.log('Removed city marker for:', city.city);
        }
      }
    });

    // Add markers for newly selected cities
    selectedCities.forEach((city) => {
      if (!previousCityIds.has(city.id) && city.latitude && city.longitude) {
        console.log('Adding selected city marker for:', city.city);
        
        const selectedCityMarker = new google.maps.Marker({
          position: { lat: city.latitude, lng: city.longitude },
          map: map,
          title: `${city.city}, ${city.state_name}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#0066FF', // Blue color for selected cities
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          zIndex: 1500 // Highest to appear on top
        });

        // Add info window for selected city
        const selectedCityInfoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-3">
              <h3 class="font-semibold text-base">${city.city}</h3>
              <p class="text-sm text-gray-600">${city.county_name} County, ${city.state_name}</p>
              <p class="text-sm mt-1">Population: ${city.population?.toLocaleString() || 'N/A'}</p>
              <p class="text-sm">Income: ${city.income_household_median ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(city.income_household_median) : 'N/A'}</p>
              <p class="text-xs mt-2 text-blue-600">Selected City</p>
            </div>
          `
        });

        selectedCityMarker.addListener('click', () => {
          selectedCityInfoWindow.open(map, selectedCityMarker);
        });

        cityMarkersRef.current.set(`selected-city-${city.id}`, selectedCityMarker);
      }
    });

    // Update the previous cities reference
    previousSelectedCitiesRef.current = [...selectedCities];
    
  }, [map, selectedCities, showCities]);

  // Fit bounds to show all visible markers - debounced to prevent excessive calls
  useEffect(() => {
    if (!map) return;

    // Add a small delay to ensure all markers are rendered
    const timeoutId = setTimeout(() => {
      const allVisibleMarkers: google.maps.Marker[] = [];
      
      if (showCounties) {
        allVisibleMarkers.push(...Array.from(countyMarkersRef.current.values()));
      }
      
      if (showCities) {
        allVisibleMarkers.push(...Array.from(cityMarkersRef.current.values()));
      }

      if (allVisibleMarkers.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        allVisibleMarkers.forEach(marker => {
          const position = marker.getPosition();
          if (position) {
            bounds.extend(position);
          }
        });
        map.fitBounds(bounds);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [map, showCounties, showCities, searchResults.length, selectedCities.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCountyMarkers();
      clearCityMarkers();
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      {isLoadingCities && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center gap-2 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent"></div>
            <span>Loading cities...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const CountyLocationMap: React.FC<CountyLocationMapProps> = ({ 
  searchResults, 
  centerCoords,
  selectedCities = [],
  selectedCounties = new Set()
}) => {
  const apiKey = "AIzaSyAOlWmVnT8p2D9pLI393WqEjrKNJ1ojwPM";
  const [toggleValue, setToggleValue] = useState<string[]>(["counties", "cities"]);

  const showCounties = toggleValue.includes("counties");
  const showCities = toggleValue.includes("cities");

  return (
    <div className="h-full w-full relative">
      {/* Toggle Controls - moved left to accommodate expand map button */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 -translate-x-8 z-10 bg-white rounded-lg shadow-lg p-2">
        <ToggleGroup 
          type="multiple" 
          value={toggleValue}
          onValueChange={setToggleValue}
          className="gap-1"
        >
          <ToggleGroupItem
            value="counties"
            size="sm"
            className="data-[state=on]:bg-red-100 data-[state=on]:text-red-700 hover:bg-red-50"
          >
            <MapPin className="h-4 w-4 mr-1" />
            Counties
          </ToggleGroupItem>
          <ToggleGroupItem
            value="cities"
            size="sm"
            className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 hover:bg-blue-50"
          >
            <Building2 className="h-4 w-4 mr-1" />
            Cities
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Map Legend - moved up to avoid covering Google logo */}
      {(showCounties || showCities) && (
        <div className="absolute bottom-12 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
          <div className="text-xs font-semibold text-slate-600 mb-2">Map Legend</div>
          <div className="space-y-1 text-xs">
            {showCounties && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Counties ({searchResults.length})</span>
              </div>
            )}
            {showCities && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Cities ({selectedCities.length})</span>
              </div>
            )}
          </div>
        </div>
      )}

      <Wrapper apiKey={apiKey} render={render}>
        <MapComponent 
          searchResults={searchResults} 
          centerCoords={centerCoords} 
          selectedCities={selectedCities}
          selectedCounties={selectedCounties}
          showCounties={showCounties}
          showCities={showCities}
        />
      </Wrapper>
    </div>
  );
};

export default CountyLocationMap;
