const Sequelize = require('sequelize');
let seq;
//setting up a connection 
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
  seq = new Sequelize(process.env.CLEARDB_DATABASE_URL);
} else {
  const credentials = require('./config.js');
  let user = credentials.loginData.user;
  let password = credentials.loginData.password;
  seq = new Sequelize('greenfielddb', user, password, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
  });
}


const Events = seq.define('events', {
  displayName: Sequelize.STRING,
  headline: Sequelize.STRING,
  uri: Sequelize.STRING,
  time: Sequelize.STRING,
  date: Sequelize.STRING,
  venue: Sequelize.STRING,
  latitude: Sequelize.STRING,
  longitude: Sequelize.STRING,
  popularity: Sequelize.DOUBLE
});

Events.sync({force: false}).then(() => {
  console.log('Created "events" table');
});

//test the connection
seq
  .authenticate()
  .then(() => {
    console.log('connection granted');
  })
  .catch(err => {
    console.log('error connecting to DB ', err);
  });

let createEvent = (event) => {
  return Events.create({
	  displayName: event.displayName,
	  headline: event.performance[0].displayName,
	  uri: event.uri,
	  time: event.start.time,
	  date: event.start.date,
	  venue: event.venue.displayName,
	  latitude: event.location.lat,
    longitude: event.location.lng,
    popularity: event.popularity
	});
} 

let getEvents = (date, lat, long) => {
	return Events.findAll({
		where: {
			date: date,
			latitude: {$between: [lat - 5, lat + 5]},
			longitude: {$between: [long - 5, long + 5]}
		},
		order: [
			['popularity', 'DESC']
		],
		raw: true
	});

};

module.exports.createEvent = createEvent;
module.exports.getEvents = getEvents;