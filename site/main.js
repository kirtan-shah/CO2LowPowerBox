let visibleState = []

function unpack(rows, key) {
    return rows.map(row => row[key]);
}

function adjustedPPM(m) {
    const tau = 72;
    const timestep = 15;
    let adj = [];
    for(let i = 0; i < m.length; i++) {
        let deltaT = 0, rise = 0;
        if(i > 0) {
            deltaT += timestep;
            rise += m[i] - m[i - 1];
        }
        if(i < m.length - 1) {
            deltaT += timestep;
            rise += m[i + 1] - m[i];
        }
        let dmdt = rise / deltaT;
        adj.push(tau*dmdt + m[i]);
    }
    return adj;
}

function fetchAndPlot(before = moment().subtract(1, 'd'), after = moment().add(1, 'd')) {
    $.get(`/loadData?startTime=${before.toISOString()}&endTime=${after.toISOString()}`, function(data) {
        let rows = data.values;
        let dates = rows.map(row => moment(row.ts).subtract(new Date().getTimezoneOffset(), 'm').toISOString());
        let m = unpack(rows, 'co2_ppm');
        let adj = adjustedPPM(m);
        let trace0 = {
            type: 'scatter',
            name: 'Adjusted CO2 (ppm)',
            x: dates,
            y: adj,
            yaxis: 'y4',
            line: {color: '#9534eb'}
        };
        let trace1 = {
            type: 'scatter',
            name: 'CO2 (ppm)',
            x: dates,
            y: m
        };
        let trace2 = {
            type: 'scatter',
            name: 'Temperature (°C)',
            x: dates,
            y: unpack(rows, 'temperature_c'),
            yaxis: 'y2'
        };
        let trace3 = {
            type: 'scatter',
            name: 'Relative Humidity (%)',
            x: dates,
            y: unpack(rows, 'humidity_percent'),
            yaxis: 'y3'
        };
        let traces = [trace1, trace2, trace3, trace0];
        var layout = {
            title: 'CO2 Low Power Box',
            xaxis: { domain: [0.1, 0.84] },
            yaxis4: { title: 'Adjusted CO2 (ppm)', titlefont: {color: '#9534eb'}, tickfont: {color: '#9534eb'}, side: 'left', overlaying: 'y', anchor: 'free', position: 0},
            yaxis: { title: 'CO2 (ppm)', titlefont: {color: '#1f77b4'}, tickfont: {color: '#1f77b4'}, position: 0.07 },
            yaxis2: { title: 'Temperature (°C)', side: 'right', overlaying: 'y', titlefont: {color: '#ff7f0e'}, tickfont: {color: '#ff7f0e'} },
            yaxis3: { title: 'Humidity (%)', side: 'right', overlaying: 'y', anchor: 'free', position: 0.9, titlefont: {color: '#007f00'}, tickfont: {color: '#007f00'}},
            paper_bgcolor: 'rgba(255, 255, 255, 0)',
            plot_bgcolor: 'rgba(255, 255, 255, 0)'
        };
        Plotly.newPlot('chart', traces, layout);
    });
}

function refresh() {
    let before = moment($('#startWindow').val());
    let after = moment($('#endWindow').val());
    fetchAndPlot(before, after);
}

$(document).ready(() => {
    fetchAndPlot();
    $('#startWindow').val(moment().subtract(1, 'd').format("YYYY-MM-DD[T]HH:mm"));
    $('#endWindow').val(moment().add(1, 'd').format("YYYY-MM-DD[T]HH:mm"));
    $('#startWindow, #endWindow').on('change', refresh);
})

$(document.body).click(() => {
    
})