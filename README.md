# Weather Dashboard

A simple weather dashboard for weatherunderground/api.weather.com for PWS (currenly only handling metric, e.g. `units=m` in the URL).

![Screenshot](screenshot.png)

## Install:

    git clone https://github.com/dacwe/weather-dashboard.git
    cd weather-dashboard
    npm install

## Update:

    cd weather-dashboard
    git pull

## Start server:

    npm run start

The server can also be built using `npm run build` and deployed statically.


## Example of browser url: 

    http://localhost:7775/?apiKey=<your-api-key>&stationId=<your-station-id>&numericPrecision=decimal&format=json&units=m


