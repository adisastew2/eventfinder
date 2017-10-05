import React from 'react';

import GoogleMapReact from 'google-map-react';
import GoogleMapMarkers from 'google-map-react';
import Markers from './Markers.jsx';

const style = {
  position: 'fixed',
  overflow: 'visible',
  top: 190,
  left: 65,
  width: '45%',
  height: '70%',
  margin: 0,
  padding: 0
}

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // we hard-coded this map center but ideally you'll be able to set location based on google search
      center: this.props.mapCenter,
      zoom: 13,
      markerLocs: []
    }
  }

 

  componentWillReceiveProps(nextProps) {
    this.setState({center: nextProps.mapCenter});

    let events = nextProps.events;
    console.log("events: ", events);
    let venues = events.map((event) => {
      return {
        lat: event.latitude,
        lng: event.longitude,
        name: event.venue,
        headLine: event.headline
      }
    });
    this.setState({
      markerLocs: venues
    });
  }


  render() {
    let context = this;
    let markers = this.state.markerLocs.map((loc) => {
      return <Markers handleArtistClick={this.props.handleArtistClick} hovered={this.props.hovered} name={loc.name} lat={loc.lat} lng={loc.lng} headLine={loc.headLine} />
    });
    return (
      <div style={style}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'AIzaSyBUcm8CLYTJaq8AV3doIGeOwMTq1Yx89XY' }}
          center={this.state.center}
          defaultZoom={this.state.zoom}
        >
          {markers}
        </GoogleMapReact>
      </div>
    )
  }
}

export default Map;