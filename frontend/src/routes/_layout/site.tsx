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
  AlertIcon
} from "@chakra-ui/react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
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

// Add this function above your component
const getAltitude = async (lat: number, lng: number): Promise<number | null> => {
  try {
    const response = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
    );
    const data = await response.json();
    return data.results[0]?.elevation ?? null;
  } catch {
    return null;
  }
};

const SimpleMap = () => {
  const showToast = useCustomToast();
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

  const markerRef = useRef<any>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SitePublic>({
    mode: "onBlur",
    criteriaMode: "all",
  });

  const updateMutation = useMutation({
    mutationFn: (data: SiteUpdate) =>
      SiteService.updateSite({ id: siteid, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Site updated successfully.", "success");
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => SiteService.deleteSite({ id: siteid }),
    onSuccess: () => {
      showToast("Success!", "Site Deleted successfully.", "success");
      location.reload();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: SiteCreate) =>
      SiteService.createSite({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Site Created successfully.", "success");
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const onSubmit: SubmitHandler<SiteUpdate> = async (data: any) => {
    data.rlat = position.lat;
    data.rlon = position.lng;
    if (saveOption === "update") {
      updateMutation.mutate(data);
    } else if (saveOption === "create") {
      saveMutation.mutate(data);
    } else if (saveOption === "delete") {
      deleteMutation.mutate();
    }
  };

  const {
    data: sites,
    isLoading,
  } = useQuery({
    queryKey: ["readSite"],
    queryFn: () => SiteService.readSites(),
  });

  const handleDropdownChange = (event: any) => {
    var eventValue = event.target.value;
    if (eventValue !== "") {
      setSelectedOption(eventValue);
      if (eventValue !== "new" && sites) {
        sites.data.forEach((eachSite: any) => {
          if (eachSite.id == eventValue) {
            setPosition({ lat: eachSite.rlat, lng: eachSite.rlon });
            setSiteid(eventValue);
            setDraggable(false);
            setLat(eachSite.rlat);
            setLong(eachSite.rlon);
            setAltitude(eachSite.altitude);
            setsitenameInput(eachSite.sitename);
            setSaveOption("update");
            setDisable(true);
          }
        });
      } else if (eventValue === "new") {
        setsitenameInput("");
        setDisable(false);
        setDraggable(true);
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(function (position) {
            setPosition({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          });
        }
        setSaveOption("create");
      }
    } else {
      // User selected "Select from list" (None)
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        });
      }
      setSaveOption("create");
      setSelectedOption("None");
      setDraggable(true);      // <-- Add this line
      setDisable(false);       // <-- Add this line
      setsitenameInput("");    // Optionally clear site name
      setAltitude("0");        // Optionally reset altitude
      setLat(center.lat.toString());      // Optionally reset lat/long to center
      setLong(center.lng.toString());
    }
  };

  // Update marker dragend handler to fetch altitude
  const eventHandlers = useMemo(
    () => ({
      async dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newLatLng = marker.getLatLng();
          setPosition(newLatLng);
          setLat(newLatLng.lat);
          setLong(newLatLng.lng);
          // Fetch altitude and update state
          const alt = await getAltitude(newLatLng.lat, newLatLng.lng);
          if (alt !== null) setAltitude(alt.toString());
          // Auto-select "Add a new site" if not already selected
          if (selectedOption !== "new") {
            setSelectedOption("new");
            setsitenameInput("");
            setDisable(false);
            setDraggable(true);
            setSaveOption("create");
          }
        }
      },
    }),
    [selectedOption]
  );

  const onDelete = () => {
    setSaveOption("delete");
  };

  const handleLatitudeChange = (event: any) => {
    let newLatitude = event.target.value;
    if (newLatitude === "" || newLatitude === "-") {
      setLat(newLatitude);
      return;
    }
    if (/^-?\d*\.?\d*$/.test(newLatitude)) {
      setLat(newLatitude);
      if (!isNaN(parseFloat(newLatitude))) {
        setPosition({
          lat: parseFloat(newLatitude),
          lng: parseFloat(long),
        });
      }
    } else {
      showToast("Please enter a valid latitude value", "", "error");
    }
  };

  const handleLongitudeChange = (event: any) => {
    let newLongitude = event.target.value;
    if (newLongitude === "" || newLongitude === "-") {
      setLong(newLongitude);
      return;
    }
    if (/^-?\d*\.?\d*$/.test(newLongitude)) {
      setLong(newLongitude);
      if (!isNaN(parseFloat(newLongitude))) {
        setPosition({
          lat: parseFloat(lat),
          lng: parseFloat(newLongitude),
        });
      }
    } else {
      showToast("Please enter a valid longitude value", "", "error");
    }
  };

  return (
    <Container maxW="full" mt={[4, 5]}>
      <Text fontSize="2xl">Site Tab</Text>
      <Text>
        Here we identify our agriculture SITE (for simulation purposes) with
        latitude, longitude, altitude and a name...
      </Text>
      <Link color="blue" href="https://youtu.be/VxEn6QM7nzU/" isExternal>
        Click here to watch the Site Tab video tutorial
      </Link>

      {/* Alert for user guidance */}
      <Alert status="info" mt={4} mb={4}>
        <AlertIcon />
        Drag the marker or use the search box to find and set your site location.
      </Alert>

      {isLoading ? (
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        sites && null // Remove dropdown from here
      )}

    <MapContainer
      center={position}
      zoom={5}
      style={{ height: "55vh", width: "75vw" }}
    >
      <SearchControl
        onLocationSelect={async (latlng) => {
          setPosition(latlng);
          setLat(latlng.lat.toString());
          setLong(latlng.lng.toString());
          // Fetch altitude and update state
          const alt = await getAltitude(latlng.lat, latlng.lng);
          if (alt !== null) setAltitude(alt.toString());
          // Auto-select "Add a new site" if not already selected
          if (selectedOption !== "new") {
            setSelectedOption("new");
            setsitenameInput("");
            setDisable(false);
            setDraggable(true);
            setSaveOption("create");
          }
        }}
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
    </MapContainer>

      {/* Move dropdown here */}
      {!isLoading && sites && (
        <Box mt={6} mb={2}>
            <FormLabel fontWeight="bold" mb={1}>
    Select Site or Add a New Site
  </FormLabel>
          <Select
            maxW="sm"
            placeholder="Select from list"
            value={selectedOption}
            id="dropdown"
            onChange={handleDropdownChange}
          >
            <option value="new">Add a new site</option>
            {sites.data.map((eachSite) => (
              <option key={eachSite.id} value={eachSite.id}>
                {eachSite.sitename}
              </option>
            ))}
          </Select>
        </Box>
      )}

      {selectedOption !== "None" && (
        <Grid
          templateColumns={["1fr", "1fr 1fr", "repeat(4, 1fr)", "repeat(5, 1fr)"]}
          gap={6}
          as="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <GridItem>
            <FormControl>
              <FormLabel>Latitude</FormLabel>
              <Input
                value={lat}
                onChange={handleLatitudeChange}
                disabled={disable}
              />
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel>Longitude</FormLabel>
              <Input
                value={long}
                onChange={handleLongitudeChange}
                disabled={disable}
              />
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel>Altitude (m)</FormLabel>
              <Input
                placeholder="0"
                {...register("altitude")}
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
              />
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel>Site Name</FormLabel>
              <Input
                placeholder="Enter Site Name"
                {...register("sitename")}
                value={sitenameInput}
                onChange={(e) => setsitenameInput(e.target.value)}
                disabled={disable}
              />
            </FormControl>
          </GridItem>

          <GridItem>
            <Box mt={8}>
              {selectedOption === "new" ? (
                <Button
                  colorScheme="teal"
                  type="submit"
                  isLoading={isSubmitting}
                >
                  Save
                </Button>
              ) : (
                <Flex direction="row" align="center" gap={2}>
                  <Button
                    colorScheme="teal"
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    Update
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={onDelete}
                    isLoading={isSubmitting}
                  >
                    <FiTrash fontSize="16px" />
                  </Button>
                </Flex>
              )}
            </Box>
          </GridItem>
        </Grid>
      )}

      <br />
      <NextPreviousButtons />
      <FaqComponent tabname={"Site"} />
    </Container>
  );
};

export const Route = createFileRoute("/_layout/site")({
  component: SimpleMap,
});
