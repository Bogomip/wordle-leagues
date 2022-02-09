const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const dataRoutes = require('./routes/data');
const userRoutes = require('./routes/user');
const leagueRoutes = require('./routes/leagues');

const app = express();

mongoose.connect("mongodb+srv://wordleleagueadmin:yv7YfcnAl8Qt3c2K@cluster0.vuxdp.mongodb.net/wordle-league?retryWrites=true&w=majority")
.then(() => {
  console.log('Connected to DB');
})
.catch((e) => {
  console.log("Connection Error... " + e)
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
})

app.use("/api/data", dataRoutes);
app.use("/api/user", userRoutes);
app.use("/api/league", leagueRoutes);

module.exports = app;
