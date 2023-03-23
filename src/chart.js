import Chart from 'chart.js/auto';
import 'chartjs-adapter-moment';
import _ from 'lodash';


const defaultTypes = "temp,wind,pressure,precip,solar";

let pos = defaultTypes;
if (window.location.hash.startsWith("#")) {
    pos = window.location.hash.substring(1);
}

let tempEl = null;
let windEl = null;
let pressureEl = null;
let precipEl = null;
let solarEl = null;

const posArray = pos.split(",");
posArray.forEach((type, index) => {
    console.log(type + " " + index);
    switch (type) {
    case "temp":     tempEl     = document.getElementById("pos" + index); break;
    case "wind":     windEl     = document.getElementById("pos" + index); break;
    case "pressure": pressureEl = document.getElementById("pos" + index); break;
    case "precip":   precipEl   = document.getElementById("pos" + index); break;
    case "solar":    solarEl    = document.getElementById("pos" + index); break;
    }
});

let next = posArray.length;

defaultTypes.split(",").forEach((type, index) => {
    switch (type) {
    case "temp":     if (!tempEl)     { tempEl     = document.getElementById("pos" + next++); } break;
    case "wind":     if (!windEl)     { windEl     = document.getElementById("pos" + next++); } break;
    case "pressure": if (!pressureEl) { pressureEl = document.getElementById("pos" + next++); } break;
    case "precip":   if (!precipEl)   { precipEl   = document.getElementById("pos" + next++); } break;
    case "solar":    if (!solarEl)    { solarEl    = document.getElementById("pos" + next++); } break;
    }
});

for (var i = posArray.length; i < defaultTypes.split(",").length; i++) {
    document.getElementById("pos" + i).style.display = 'none';
}


const DEFAULT_OPTIONS = {
    plugins: {
	title: {
	    text: "???",
	    display: true
	}
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
	y: {
	    beginAtZero: true,
	    grid: {
		display: true,
		color: "rgba(255,255,255,0.1)"
	    },
	    afterFit(scale) {
		scale.width = 50;
	    },
	},
	xAxis: {
	    type: "time"
	}
    },
    interaction: {
        intersect: false,
        mode: 'index',
    }
};


const tempChart = new Chart(
    tempEl,
    {
	type: 'line',
	data: {
	    datasets: [
		{
                    label: "Average",
		    borderWidth: 1.5,
		    pointStyle: false,
                    borderColor: 'rgba(55, 173, 221, 1.0)',
                    backgroundColor: 'rgba(55, 173, 221,  0.6)',
		    cubicInterpolationMode: 'monotone',
                    data: []
                },
		{
                    label: "Windchill",
		    borderWidth: 1.5,
		    pointStyle: false,
                    borderColor: 'rgba(221, 173, 23,  0.6)',
		    backgroundColor: 'rgba(221, 173, 23,  0.6)',
		    cubicInterpolationMode: 'monotone',
                    data: []
                },
	    ]
	},
	options: _.set(_.cloneDeep(DEFAULT_OPTIONS), "plugins.title.text", "Temperature")
    }
);

const windChart = new Chart(
    windEl,
    {
	type: 'line',
	data: {
	    datasets: [
		{
                    label: "Average",
		    borderWidth: 1.5,
		    pointStyle: false,
                    backgroundColor: 'rgba(55, 173, 221,  0.6)',
                    borderColor: 'rgba(55, 173, 221, 1.0)',
		    cubicInterpolationMode: 'monotone',
                    data: []
                },
		{
                    label: "Gust",
		    borderWidth: 1.5,
		    pointRadius: 1,
		    pointStyle: false,
		    showLine: false,
		    pointStyle: 'rect',
                    borderColor: 'rgba(221, 173, 23,  0.6)',
		    backgroundColor: 'rgba(221, 173, 23,  0.6)',
                    data: []
                },
	    ]
	},
	options: _.set(_.cloneDeep(DEFAULT_OPTIONS), "plugins.title.text", "Windspeed")
    }
);

