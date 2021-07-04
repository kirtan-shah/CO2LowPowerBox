const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const moment = require('moment');
const pool = require('./db');
const path = require('path');
const PORT = process.env.PORT || 3636;

const io = require('socket.io')(http);
io.on('connection', (socket) => {
    console.log('Client connected.');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "site")))

app.post('/update', async (req, res) => {
    let co2 = convert16(new Int8Array(Buffer.from(req.body.co2, 'base64')));
    let temperature = convertFloat(new Int8Array(Buffer.from(req.body.temperature, 'base64')));
    let humidity = convertFloat(new Int8Array(Buffer.from(req.body.humidity, 'base64')));
    let timestamp = moment();
    let timestampBegin = moment(req.body.timestamp);
    let deltaMs = timestamp.diff(timestampBegin) / (co2.length - 1);
    let query = "INSERT INTO sensor_data VALUES ";
    for(let i = co2.length - 1; i >= 0; i--) {
        query += `('${timestamp.toISOString()}', ${co2[i]}, ${temperature[i]}, ${humidity[i]}),`;
        timestamp.subtract(deltaMs, 'ms');
    }
    query = query.slice(0, -1) + ";";
    const returnValue = await pool.query(query); // psql console output
    // console.log(returnValue); 
    res.sendStatus(200);
    console.log("emit refresh event");
    io.emit("refresh");
});
app.get('/loadData', async (req, res) => {
    try {
        const { startTime, endTime } = req.query;
        const data = await pool.query("SELECT * FROM sensor_data WHERE ts BETWEEN $1 AND $2 ORDER BY ts;", [startTime, endTime]);
        res.json({ values: data.rows });
    } catch(err) {
        console.error(err.message);
    }
})

function convert16(bytes) {
    let view = new DataView(new ArrayBuffer(bytes.length));
    bytes.forEach((b, i) => view.setUint8(i, b));
    let arr = new Array(bytes.length / 2);
    for(let i = 0; i < bytes.length; i+=2) {
        arr[i/2] = view.getUint16(i, true);
    }
    return arr;
}
function convertFloat(bytes) {
    let view = new DataView(new ArrayBuffer(bytes.length));
    bytes.forEach((b, i) => view.setUint8(i, b));
    let arr = new Array(bytes.length / 4);
    for(let i = 0; i < bytes.length; i+=4) {
        arr[i/4] = view.getFloat32(i, true);
    }
    return arr;
}

http.listen(PORT, () => console.log(`Started server at port: ${PORT}!`));
