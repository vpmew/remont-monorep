export const SET_USER = "SET_USER";
export const LOGOUT = "LOGOUT";

export const SET_LOADING = "SET_LOADING";
export const SET_INFO = "SET_INFO";

export const SET_MY_ORDERS = "SET_MY_ORDERS";

export function setUser(userData) {
  return {
    type: SET_USER,
    userData,
  };
}
export function logout() {
  return {
    type: LOGOUT,
  };
}
export function setLoading(state) {
  return {
    type: SET_LOADING,
    state,
  };
}
export function setInfo(info) {
  return {
    type: SET_INFO,
    info,
  };
}
export function setMyOrders(orders) {
  return {
    type: SET_MY_ORDERS,
    orders,
  };
}
