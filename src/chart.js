import Chart from 'chart.js/auto'
import 'chartjs-adapter-moment';

const tempChart = new Chart(
    document.getElementById('temp'),
    {
	type: 'line',
	data: {
	    datasets: [
		{
                    label: "Average",
		    pointStyle: false,
                    borderColor: 'rgba(55, 173, 221, 1.0)',
		    cubicInterpolationMode: 'monotone',
                    data: []
                },
		{
                    label: "Windchill",
		    pointStyle: false,
                    borderColor: 'rgba(221, 173, 23, 0.5)',
		    cubicInterpolationMode: 'monotone',
                    data: []
                },
	    ]
	},
	options: {
	    plugins: {
		title: {
		    text: "Temperature",
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
		    }
		},
		xAxis: {
		    type: "time"
		}
	    }
	}
    }
);
    
const windChart = new Chart(
    document.getElementById('wind'),
    {
	type: 'line',
	data: {
	    datasets: [
		{
                    label: "Low",
		    showLabel: false,
		    showLine: false,
		    pointStyle: false,
		    cubicInterpolationMode: 'monotone',
		    backgroundColor: 'rgba(255,255,255, 0.1)',
		    fill: false,
                    data: []
                },
		{
                    label: "High",
		    showLine: false,
		    pointStyle: false,
		    cubicInterpolationMode: 'monotone',
                    backgroundColor: 'rgba(255,255,255, 0.1)',
		    fill: '-1',
                    data: []
                },
		{
                    label: "Average",
		    pointStyle: false,
                    backgroundColor: 'rgba(55, 173, 221,  0.6)',
                    borderColor: 'rgba(55, 173, 221, 1.0)',
		    cubicInterpolationMode: 'monotone',
                    data: []
                },
		{
                    label: "Gust",
		    pointStyle: false,
		    showLine: false,
		    pointStyle: 'rect',
                    borderColor: 'rgba(221, 173, 23,  0.6)',
		    backgroundColor: 'rgba(221, 173, 23,  0.6)',
                    data: []
                },
	    ]
	},
	options: {
	    plugins: {
		title: {
		    text: "Wind speed",
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
		    }
		},
		xAxis: {
		    type: "time"
		}
	    }
	}
    }
);
    
const precipChart = new Chart(
    document.getElementById('precip'),
    {
	type: 'line',
	data: {
	    datasets: [
		{
                    label: "Precip total",
		    pointStyle: false,
                    backgroundColor: 'rgba(55, 173, 221,  0.6)',
                    borderColor: 'rgba(55, 173, 221, 1.0)',
		    cubicInterpolationMode: 'monotone',
                    data: []
                },
		{
		    type: 'bar',
                    label: "Precip rate",
                    borderColor: 'rgba(221, 173, 23,  0.6)',
		    backgroundColor: 'rgba(221, 173, 23,  0.6)',
                    data: []
                },
	    ]
	},
	options: {
	    plugins: {
		title: {
		    text: "Precip",
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
		    }
		},
		xAxis: {
		    type: "time"
		}
	    }
	}
    }
);


const solarChart = new Chart(
    document.getElementById('solar'),
    {
	type: 'line',
	data: {
	    datasets: [
		{
                    label: "watts/m²",
		    pointStyle: false,
                    backgroundColor: 'rgba(55, 173, 221,  0.6)',
                    borderColor: 'rgba(55, 173, 221, 1.0)',
                    cubicInterpolationMode: 'monotone',
		    data: []
                },
	    ]
	},
	options: {
	    plugins: {
		title: {
		    text: "Solar Radiation",
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
		    }
		},
		xAxis: {
		    type: "time"
		}
	    }
	}
    }
);

const allCharts = [tempChart, windChart, precipChart, solarChart];
				
function updateChart(observations) {
    
    console.log(observations);

    // adds new observations
    observations.map(obs => {
	const time = new Date(obs.obsTimeUtc)
	tempChart.data.datasets[0].data.push({ x: time, y: obs.metric.tempAvg });
	tempChart.data.datasets[1].data.push({ x: time, y: obs.metric.windchillAvg });

    	windChart.data.datasets[0].data.push({ x: time, y: obs.metric.windspeedLow });
	windChart.data.datasets[1].data.push({ x: time, y: obs.metric.windspeedHigh });
	windChart.data.datasets[2].data.push({ x: time, y: obs.metric.windspeedAvg });
	windChart.data.datasets[3].data.push({ x: time, y: obs.metric.windgustAvg });

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

    // calculate next update
    const timeSinceLastUpdate = new Date().getTime() - lastObservationTime
    const maxTimeBetweenUpdates = 5 * 60 * 1000;
    const minTimeBetweenUpdates = 1 * 60 * 1000;
    const nextUpdate = Math.max(minTimeBetweenUpdates, Math.min(maxTimeBetweenUpdates, maxTimeBetweenUpdates - timeSinceLastUpdate));
    console.log("Next Update: " + nextUpdate);
    setTimeout(updateCurrent, nextUpdate);
}


async function fetchData(url) {
    return await fetch(url)
	  .then(response => {
              if (!response.ok) {
		  throw new Error(`HTTP error ${response.status}`);
              }

              return response.json();
	  });
}

(async function() {
    const initialData = await fetchData("https://api.weather.com/v2/pws/observations/all/1day" + window.location.search);
    updateChart(initialData.observations);

})();

async function updateCurrent() {
    const data = await fetchData("https://api.weather.com/v2/pws/observations/current" + window.location.search);
    updateChart(data.observations);
}

