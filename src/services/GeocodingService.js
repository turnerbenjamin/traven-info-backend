import axios from "axios";

import HTTPError from "../utils/HTTPError.js";

export default class GeocodingService {
  getLocations = async (searchTerm) => {
    try {
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${searchTerm},,GB&appid=${process.env.OPEN_WEATHER_API_KEY}`;
      await axios.get(url);
    } catch (err) {
      throw new HTTPError(500, "Server error");
    }
  };
}
