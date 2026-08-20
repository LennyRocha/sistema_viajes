import {
  isUsableGoogleMapsApiKey,
  searchPlacePredictions as searchPredictions,
} from "../viajes/components/GoogleRouteMap";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const searchPlacePredictions = async (
  input: string,
) => {
  if (!isUsableGoogleMapsApiKey(apiKey)) {
    return [];
  }
  return searchPredictions(input, apiKey);
};