const pressureChart = new Chart(
    pressureEl,
    {
	type: 'line',
	data: {
	    datasets: [
		{
                    label: "Pressure",
		    borderWidth: 1.5,
		    pointStyle: false,
		    showLine: true,
                    backgroundColor: 'rgba(55, 173, 221,  0.6)',
                    borderColor: 'rgba(55, 173, 221, 1.0)',
                    data: []
                },
	    ]
	},
	options: _.set(_.set(_.cloneDeep(DEFAULT_OPTIONS), "plugins.title.text", "Pressure"), "scales.y.beginAtZero", false)
    }
);

const precipChart = new Chart(
    precipEl,
    {
	type: 'line',
	data: {
	    datasets: [
		{
                    label: "Total",
		    borderWidth: 1.5,
		    pointStyle: false,
                    backgroundColor: 'rgba(55, 173, 221,  0.6)',
                    borderColor: 'rgba(55, 173, 221, 1.0)',
		    cubicInterpolationMode: 'monotone',
                    data: []
                },
		{
		    type: 'bar',
                    label: "Rate",
                    borderColor: 'rgba(221, 173, 23,  0.6)',
		    backgroundColor: 'rgba(221, 173, 23,  0.6)',
                    data: []
                },
	    ]
	},
	options: _.set(_.cloneDeep(DEFAULT_OPTIONS) ,"plugins.title.text", "Precipitation")
    }
);


const solarChart = new Chart(
    solarEl,
    {
	type: 'line',
	data: {
	    datasets: [
		{
		    borderWidth: 1.5,
                    label: "watts/m²",
		    pointStyle: false,
                    backgroundColor: 'rgba(55, 173, 221,  0.6)',
                    borderColor: 'rgba(55, 173, 221, 1.0)',
                    cubicInterpolationMode: 'monotone',
		    data: []
                },
	    ]
	},
	options: _.set(_.cloneDeep(DEFAULT_OPTIONS), "plugins.title.text", "Solar Radiation")
    }
);

const allCharts = [tempChart, windChart, pressureChart, precipChart, solarChart];

async function updateChart() {

    const data = await fetchData("https://api.weather.com/v2/pws/observations/all/1day" + window.location.search);
    const observations = data.observations;
    console.log(observations);

    // remove all old observations that overlap
    const firstNewObservationTime = new Date(observations.at(0).obsTimeUtc).getTime();
    allCharts.forEach(chart => {
	chart.data.datasets.forEach(dataset => {
	    dataset.data = dataset.data.filter(obs => obs.x.getTime() < firstNewObservationTime);
	});
    });
    
    // adds new observations
    observations.map(obs => {
	const time = new Date(obs.obsTimeUtc)
	tempChart.data.datasets[0].data.push({ x: time, y: obs.metric.tempAvg });
	tempChart.data.datasets[1].data.push({ x: time, y: obs.metric.windchillAvg });

	windChart.data.datasets[0].data.push({ x: time, y: obs.metric.windspeedAvg });
	windChart.data.datasets[1].data.push({ x: time, y: obs.metric.windgustAvg });

	pressureChart.data.datasets[0].data.push({ x: time, y: obs.metric.pressureMin + (obs.metric.pressureMax - obs.metric.pressureMin) / 2 });

        precipChart.data.datasets[0].data.push({ x: time, y: obs.metric.precipTotal });
	precipChart.data.datasets[1].data.push({ x: time, y: obs.metric.precipRate });

	solarChart.data.datasets[0].data.push({ x: time, y: obs.solarRadiationHigh });
    });

    const lastObservation = observations.at(-1);
    
    // remove old observations that isn't interesting anymore
    const lastObservationTime = new Date(lastObservation.obsTimeUtc).getTime();
    allCharts.forEach(chart => {
	chart.data.datasets.forEach(dataset => {
	    dataset.data = dataset.data.filter(obs => lastObservationTime - obs.x.getTime() <= 24 * 60 * 60 * 1000);
	});
    });

    allCharts.forEach(chart => chart.update());
}

async function fetchData(url) {
    return await fetch(url, {cache: "no-store"})
	  .then(response => {
              if (!response.ok) {
		  throw new Error(`HTTP error ${response.status}`);
              }
              return response.json();
	  });
}

updateChart();
setInterval(updateChart, 5 * 60 * 1000);



    
