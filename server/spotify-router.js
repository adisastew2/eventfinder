let router = require('express').Router();
let axios = require('axios');
let bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

let redirect_uri;
let domain;

if (process.env.NODE_ENV === 'production') {
	redirect_uri = 'https://concertmate8-17.herokuapp.com/spotify/callback/';
  domain = 'https://concertmate8-17.herokuapp.com/';
} else {
	redirect_uri = 'http://localhost:1337/spotify/callback/';
  domain = 'http://localhost:1337';
}
let spotifyCredentials = {
	client_id: '0454aa601a244e1eba920915d9c1fad5',
	client_secret: '9f3701dc2804434a9a9cfc791f286806',
	redirect_uri: redirect_uri
};

let token = undefined;

let tokenHeader = {
	'Authorization': 'Bearer ' + token
};

//start authentication flow on refresh
router.get('/login', (req, res) => {

	let encodedClientId = encodeURIComponent(spotifyCredentials.client_id)
	let encodedRedirectURI = encodeURIComponent(spotifyCredentials.redirect_uri);
	let authorizeURL = `https://accounts.spotify.com/authorize?client_id=${encodedClientId}&redirect_uri=${encodedRedirectURI}&scope=user-read-private%20user-read-email&response_type=token`;
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.send(authorizeURL);

});

//callback route
router.get('/callback', (req, res) => {
	res.redirect(domain);
});

//save token
router.post('/login', (req, res) => {
	token = req.body.data;
	res.status(200).send();
})

//handle artist search submission
router.post('/search', bodyParser.json(), (req, res) => {
	let artist = encodeURI(req.body.artist);
	let token = req.body.token;

	axios.get(`https://api.spotify.com/v1/search?q=${artist}&type=artist&market=US&limit=10`, {
			headers: {
				'Authorization': 'Bearer ' + token
			}
		})
	.then((artists) => {
		let artistId = artists.data.artists.items[0].id;
		let artistData = {
			artistId: artistId,
		}
		res.send(artistData);
	})
	.catch((error) => {
		console.log(error);
		res.status(404).send('Error');
	});

});

module.exports = router;