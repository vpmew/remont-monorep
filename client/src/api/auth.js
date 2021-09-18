import axios from "utils/axios";

async function login(email, password) {
  try {
    const { data, status } = await axios.post("/api/auth/login", {
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

async function viaSocialNetwork(hash) {
  try {
    let { data, status } = await axios.post("/api/auth/viaSocialNetwork", {
      hash,
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

async function logout(userId) {
  try {
    const { status } = await axios.post("/api/auth/logout", { userId });
    return status;
  } catch (error) {
    let status;
    if (error.response) {
      status = error.response.status;
    } else if (error.request) {
      status = 503;
    } else {
      status = null;
    }
    return status;
  }
}

export { login, viaSocialNetwork, logout };
