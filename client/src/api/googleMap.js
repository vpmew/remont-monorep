import axios from "utils/axios";

async function getGoogleMapApiKey() {
  try {
    const { status, data } = await axios.get("/api/google-map");
    return { status, data };
  } catch (error) {
    let status;
    if (error.response) {
      status = error.response.status;
    } else if (error.request) {
      status = 503;
    } else {
      status = null;
    }
    return { status };
  }
}

export { getGoogleMapApiKey };
