CREATE DATABASE co2box;
\c co2box; -- connect to database

CREATE TABLE sensor_data (
    ts TIMESTAMPTZ PRIMARY KEY,
    co2_ppm INTEGER,
    temperature_c REAL,
    humidity_percent REAL
);
INSERT INTO sensor_data VALUES ('Mar 14 2020', 5, 3.4, 2.2), ('Mar 15 2020', 5, 3.4, 2.2),;