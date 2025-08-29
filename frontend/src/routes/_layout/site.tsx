import {
  Box,
  Container,
  Text,
  Link,
  Flex,
  Spinner,
  FormControl,
  FormLabel,
  Input,
  Grid,
  GridItem,
  Button,
  Select,
  Alert,
  AlertIcon,
  useToast
} from "@chakra-ui/react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import icon from "../../assets/images/pin-48.svg";
import L from "leaflet";
import FaqComponent from "../../components/Faqs/FaqComponent";
import {
  ApiError,
  SiteCreate,
  SitePublic,
  SiteService,
  SiteUpdate,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { FiTrash } from "react-icons/fi";
import { type SubmitHandler, useForm } from "react-hook-form";
import NextPreviousButtons from "../../components/Common/NextPreviousButtons";

import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

const iconmarker = new L.Icon({
  iconUrl: icon,
  iconSize: new L.Point(50, 65),
});

const center = {
  lat: 39.8283,
  lng: -103.8233,
};

// Click Handler Component
function MapClickHandler({ onMapClick, enabled }: { onMapClick: (latlng: L.LatLngLiteral) => void, enabled: boolean }) {
  useMapEvents({
    click: (e) => {
      if (enabled) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

const SearchControl = ({
  onLocationSelect,
}: {
  onLocationSelect: (latlng: L.LatLngLiteral) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = GeoSearchControl({
      provider,
      style: "bar",
      showMarker: false,
      showPopup: true,
      autoClose: true,
      retainZoomLevel: true,
      animateZoom: true,
      keepResult: true,
      searchLabel: "Search location...",
    });

    map.addControl(searchControl);

    map.on("geosearch/showlocation", (result: any) => {
      const { location } = result;
      if (location && location.y && location.x) {
        onLocationSelect({ lat: location.y, lng: location.x });
      }
    });

    return () => {
      map.removeControl(searchControl);
      map.off("geosearch/showlocation");
    };
  }, [map, onLocationSelect]);

  return null;
};

// Improved altitude fetching with better error handling
const getAltitude = async (lat: number, lng: number): Promise<number | null> => {
  try {
    const response = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
    );
    if (!response.ok) {
      console.warn("Elevation API returned non-200 status");
      return null;
    }
    const data = await response.json();
    return data.results[0]?.elevation ?? null;
  } catch (error) {
    console.error("Error fetching elevation data:", error);
    return null;
  }
};

// Map Component that receives and updates position
const MapComponent = ({
  position,
  draggable,
  onPositionChange,
  isLoading,
}: {
  position: L.LatLngLiteral;
  setPosition: React.Dispatch<React.SetStateAction<L.LatLngLiteral>>;
  draggable: boolean;
  onPositionChange: (latlng: L.LatLngLiteral) => void;
  isLoading: boolean;
}) => {
  const markerRef = useRef<any>(null);

  // Handle marker drag
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newLatLng = marker.getLatLng();
          onPositionChange(newLatLng);
        }
      },
    }),
    [onPositionChange]
  );

  // Handle map click
  const handleMapClick = (latlng: L.LatLngLiteral) => {
    if (draggable) {
      onPositionChange(latlng);
    }
  };

  // Update map center when position changes
  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      map.setView([position.lat, position.lng], map.getZoom());
    }, [position, map]);
    return null;
  };

  return (
    <MapContainer
      center={position}
      zoom={5}
      style={{ height: "55vh", width: "100%", opacity: isLoading ? 0.6 : 1 }}
    >
      <MapUpdater />
      <MapClickHandler onMapClick={handleMapClick} enabled={draggable} />
      <SearchControl
        onLocationSelect={onPositionChange}
      />
      <TileLayer
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      <TileLayer
        attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ'
        url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
      />
      <Marker
        draggable={draggable}
        eventHandlers={eventHandlers}
        position={position}
        icon={iconmarker}
        ref={markerRef}
      />
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <Spinner size="xl" />
        </div>
      )}
    </MapContainer>
  );
};

