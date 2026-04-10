export interface WeatherData {
  tempCelsius: number;
  feelsLike: number;
  humidity: number;
  weatherCondition: string;
  weatherDescription: string;
  windSpeed: number;
  weatherIcon: string;
}

export function weatherDataFromOpenWeatherJson(json: any): WeatherData {
  const main = json.main;
  const weather = json.weather[0];
  const wind = json.wind;

  return {
    tempCelsius: Number(main.temp),
    feelsLike: Number(main.feels_like),
    humidity: main.humidity as number,
    weatherCondition: weather.main as string,
    weatherDescription: weather.description as string,
    windSpeed: Number(wind.speed),
    weatherIcon: weather.icon as string,
  };
}
