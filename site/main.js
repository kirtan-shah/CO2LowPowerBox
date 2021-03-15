function unpack(rows, key) {
    return rows.map(row => row[key]);
}

$(document).ready(() => {
    let before = new Date(new Date().setFullYear(2020));
    let after = new Date(new Date().setFullYear(2022));
    $.get(`/loadData?startTime=${before.toISOString()}&endTime=${after.toISOString()}`, function(data) {
        let rows = data.values;
        let dates = unpack(rows, 'ts');
        let trace1 = {
            type: 'scatter',
            name: 'CO2 (ppm)',
            x: dates,
            y: unpack(rows, 'co2_ppm')
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
        let traces = [trace1, trace2, trace3];
        var layout = {
            title: 'CO2 Low Power Box',
            xaxis: { domain: [0, 0.8] },
            yaxis: { title: 'CO2 (ppm)', titlefont: {color: '#1f77b4'}, tickfont: {color: '#1f77b4'} },
            yaxis2: { title: 'Temperature (°C)', side: 'right', overlaying: 'y', titlefont: {color: '#ff7f0e'}, tickfont: {color: '#ff7f0e'} },
            yaxis3: { title: 'Humidity (%)', side: 'right', overlaying: 'y', anchor: 'free', position: 0.9, titlefont: {color: '#007f00'}, tickfont: {color: '#007f00'}}
        };
        Plotly.newPlot('chart', traces, layout);
    });
})