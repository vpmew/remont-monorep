import axios from "axios";
import { SERVER } from "config";
// import { refresh } from "api/auth";
// import { setInfo } from "reduxInstance/actions";
// import store from "reduxInstance/store";

const axiosInstance = axios.create({
  baseURL: SERVER,
  withCredentials: true,
});

// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async function (error) {
//     // console.log(error.config, error.request, error.response);
//     const originalRequest = error.config;
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       const { status } = await refresh();
//       if (status === 201) {
//         return axiosInstance(originalRequest);
//       } else {
//         store.dispatch(
//           setInfo({
//             type: "error",
//             text: "Не удалось обновить токен доступа. Залогиньтесь заново.",
//           })
//         );
//         return Promise.reject(
//           new Error(`Refreshing failed with status ${status}`)
//         );
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
