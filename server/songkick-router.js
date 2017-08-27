let express = require('express');
let router = express.Router();
let axios = require('axios');
let apiKey = 'qRDqWCS0qJpDH4Qp';
let bodyParser = require('body-parser');
let db = require('../database/index.js');
let async = require('async');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

router.post('/', (req, res) => {
  let date = req.body.date;
  let lat = req.body.lat;
  let lng = req.body.lng;
  //look for events in db that have specific date, within a specific area
  db.getEvents(date, lat, lng)
  .then((dbEvents) => {
    //if there are matching items in the db
    if (dbEvents.length) {
      //send to client
      res.send(dbEvents);
      //nothing return from db query
    } else {
      //build songkick api call url
      return `http://api.songkick.com/api/3.0/events.json?apikey=${apiKey}&location=geo:${lat},${lng}&min_date=${date}&max_date=${date}`;
    }
  })
  .then((url) => {
    if (url) {
      console.log('Has No Database Records')
      // api call to songkick
      axios.get(url)
      .then((events) => {
        let data = events.data.resultsPage.results.event;
        // create event in events table for each event in events
        async.each(data, (event, callback) => {
          db.createEvent(event).then(callback);
        }, (err, results) => {
          // retrieve new events from db
          db.getEvents(date, lat, lng)
            .then((events) => {
              //send to client
              res.send(events);
            });
        });
      });
    } else {
      console.log('Has Database Records')
    }
 
  })
  .catch((err) => {
    console.log('ERROR ', err);
    res.status(404).send(err); 
  });

});

router.post('/artist', (req, res) => {
  
  console.log(req.body)

  var firstRequest = (req, res, page) => {

    var artist = req.body.artist || 'Metallica';
    var page = page || req.body.page;
    var url =  `http://api.songkick.com/api/3.0/search/artists.json?query=${artist}&apikey=${apiKey}&page=${page}`;
    
    return axios.get(url)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
  };
  
  firstRequest(req, res, req.page);
});

module.exports = router;