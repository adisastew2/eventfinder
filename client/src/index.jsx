import React from 'react';
import ReactDOM from 'react-dom';
import { Grid, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import Filters from './components/Filters.jsx';
import Map from './components/Map.jsx';
import Playlist from './components/Playlist.jsx';
import Concerts from './components/Concerts.jsx';
import Artist from './components/Artists.jsx';

import ReactScrollbar from 'react-scrollbar-js';
import {PageHeader} from 'react-bootstrap';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      startDate: moment(),
      artist: '',
      artistId: undefined,
      artistList: [],
      hoveredEvent: '',
      token: undefined,
      mapCenter: {lat: 37.783607, lng:-122.408967}
    };

    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleArtistClick = this.handleArtistClick.bind(this);
    this.handleMapChange = this.handleMapChange.bind(this);
    this.handleHover = this.handleHover.bind(this);
    this.getArtistData = this.getArtistData.bind(this);
  }

  componentWillMount() {
    this.authenticateSpotify();
    this.requestSongkickEvents();
  }

  authenticateSpotify() {
    if (window.location.hash) {
      let hash = window.location.hash;
      let token = hash.split('&')[0].split('=')[1];
      this.setState({
        token: token
      });
      axios.post('/spotify/login', {
          data: token
      })
      .catch((error) => {
        console.log(error);
      });
    } else {
      axios.get('/spotify/login')
        .then((response) => {
          let loginUrl = response.data;
          window.location = loginUrl;
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  handleDateChange(date) {
    this.setState({
      startDate: date
    }, () => {
      //after setState finished update 
      this.requestSongkickEvents(this.state.startDate);
    });
  }

  handleArtistClick(clickedArtist) {
    this.setState({
      artist: clickedArtist
    }, () => {
      console.log('new state: ', this.state.artist);
       this.requestArtistId();
    })
  }

  handleHover(hoveredEvent) {
    if (hoveredEvent) {
      this.setState({
        hoveredEvent: hoveredEvent
      });
    } else {
      this.setState({
        hoveredEvent: ''
      });
    }
  }

  requestArtistId() {
    if (this.state.artist) {
      let data = {
          artist: this.state.artist,
          token: this.state.token
        };
        axios.post('/spotify/search', data)
          .then((res) => {
            this.setState({
              artistId: res.data.artistId,
            });
          })
          .catch((err) => {
            console.log(err);
          });
    } else {
      this.setState({
        artist: ''
      })
    }
  }

  requestSongkickEvents(date) {
    let formattedDate = this.state.startDate.format('YYYY-MM-DD');
    let latitude = this.state.mapCenter.lat;
    let longitude = this.state.mapCenter.lng;
    if (date) {
      formattedDate = date.format('YYYY-MM-DD')
    }
    axios.post('/songkick/', {
      date: formattedDate,
      lat: latitude,
      lng: longitude
    })
      .then((data) => {
        if(data.data[0] !== undefined){
          this.setState({
          events: data.data,
          artist: data.data[0].headline
          });
          this.requestArtistId();
        } else {
          this.setState({
            events: [],
            artist: ''
          });
        }
        
      })
      .catch((err) => {
        console.log('Error: ', err);
      });
  }

  handleMapChange(loc) {
    this.setState({
      mapCenter: loc
    })
    this.requestSongkickEvents(this.state.startDate);
  }

  getArtistData(artistList){
    console.log('ArtistsList is', artistList)
    this.setState({
      artistList: artistList
    })
  }

 render() {

    const scrollbar = {
      width: 555,
      height: 290,
      margin: 10
    };

    const header = {
      fontFamily: 'futura',
      fontSize: 70,
      color: '#CD3F2A'
    };

    return (

      <Grid>
        <Row>
          <Col md={12}>
          <div>
            <PageHeader style={header}>ConcertMate <small>discover upcoming concerts around you</small></PageHeader>
          </div>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Filters handleMapChange={this.handleMapChange} 
                     handleDateChange={this.handleDateChange} 
                     startDate={this.state.startDate}
                     getArtistData={this.getArtistData}/>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Map handleArtistClick={this.handleArtistClick} mapCenter={this.state.mapCenter} hovered={this.state.hoveredEvent} events={this.state.events}/>
          </Col>
          <Col md={6}>
          <Row>
            <Col md={12}>
            <Playlist artistId={this.state.artistId}/>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Songkick_logo.jpg/799px-Songkick_logo.jpg" height="75" width="300" />
              <ReactScrollbar style={scrollbar}>
                <Concerts handleHover={this.handleHover} events={this.state.events} handleArtistClick={this.handleArtistClick}/>
              </ReactScrollbar>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <ReactScrollbar style={scrollbar}>
                <Artist artistList={this.state.artistList}/>
              </ReactScrollbar>
            </Col>
          </Row>
          </Col>
        </Row>
      </Grid>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));

