import { useState, useEffect } from "react";
import { makeStyles, CircularProgress, Typography } from "@material-ui/core";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

import { getGoogleMapApiKey } from "api/googleMap";

const containerStyle = {
  width: "100%",
  height: "350px",
  borderRadius: "5px",
  overflow: "hidden",
  marginBottom: "30px",
};
const libraries = ["places"];
const options = { disableDefaultUI: true };
const mapInitialCenter = { lat: 51.765419, lng: 55.119131 };
const markerPosition = { lat: 51.765419, lng: 55.119131 };

function Map({ apiKey }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  return (
    isLoaded && (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapInitialCenter}
        zoom={16}
        options={options}
      >
        <Marker position={markerPosition} />
      </GoogleMap>
    )
  );
}

const useStyles = makeStyles({
  mockContainer: {
    width: "100%",
    height: "350px",
    borderRadius: "5px",
    marginBottom: "30px",
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    display: "flex",

    "& > *": {
      margin: "auto",
    },
  },
});

function MapLoader() {
  const classes = useStyles();
  const [googleMap, setGoogleMap] = useState({ apiKey: null, error: null });

  useEffect(() => {
    (async function () {
      const { status, data } = await getGoogleMapApiKey();
      if (data) {
        setGoogleMap({ apiKey: data, error: null });
      } else {
        setGoogleMap({ apiKey: null, error: status });
      }
    })();
  }, []);

  return googleMap.apiKey ? (
    <Map apiKey={googleMap.apiKey} error={googleMap.error} />
  ) : (
    <div className={classes.mockContainer}>
      {googleMap.error ? (
        <Typography>{`Не удалось загрузить карту. Ошибка ${googleMap.error}.`}</Typography>
      ) : (
        <CircularProgress size={30} className={classes.progress} />
      )}
    </div>
  );
}

export default MapLoader;
