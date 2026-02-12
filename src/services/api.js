import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const msg = error.response.data.error;
      const logoutErrors = [
        "session expired",
        "login required",
        "invalid access token",
        "invalid refresh token user mismatch",
      ];

      if (logoutErrors.includes(msg)) {
        console.warn("Authentication lost:", msg);
        localStorage.removeItem("galaxy_user");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
