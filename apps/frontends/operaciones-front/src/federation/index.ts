import { searchPlacePredictions as searchPredictions } from "../viajes/components/GoogleRouteMap";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const searchPlacePredictions = async (
  input: string,
) => {
  if (!apiKey) {
    throw new Error("Google Maps API key is not defined");
  }
  return searchPredictions(input, apiKey);
};
