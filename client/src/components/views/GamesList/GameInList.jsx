import React, { Component } from 'react';

import PlayerSelect from './PlayerSelect.jsx';

class GameInList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showPlayerSelect: false,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleClosePlayerSelect = this.handleClosePlayerSelect.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.setState({showPlayerSelect: true});
  }

  handleClosePlayerSelect() {
    this.setState({showPlayerSelect: false});
  }

  render() {
    const {title, name, description, image} = this.props;
    const {showPlayerSelect} = this.state;

    return (
      <div onClick={this.handleClick} style={styles.mainContainer}>
        <div><img src={image} alt="" style={styles.img}/></div>
        <div>
          <div>{title}</div>
          <div>{description}</div>
        </div>
        {!showPlayerSelect ? null : (
          <PlayerSelect title={title} name={name} onClose={this.handleClosePlayerSelect}></PlayerSelect>
        )}
      </div>
    );
  }
}

const styles = {
  mainContainer: {
    display: "flex",
    margin: "15px",
    cursor: "pointer",
    border: "1px solid black",
  },
  img: {
    width: "50px",
  },
};

export default GameInList;
