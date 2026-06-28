import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query";
import env from "../../../config/env";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: env.api_url,
  }),
  endpoints: () => ({}),
});
