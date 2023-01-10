import Chart from 'chart.js/auto'
import 'chartjs-adapter-moment';

async function fetchData(url, date) {
    return await fetch(url + "&date=" + new Date(date - date.getTimezoneOffset()*60000).toISOString().slice(0, 10).replaceAll("-", ""))
	  .then(response => {
              if (!response.ok) {
		  throw new Error(`HTTP error ${response.status}`);
              }

              return response.json();
	  });
}

(async function() {
    const today = new Date();
    var yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    let observations = [];
    const url = "https://api.weather.com/v2/pws/history/all" + window.location.search;
    observations.push(...(await fetchData(url, yesterday)).observations);
    observations.push(...(await fetchData(url, today)).observations);
    observations = observations.filter(obs => {
	return today - new Date(obs.obsTimeLocal) < 24 * 60 * 60 * 1000;
    })
    
    const last = observations.at(-1);
    console.log(observations)
    new Chart(
	document.getElementById('temp'),
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
                        data: observations.map(obs => {
			    return { x: obs.obsTimeLocal, y: obs.metric.tempLow };
			})
                    },
		    {
                        label: "High",
			showLine: false,
			pointStyle: false,
			cubicInterpolationMode: 'monotone',
                        backgroundColor: 'rgba(255,255,255, 0.1)',
			fill: '-1',
                        data: observations.map(obs => {
			    return { x: obs.obsTimeLocal, y: obs.metric.tempHigh };
			})
                    },
		    {
                        label: "Average",
			pointStyle: false,
                        borderColor: 'rgba(55, 173, 221, 1.0)',
			cubicInterpolationMode: 'monotone',
                        data: observations.map(obs => {
			    return { x: obs.obsTimeLocal, y: obs.metric.tempAvg };
			})
                    },
		    {
                        label: "Dew Point",
			pointStyle: false,
                        borderColor: 'rgba(221, 173, 23, 0.5)',
			cubicInterpolationMode: 'monotone',
                        data: observations.map(obs => {
			    return { x: obs.obsTimeLocal, y: obs.metric.dewptAvg };
			})
                    },
		    
		]
	    },
	    options: {
		plugins: {
		    title: {
			text: "Temperature: " + last.metric.tempAvg + "°C",
			display: true
		    }
		},
		responsive: true,
		maintainAspectRatio: false,
		scales: {
		    y: {
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
    
    new Chart(
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
                        data: observations.map(obs => {
			    return { x: obs.obsTimeLocal, y: obs.metric.windspeedLow };
			})
                    },
		    {
                        label: "High",
			showLine: false,
			pointStyle: false,
			cubicInterpolationMode: 'monotone',
                        backgroundColor: 'rgba(255,255,255, 0.1)',
			fill: '-1',
                        data: observations.map(obs => {
			    return { x: obs.obsTimeLocal, y: obs.metric.windspeedHigh };
			})
                    },
		    {
                        label: "Average",
			pointStyle: false,
                        backgroundColor: 'rgba(55, 173, 221,  0.6)',
                        borderColor: 'rgba(55, 173, 221, 1.0)',
			cubicInterpolationMode: 'monotone',
                        data: observations.map(obs => {
			    return { x: obs.obsTimeLocal, y: obs.metric.windspeedAvg };
			})
                    },
		    {
                        label: "Gust",
			pointStyle: false,
			showLine: false,
			pointStyle: 'rect',
                        borderColor: 'rgba(221, 173, 23,  0.6)',
			backgroundColor: 'rgba(221, 173, 23,  0.6)',
                        data: observations.map(obs => {
			    return { x: obs.obsTimeLocal, y: obs.metric.windgustAvg };
			})
                    },
		    		    
		]
	    },
	    options: {
		plugins: {
		    title: {
			text: "Wind speed: " + last.metric.windspeedAvg + " m/s",
			display: true
		    }
		},
		responsive: true,
		maintainAspectRatio: false,
		scales: {
		    y: {
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
    
    new Chart(
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
                        data: observations.map(obs => {
			    return { x: obs.obsTimeLocal, y: obs.metric.precipTotal };
			})
                    },
		    {
			type: 'bar',
                        label: "Precip rate",
                        borderColor: 'rgba(221, 173, 23,  0.6)',
			backgroundColor: 'rgba(221, 173, 23,  0.6)',
                        data: observations.map(obs => {
			    return { x: obs.obsTimeLocal, y: obs.metric.precipRate };
			})
                    },
		    		    
		]
	    },
	    options: {
		plugins: {
		    title: {
			text: "Precip total: " + last.metric.precipTotal + " mm",
			display: true
		    }
		},
		responsive: true,
		maintainAspectRatio: false,
		scales: {
		    y: {
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

    
    new Chart(
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
			data: observations.map(obs => {
			    return { x: obs.obsTimeLocal, y: obs.solarRadiationHigh };
			})
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


})();
 
