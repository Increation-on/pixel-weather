// app/index.tsx
import { HomeScreen } from "@/src/screens/home/HomeScreen";
import ForecastScreen from '../src/screens/forecast/ForecastScreen';
import { WeatherSlider } from '@/src/components/navigation/WeatherSlider';

export default function Home() {
  return (
    <>
      <WeatherSlider>
        <HomeScreen />
        <ForecastScreen />
      </WeatherSlider>
    </>
  );
}