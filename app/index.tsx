// app/index.tsx
import { HomeScreen } from "@/src/screens/home/HomeScreen";
import ForecastScreen from '../src/screens/forecast/ForecastScreen';
import { WeatherSlider } from '@/src/components/navigation/WeatherSlider';
import { useWeatherOnAppResume } from '@/src/hooks/useWeatherOnAppResume';

export default function Home() {
  useWeatherOnAppResume()
  return (
    <>
      <WeatherSlider>
        <HomeScreen />
        <ForecastScreen />
      </WeatherSlider>
    </>
  );
}