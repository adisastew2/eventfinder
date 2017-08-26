import React from 'react';

import { markerStyle, markerStyleHover, pStyleHover } from './MarkerStyles.js';


export default class Markers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: this.props.lat,
      lng: this.props.lng,
      name: this.props.name,
      headLine: this.props.headLine
    }
  }

  handleClick() {
    console.log('WAS CLICKED', this.state.headLine);
    this.props.handleArtistClick(this.state.headLine);
  }


  render() {
    
    // if the marker itself is being hovered or if the name of the venue corresponding to the
    // marker is the same as the name passed from the concert component, change the style accordingly
    // also, it's literally just a css circle. you could probably add an image or something 
    let style = this.props.$hover || this.state.name === this.props.hovered ? markerStyleHover : markerStyle;
    
    // console.log('this.props.$hover: ', this.props.$hover);
    if (this.props.$hover) {
      console.log('hovered!');
      return (
        <div>
          <div onClick={this.handleClick.bind(this)} style={style}>
          </div>

          <br/>
          <br/>
          <br/>
          <div style={pStyleHover}>
            <p> Concert Name: {this.props.headLine} </p>
            <p> Venue: {this.props.name} </p>
          </div>
          
        </div>
      );
    } else {
      return (
        <div style={style}>
        </div>
      );

    }
  }
}