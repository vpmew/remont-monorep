import axios from "utils/axios";

async function create(userName, email, password) {
  try {
    const { data, status } = await axios.post("/api/user", {
      userName,
      email,
      password,
    });
    return { data, status };
  } catch (error) {
    let status;
    const data = null;
    if (error.response) {
      status = error.response.status;
    } else if (error.request) {
      status = 503;
    } else {
      status = null;
    }
    return { data, status };
  }
}

async function edit(formData) {
  try {
    const { status, data } = await axios.put("/api/user", formData, {
      headers: { "content-type": "multipart/form-data" },
    });
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

async function initRecovery(email) {
  try {
    const { status } = await axios.post("/api/user/passReset", { email });
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

async function confirmRecovery(token, pass) {
  try {
    const { status, data } = await axios.put("/api/user/passReset", {
      token,
      pass,
    });
    return { status, data };
  } catch (error) {
    let status, message;
    if (error.response) {
      status = error.response.status;
      message = error.response.data?.message || error.response.statusText;
    } else if (error.request) {
      status = 503;
      message = "Server unavailable";
    } else {
      status = 500;
      message = "Unknown error";
    }
    return { status, message };
  }
}

export { create, edit, initRecovery, confirmRecovery };
