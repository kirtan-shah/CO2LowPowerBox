function unpack(rows, key) {
    return rows.map(row => row[key]);
}
function fetchAndPlot(before = moment().subtract(1, 'd'), after = moment()) {
    $.get(`/loadData?startTime=${before.toISOString()}&endTime=${after.toISOString()}`, function(data) {
        let rows = data.values;
        let dates = rows.map(row => moment(row.ts).subtract(new Date().getTimezoneOffset(), 'm').toISOString());
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
            yaxis3: { title: 'Humidity (%)', side: 'right', overlaying: 'y', anchor: 'free', position: 0.9, titlefont: {color: '#007f00'}, tickfont: {color: '#007f00'}},
            paper_bgcolor: 'rgba(255, 255, 255, 0)',
            plot_bgcolor: 'rgba(255, 255, 255, 0)'
        };
        Plotly.newPlot('chart', traces, layout);
    });
}

$(document).ready(() => {
    fetchAndPlot();
    $('#startWindow').val(moment().subtract(1, 'd').format("YYYY-MM-DD[T]HH:mm"));
    $('#endWindow').val(moment().format("YYYY-MM-DD[T]HH:mm"));
    $('#startWindow, #endWindow').on('change', () => {
        let before = moment($('#startWindow').val());
        let after = moment($('#endWindow').val());
        fetchAndPlot(before, after);
    });
})