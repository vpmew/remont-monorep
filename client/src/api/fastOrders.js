import axios from "utils/axios";

export async function createFastOrder(values, fingerprint) {
  try {
    const { status } = await axios.post("/api/fast-orders/", {
      values,
      fingerprint,
    });
    return { status };
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

export async function getFastOrders() {
  try {
    const { status, data } = await axios.get(`/api/fast-orders/`);
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
