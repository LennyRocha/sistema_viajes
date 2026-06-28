import { api } from "../services/api";

export const autobusesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAutobuses: builder.query({
      query: () => "/autobuses",
    }),

    /*
    getAutobusById: builder.query({
      query: (id) => `/autobuses/${id}`,
    }),

    createAutobus: builder.mutation({
      query: (body) => ({
        url: "/autobuses",
        method: "POST",
        body,
      }),
    }),
    */
  }),
});
