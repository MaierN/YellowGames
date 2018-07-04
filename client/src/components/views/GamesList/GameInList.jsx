import React, { Component } from 'react';

import PlayerSelect from './PlayerSelect.jsx';

class GameInList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expandDescription: false,
      showPlayerSelect: false,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleClosePlayerSelect = this.handleClosePlayerSelect.bind(this);
    this.handleClickExpand = this.handleClickExpand.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.setState({showPlayerSelect: true});
  }

  handleClosePlayerSelect() {
    this.setState({showPlayerSelect: false});
  }

  handleClickExpand(e) {
    const { expandDescription } = this.state;
    this.setState({ expandDescription: !expandDescription });
  }

  render() {
    const { title, name, description, image } = this.props;
    const { showPlayerSelect, expandDescription } = this.state;

    return (
      <div className="gameInList-mainContainer">
        <div className="gameInList-headContainer">
          <div><img src={image} alt="" className="gameInList-image"/></div>
          <div className="gameInList-title">{title}</div>
          <div><button className="gameInList-playButton" onClick={this.handleClick}>Play</button></div>
        </div>
        <div className={"gameInList-description " + (expandDescription ? "gameInList-descriptionTextOut" : "gameInList-descriptionTextIn")}>
          {description}
        </div>
        <div style={{textAlign: "center"}}>
          <svg onClick={this.handleClickExpand} className={"gameInList-dropIcon " + (expandDescription ? "gameInList-dropIconOut" : "gameInList-dropIconIn")} x="0px" y="0px" width="25px" height="25px" viewBox="0 0 24 24" enableBackground="new 0 0 24 24" space="preserve">
            <g id="Bounding_Boxes">
  	           <path opacity="0.87" fill="none" d="M24,24H0L0,0l24,0V24z"/>
             </g>
             <g id="Rounded">
  	            <path d="M15.88,9.29L12,13.17L8.12,9.29c-0.39-0.39-1.02-0.39-1.41,0l0,0c-0.39,0.39-0.39,1.02,0,1.41l4.59,4.59,c0.39,0.39,1.02,0.39,1.41,0l4.59-4.59c0.39-0.39,0.39-1.02,0-1.41l0,0C16.91,8.91,16.27,8.9,15.88,9.29z"/>
              </g>
          </svg>
        </div>
        {!showPlayerSelect ? null : (
          <PlayerSelect title={title} name={name} onClose={this.handleClosePlayerSelect}></PlayerSelect>
        )}
      </div>
    );
  }
}

export default GameInList;
