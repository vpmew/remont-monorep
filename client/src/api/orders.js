import axios from "utils/axios";
import { convertOrderStatus } from "utils/converters";

export async function getOrdersByUser(userId) {
  try {
    return await axios.get(`/api/orders/${userId}`);
  } catch (error) {
    if (error.response) {
      return error.response;
    } else if (error.request) {
      return { status: 503 };
    } else {
      return { status: null };
    }
  }
}

export async function getOrders() {
  try {
    return await axios.get(`/api/orders/`);
  } catch (error) {
    if (error.response) {
      return error.response;
    } else if (error.request) {
      return { status: 503 };
    } else {
      return { status: null };
    }
  }
}

export async function createOrder(order) {
  try {
    const dbValidFormat = {
      ...order,
      orderStatus: order.orderStatus
        ? convertOrderStatus(order.orderStatus, true)
        : null,
    };
    return await axios.post("/api/orders/", {
      order: dbValidFormat,
    });
  } catch (error) {
    if (error.response) {
      return error.response;
    } else if (error.request) {
      return { status: 503 };
    } else {
      return { status: null };
    }
  }
}

export async function updateOrder(order) {
  try {
    const dbValidFormat = {
      id: order.id,
      orderText: order.orderText,
      userId: order.userId,
      orderStatus: convertOrderStatus(order.orderStatus, true),
      price: order.price || null,
    };
    return await axios.patch("/api/orders/", {
      order: dbValidFormat,
    });
  } catch (error) {
    if (error.response) {
      return error.response;
    } else if (error.request) {
      return { status: 503 };
    } else {
      return { status: null };
    }
  }
}

export async function deleteOrder(orderId) {
  try {
    return await axios.delete("/api/orders/", { data: { orderId } });
  } catch (error) {
    if (error.response) {
      return error.response;
    } else if (error.request) {
      return { status: 503 };
    } else {
      return { status: null };
    }
  }
}
