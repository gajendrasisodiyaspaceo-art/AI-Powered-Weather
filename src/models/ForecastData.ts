export interface ForecastEntry {
  dateTime: Date;
  tempCelsius: number;
  tempMin: number;
  tempMax: number;
  weatherCondition: string;
  weatherIcon: string;
  weatherDescription: string;
}

export interface ForecastData {
  entries: ForecastEntry[];
}

export function forecastDataFromOpenWeatherJson(json: any): ForecastData {
  const list = json.list as any[];
  const entries: ForecastEntry[] = list.map((item) => {
    const main = item.main;
    const weather = item.weather[0];
    return {
      dateTime: new Date((item.dt as number) * 1000),
      tempCelsius: Number(main.temp),
      tempMin: Number(main.temp_min),
      tempMax: Number(main.temp_max),
      weatherCondition: weather.main as string,
      weatherIcon: weather.icon as string,
      weatherDescription: weather.description as string,
    };
  });

  return { entries };
}

export function dailySummaries(forecast: ForecastData): ForecastEntry[] {
  const grouped: Record<string, ForecastEntry[]> = {};
  for (const entry of forecast.entries) {
    const d = entry.dateTime;
    const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(entry);
  }

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const summaries: ForecastEntry[] = [];
  for (const key of Object.keys(grouped)) {
    if (key === todayKey) continue;
    const dayEntries = grouped[key];

    // Find entry closest to midday (12:00)
    let midday = dayEntries[0];
    let minDiff = Math.abs(midday.dateTime.getHours() - 12);
    for (const e of dayEntries) {
      const diff = Math.abs(e.dateTime.getHours() - 12);
      if (diff < minDiff) {
        minDiff = diff;
        midday = e;
      }
    }

    // Compute min/max across all entries for the day
    let dayMin = dayEntries[0].tempMin;
    let dayMax = dayEntries[0].tempMax;
    for (const e of dayEntries) {
      if (e.tempMin < dayMin) dayMin = e.tempMin;
      if (e.tempMax > dayMax) dayMax = e.tempMax;
    }

    summaries.push({
      dateTime: midday.dateTime,
      tempCelsius: midday.tempCelsius,
      tempMin: dayMin,
      tempMax: dayMax,
      weatherCondition: midday.weatherCondition,
      weatherIcon: midday.weatherIcon,
      weatherDescription: midday.weatherDescription,
    });

    if (summaries.length >= 5) break;
  }

  return summaries;
}
