import { Box, Container, Text, Link } from "@chakra-ui/react"
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import icon from "../../assets/images/pin-48.svg"
import L from 'leaflet';
import FaqComponent from "../../components/Faqs/FaqComponent";
import { ApiError, SiteCreate, SitePublic, SiteService, SiteUpdate } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"

import { FiTrash } from "react-icons/fi"
import {
  Flex,
  Spinner,
  FormControl,
  FormLabel,
  Input,
  Grid,
  GridItem,
  Button,
  Select,

} from '@chakra-ui/react'
import { type SubmitHandler, useForm } from "react-hook-form"
import NextPreviousButtons from "../../components/Common/NextPreviousButtons";
const iconmarker = new L.Icon({
  iconUrl: icon,
  iconSize: new L.Point(50, 65),
});

const center = {
  lat: 39.8283,
  lng: -103.8233
}


const SimpleMap = () => {
  const showToast = useCustomToast()
  const [position, setPosition] = useState(center)

  const [selectedOption, setSelectedOption] = useState("None");
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SitePublic>({
    mode: "onBlur",
    criteriaMode: "all",
  })


  const updateMutation = useMutation({
    mutationFn: (data: SiteUpdate) =>
      SiteService.updateSite({ id: siteid, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Site updated successfully.", "success")
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      // TODO: can we do just one call now?
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: () =>
      SiteService.deleteSite({ id: siteid }),
    onSuccess: () => {
      showToast("Success!", "Site Deleted successfully.", "success")
      location.reload();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      // TODO: can we do just one call now?
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
  const saveMutation = useMutation({
    mutationFn: (data: SiteCreate) =>
      SiteService.createSite({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Site Created successfully.", "success")
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      // TODO: can we do just one call now?
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
  const onSubmit: SubmitHandler<SiteUpdate> = async (data: any) => {
    data.rlat = position.lat;
    data.rlon = position.lng;
    if (saveOption === 'update') {
      updateMutation.mutate(data)
    }
    else if (saveOption === 'create') {
      saveMutation.mutate(data)
    }
    else if (saveOption === 'delete') {
      deleteMutation.mutate()
    }
  }
  //update end//       

  const {
    data: sites,
    isLoading,
  } = useQuery({
    queryKey: ["readSite"],
    queryFn: () => SiteService.readSites(),
  })
  const handleDropdownChange = (event: any) => {
    var eventValue = event.target.value
    if (eventValue != '') {
      setSelectedOption(eventValue);
      if (eventValue !== 'new' && sites) {
        sites.data.forEach((eachSite: any) => {
          if (eachSite.id == eventValue) {
            setPosition({ 'lat': eachSite.rlat, 'lng': eachSite.rlon });
            setSiteid(eventValue)
            setDraggable(false)
            setLat(eachSite.rlat)
            setLong(eachSite.rlon)
            setAltitude(eachSite.altitude)
            setsitenameInput(eachSite.sitename)
            setSaveOption("update")
            setDisable(true)

          }
        });
      }
      else if (eventValue === 'new') {
        setsitenameInput("")
        setDisable(false)
        setDraggable(true)
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(function (position) {
            setPosition({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          });
        } else {
          console.log("Geolocation is not available in your browser.");
        }
        setSaveOption("create")
      }
    }
    else {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        });
      } else {
        console.log("Geolocation is not available in your browser.");
      }
      setSaveOption("create")
      setSelectedOption("None")
    }
  };
  const [draggable, setDraggable] = useState(true)
  const [siteid, setSiteid] = useState(0)
  const [altitude, setAltitude] = useState("0")
  const [lat, setLat] = useState('39.8283')
  const [long, setLong] = useState('-103.8233')
  const [sitenameInput, setsitenameInput] = useState("")
  const [saveOption, setSaveOption] = useState("create")
  const [disable, setDisable] = useState(false)
  const markerRef = useRef<any>(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          setPosition(marker.getLatLng())
          setLat(marker.getLatLng().lat)
          setLong(marker.getLatLng().lng)

        }
      },
    }),
    [],
  )
  const onDelete = () => {
    setSaveOption('delete')
  }
  const handleLatitudeChange = (event: any) => {
    const newLatitude = parseFloat(event.target.value);
    if (!isNaN(newLatitude)) { // Check for valid number
      setLat(newLatitude.toString());
      setPosition({
        lat: newLatitude,
        lng: parseFloat(long)
      })
    } else {
      showToast("Please enter Valid Value", "", "error")
    }
  };

  const handleLongitudeChange = (event: any) => {
    const newLongitude = parseFloat(event.target.value);
    if (!isNaN(newLongitude)) {
      setLong(newLongitude.toString());
      setPosition({
        lat: parseFloat(lat),
        lng: newLongitude
      })
    } else {
      showToast("Please enter Valid Value", "", "error")
    }
  };


  return (

    <Container maxW="full" mt={[4, 5]}>
      <Text fontSize="2xl">
        Site Tab
      </Text>
      <Text>Here we identify our agriculture SITE (for simulation purposes) with latitude, longitude, altitude and a name. From the LIST box underneath, we can define our SITE or update the existing SITE.</Text>

      <Link color='blue' href='https://youtu.be/VxEn6QM7nzU/' isExternal>
        Click here to watch
        the Site Tab video tutorial
      </Link>
      {isLoading ? (
        // TODO: Add skeleton
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        sites && (
          <Select maxW="sm" placeholder="Select from list" value={selectedOption} mt={7} id="dropdown" onChange={handleDropdownChange}>
            <option value="new"> Add a new site</option>
            {sites.data.map((eachSite) => (
              <option value={eachSite.id}>{eachSite.sitename}</option>
            ))}

          </Select>
        ))}

      <MapContainer 
      key={JSON.stringify([lat, long])}
      center={position} zoom={5} style={{ height: "55vh", width: "75vw" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          draggable={draggable}
          eventHandlers={eventHandlers}
          position={position}
          icon={iconmarker}
          ref={markerRef}>

        </Marker>
      </MapContainer>

      {selectedOption != 'None' && (
        <Grid templateColumns='repeat(5, 1fr)' gap={6} as="form" onSubmit={handleSubmit(onSubmit)}>
          <GridItem w='100%' h='10' mt={4}>
            <FormControl >
              <FormLabel htmlFor="lat">Latitude</FormLabel>
              <Input
                id="lat"
                type="text"
                {...register("rlat")}
                value={lat}
                onChange={handleLatitudeChange}
                disabled={disable}
              />

            </FormControl>
          </GridItem>
          <GridItem w='100%' h='10' >
            <FormControl mt={4} >
              <FormLabel htmlFor="lang">Longitude</FormLabel>
              <Input
                id="lang"
                type="text"
                value={long}
                {...register("rlon")}
                onChange={handleLongitudeChange}
                disabled={disable}

              />

            </FormControl></GridItem>
          <GridItem w='100%' h='10' >
            <FormControl mt={4} >
              <FormLabel htmlFor="altitude">Altitude</FormLabel>
              <Input
                id="altitude"
                type="text"
                placeholder="0"
                {...register("altitude")}
                value={altitude} onChange={e => setAltitude(e.target.value)}


              />
            </FormControl></GridItem>
          <GridItem w='100%' h='10' >
            <FormControl mt={4} >
              <FormLabel htmlFor="sName">Site Name</FormLabel>
              <Input
                id="sName"
                type="text"
                placeholder="Enter Site Name"
                {...register('sitename')}
                value={sitenameInput}
                disabled={disable}
                onChange={e => setsitenameInput(e.target.value)}


              />

            </FormControl>
          </GridItem>
          <GridItem w='100%' h='10'>


            <Box>
              {selectedOption === 'new' && (
                <Button colorScheme='teal' size='md' name="save" mt={12}
                  type="submit"
                  isLoading={isSubmitting}>
                  Save
                </Button>
              )}
              {selectedOption != 'new' && (
                <Button colorScheme='teal' ml={25} size='md' name="update" mt={12}
                  type="submit"
                  isLoading={isSubmitting}
                >
                  update
                </Button>
              )}
              {selectedOption != 'new' && (
                <Button colorScheme='red' ml={25} size='md' name="delete" mt={12}
                  type="submit"
                  isLoading={isSubmitting} onClick={onDelete}>
                  {<FiTrash fontSize="16px" />}
                </Button>
              )}

            </Box>
          </GridItem>
        </Grid>
      )}
      <br></br>
      <br></br>
<NextPreviousButtons />
<FaqComponent tabname={'Site'} />
    </Container>
  );
};

export const Route = createFileRoute("/_layout/site")({
  component: SimpleMap,
})