const SimpleMap = () => {
  const showToast = useCustomToast();
  const toast = useToast();
  const [position, setPosition] = useState(center);
  const [selectedOption, setSelectedOption] = useState("None");
  const [draggable, setDraggable] = useState(true);
  const [siteid, setSiteid] = useState(0);
  const [altitude, setAltitude] = useState("0");
  const [lat, setLat] = useState("39.8283");
  const [long, setLong] = useState("-103.8233");
  const [sitenameInput, setsitenameInput] = useState("");
  const [saveOption, setSaveOption] = useState("create");
  const [disable, setDisable] = useState(false);
  const [isLoadingElevation, setIsLoadingElevation] = useState(false);

  const queryClient = useQueryClient();

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = useForm<SitePublic>({
    criteriaMode: "all",
  });

  // Query for site data
  const {
    data: sites,
    isLoading: sitesLoading,
    isFetching: sitesFetching
  } = useQuery({
    queryKey: ["readSite"],
    queryFn: () => SiteService.readSites(),
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: SiteUpdate) =>
      SiteService.updateSite({ id: siteid, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Site updated successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ["readSite"] });
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => SiteService.deleteSite({ id: siteid }),
    onSuccess: () => {
      showToast("Success!", "Site deleted successfully.", "success");
      resetFormAndState();
      queryClient.invalidateQueries({ queryKey: ["readSite"] });
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: SiteCreate) =>
      SiteService.createSite({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Site created successfully.", "success");
      resetFormAndState();
      queryClient.invalidateQueries({ queryKey: ["readSite"] });
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
  });

  // Reset form function
  const resetFormAndState = () => {
    setSelectedOption("None");
    setDraggable(true);
    setDisable(false);
    setsitenameInput("");
    setAltitude("0");
    setLat(center.lat.toString());
    setLong(center.lng.toString());
    setPosition(center);
    setSaveOption("create");
    reset(); // Reset form fields
  };

  // Handle form submission
  const onSubmit: SubmitHandler<SiteUpdate> = async (data: any) => {
    // Basic validation
    if (!sitenameInput.trim()) {
      toast({
        title: "Site name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    data.rlat = position.lat;
    data.rlon = position.lng;
    data.altitude = parseFloat(altitude) || 0;
    data.sitename = sitenameInput;
    
    if (saveOption === "update") {
      updateMutation.mutate(data);
    } else if (saveOption === "create") {
      saveMutation.mutate(data);
    }
  };

  // Handle dropdown change - select site
  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const eventValue = event.target.value;
    
    if (eventValue === "") {
      // User selected "Select from list" (None)
      resetFormAndState();
      return;
    }
    
    if (eventValue === "new") {
      // New site selected
      setSelectedOption("new");
      setsitenameInput("");
      setDisable(false);
      setDraggable(true);
      setSaveOption("create");
      
      // Try to get current location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          function (position) {
            const newPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            handlePositionChange(newPos);
          },
          function(error) {
            console.warn("Geolocation error:", error);
            // Keep default position if geolocation fails
          }
        );
      }
      return;
    }
    
    // Existing site selected
    setSelectedOption(eventValue);
    if (sites) {
      const selectedSite = sites.data.find((eachSite: any) => eachSite.id == eventValue);
      if (selectedSite) {
        const newPos = { lat: selectedSite.rlat, lng: selectedSite.rlon };
        setPosition(newPos);
        setSiteid(parseInt(eventValue));
        setDraggable(false);
        setLat(selectedSite.rlat.toString());
        setLong(selectedSite.rlon.toString());
        setAltitude(selectedSite.altitude?.toString() || "0");
        setsitenameInput(selectedSite.sitename);
        setSaveOption("update");
        setDisable(true);
      }
    }
  };

  // Handle position changes from marker drag or map click
  const handlePositionChange = async (newPos: L.LatLngLiteral) => {
    setPosition(newPos);
    setLat(newPos.lat.toString());
    setLong(newPos.lng.toString());
    
    // Fetch altitude data
    setIsLoadingElevation(true);
    try {
      const alt = await getAltitude(newPos.lat, newPos.lng);
      if (alt !== null) {
        setAltitude(alt.toString());
      }
    } catch (error) {
      console.error("Failed to fetch altitude:", error);
    } finally {
      setIsLoadingElevation(false);
    }
    
    // Auto-select "Add a new site" if not already selected
    if (selectedOption !== "new") {
      setSelectedOption("new");
      setsitenameInput("");
      setDisable(false);
      setDraggable(true);
      setSaveOption("create");
    }
  };

  // Delete site handler
  const onDelete = () => {
    if (window.confirm("Are you sure you want to delete this site?")) {
      deleteMutation.mutate();
    }
  };

  // Handle manual latitude input
  const handleLatitudeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newLatitude = event.target.value;
    if (newLatitude === "" || newLatitude === "-") {
      setLat(newLatitude);
      return;
    }
    
    if (/^-?\d*\.?\d*$/.test(newLatitude)) {
      setLat(newLatitude);
      if (!isNaN(parseFloat(newLatitude)) && parseFloat(newLatitude) >= -90 && parseFloat(newLatitude) <= 90) {
        setPosition({
          lat: parseFloat(newLatitude),
          lng: parseFloat(long),
        });
      }
    } else {
      showToast("Please enter a valid latitude value (-90 to 90)", "", "error");
    }
  };

  // Handle manual longitude input
  const handleLongitudeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newLongitude = event.target.value;
    if (newLongitude === "" || newLongitude === "-") {
      setLong(newLongitude);
      return;
    }
    
    if (/^-?\d*\.?\d*$/.test(newLongitude)) {
      setLong(newLongitude);
      if (!isNaN(parseFloat(newLongitude)) && parseFloat(newLongitude) >= -180 && parseFloat(newLongitude) <= 180) {
        setPosition({
          lat: parseFloat(lat),
          lng: parseFloat(newLongitude),
        });
      }
    } else {
      showToast("Please enter a valid longitude value (-180 to 180)", "", "error");
    }
  };

  // Effect to update position when lat/long inputs change (with debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      const latNum = parseFloat(lat);
      const longNum = parseFloat(long);
      
      if (!isNaN(latNum) && !isNaN(longNum)) {
        setPosition({
          lat: latNum,
          lng: longNum,
        });
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [lat, long]);

  const isLoading = sitesLoading || sitesFetching || isLoadingElevation || 
                    updateMutation.isPending || saveMutation.isPending || deleteMutation.isPending;

  return (
    <Container maxW="full" mt={[4, 5]}>
      <Text fontSize="2xl" fontWeight="bold" mb={2}>Site Tab</Text>
      <Text mb={2}>
        Here we identify our agriculture SITE (for simulation purposes) with
        latitude, longitude, altitude and a name.
      </Text>
      <Link color="blue" href="https://youtu.be/VxEn6QM7nzU/" isExternal mb={4} display="inline-block">
        Click here to watch the Site Tab video tutorial
      </Link>

      {/* Move dropdown above map for better UX */}
      {!sitesLoading && sites && (
        <Box mb={4}>
          <Flex alignItems="center" gap={4}>
            <Box flex="1">
              <FormLabel fontWeight="bold" mb={1}>
                Select Site or Add a New Site
              </FormLabel>
              <Select
                maxW="sm"
                placeholder="Select from list"
                value={selectedOption}
                id="dropdown"
                onChange={handleDropdownChange}
                isDisabled={isLoading}
              >
                <option value="new">Add a new site</option>
                {sites.data.map((eachSite) => (
                  <option key={eachSite.id} value={eachSite.id}>
                    {eachSite.sitename}
                  </option>
                ))}
              </Select>
            </Box>
            <Alert status="info" py={2} px={3} fontSize="sm" maxW="md" borderRadius="md">
              <AlertIcon boxSize="4" />
              <Text fontSize="xs">Click anywhere on the map, Drag the marker or Use search Box</Text>
            </Alert>
          </Flex>
        </Box>
      )}

      {/* Map component */}
      <Box position="relative" mb={6} borderRadius="md" overflow="hidden" borderWidth="1px">
        {sitesLoading ? (
          <Flex justify="center" align="center" height="55vh" width="100%">
            <Spinner size="xl" color="ui.main" />
          </Flex>
        ) : (
          <MapComponent 
            position={position} 
            setPosition={setPosition}
            draggable={draggable}
            onPositionChange={handlePositionChange}
            isLoading={isLoading}
          />
        )}
      </Box>

      {/* Form fields */}
      <Grid
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        templateColumns={["1fr", "1fr 1fr", "repeat(4, 1fr)", "repeat(5, 1fr)"]}
        gap={6}
        mb={6}
      >
        <GridItem>
          <FormControl isInvalid={!!errors.rlat}>
            <FormLabel>Latitude</FormLabel>
            <Input
              value={lat}
              onChange={handleLatitudeChange}
              disabled={disable || isLoading}
              isRequired
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl isInvalid={!!errors.rlon}>
            <FormLabel>Longitude</FormLabel>
            <Input
              value={long}
              onChange={handleLongitudeChange}
              disabled={disable || isLoading}
              isRequired
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl>
            <FormLabel>Altitude (m)</FormLabel>
            <Input
              placeholder="0"
              value={altitude}
              onChange={(e) => setAltitude(e.target.value)}
              disabled={isLoading}
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl isInvalid={!!errors.sitename}>
            <FormLabel>Site Name</FormLabel>
            <Input
              placeholder="Enter Site Name"
              value={sitenameInput}
              onChange={(e) => setsitenameInput(e.target.value)}
              disabled={disable || isLoading}
              isRequired
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <Box mt={8}>
            {selectedOption === "None" ? null : selectedOption === "new" ? (
              <Button
                colorScheme="teal"
                type="submit"
                isLoading={isSubmitting || isLoading}
                isDisabled={!sitenameInput.trim()}
              >
                Save
              </Button>
            ) : (
              <Flex direction="row" align="center" gap={2}>
                <Button
                  colorScheme="teal"
                  type="submit"
                  isLoading={isSubmitting || isLoading}
                >
                  Update
                </Button>
                <Button
                  colorScheme="red"
                  onClick={onDelete}
                  isLoading={isSubmitting || isLoading}
                >
                  <FiTrash fontSize="16px" />
                </Button>
              </Flex>
            )}
          </Box>
        </GridItem>
      </Grid>

      <NextPreviousButtons />
      <FaqComponent tabname={"Site"} />
    </Container>
  );
};

export const Route = createFileRoute("/_layout/site")({
  component: SimpleMap,
});