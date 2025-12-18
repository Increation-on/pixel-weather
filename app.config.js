// app.config.js
export default {
  expo: {
    name: "Pixel-weather",
    slug: "Pixel-weather",
    extra: {
      weatherApiKey: process.env.WEATHERAPI_KEY,
    },
  },
};