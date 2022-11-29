const express = require('express');
const { Client } = require('pg');
require('dotenv').config();
const app = express();

const pg_client = new Client({
    user: process.env.PG_USER,
    host: 'localhost',
    database: process.env.PG_DB,
    password: process.env.PG_PW,
    port: process.env.PG_PORT,
});

pg_client.connect((err) => {
    if(err) throw err;
    console.log('connected');
});

app.set('view-engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));

function time_to_min(t) {
    let min = parseInt(t[0]) * 600 + parseInt(t[1]) * 60 + parseInt(t[3]) * 10 + parseInt(t[4]);
    return min;
}

function padToTwoDigits(num) {
  return num.toString().padStart(2, '0');
}

function min_to_time(t) {
    const hr = Math.floor(t/60);
    t %= 60;
    return `${padToTwoDigits(hr)}:${padToTwoDigits(t)}`;
}

app.get('/', (req, res) => {
    res.render('index.ejs');
});


app.get('/search', async (req, res) => {
    let start_time = req.query.start_time;
    let end_time = req.query.end_time;
    let query = 'SELECT * from course where start_time>=' + String(start_time) + ' AND end_time <= ' + String(end_time) + ';';
    pg_client.query(query, (err, pg_res) => {
        //console.log(err ? err.stack: res.rows);
        if(err) console.log("Error", err);
        else {
            const q_res = pg_res.rows;
            const q_res_length = Object.keys(q_res).length;
            for(var i=0;i<q_res_length;i++) {
                q_res[i].start_time = min_to_time(q_res[i].start_time);
                q_res[i].end_time = min_to_time(q_res[i].end_time);
            }
            console.log(q_res);
            res.render('search_res.ejs', {row: q_res, row_length: q_res_length});
        }
    });
});

app.post('/search', (req, res) => {
    let st = time_to_min(String(req.body.start_time));
    let et = time_to_min(String(req.body.end_time));
    let url = 'search/?start_time=' + String(st) + '&end_time=' + String(et);
    res.redirect(url);
});

app.listen(8081);