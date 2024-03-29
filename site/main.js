let visibleState = [];
const socket = io();
socket.on('connect', () => {
    socket.on('refresh', () => {
        console.log('Server refresh');
        refresh();
    });
    console.log('socket.io connected!');
});

function unpack(rows, key) {
    return rows.map(row => row[key]);
}

function movingAvg(arr, radius) {
    let result = [];
    for(let i = 0; i < arr.length; i++) {
        let sum = 0;
        let N = 0;
        for(let j = i - radius; j <= i + radius; j++) {
            if(j >= 0 && j < arr.length) {
                sum += arr[j];
                N++;
            }
        }
        result.push(sum / N);
    }
    return result;
}

function adjustedPPM(m) {
    const tau = 72;
    const timestep = 15;
    let dmdt = [];
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
        dmdt.push(rise / deltaT);
    }
    dmdt = movingAvg(dmdt, 3);
    let adj = dmdt.map((d, i) => tau*d + m[i]);
    return adj;
}

function fetchAndPlot(before = moment().subtract(1, 'd'), after = moment().add(1, 'd')) {
    $.get(`/loadData?startTime=${before.toISOString()}&endTime=${after.toISOString()}`, function(data) {
        let rows = data.values;
        let dates = rows.map(row => moment(row.ts).subtract(new Date().getTimezoneOffset(), 'm').toISOString());
        let mostRecentUpdate = moment(dates[dates.length - 1]).add(new Date().getTimezoneOffset(), 'm');
        let m = unpack(rows, 'co2_ppm');
        $('#last-modified-time').text(mostRecentUpdate.format('LT') + ` (${m[m.length - 1]} ppm)`);
        let adj = adjustedPPM(m);
        let trace0 = {
            type: 'scatter',
            name: 'Adjusted CO2 (ppm)',
            x: dates,
            y: adj,
            yaxis: 'y4',
            line: {color: '#9534eb'},
            visible: false
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
            yaxis4: { title: 'Adjusted CO2 (ppm)', titlefont: {color: '#9534eb'}, tickfont: {color: '#9534eb'}, side: 'left', overlaying: 'y', anchor: 'free', position: 0, matches: 'y'},
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
    let loop = setInterval(() => {
        let el = $('.infolayer .legend');
        let pos = el.offset();
        if(pos.left > 0 && pos.top > 0) clearInterval(loop);
        pos.top += el.find('rect').height() + 20;
        $('#picture').offset(pos);
    }, 500);
})


$(document.body).click(() => {
    
})