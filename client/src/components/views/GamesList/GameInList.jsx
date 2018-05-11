import React, { Component } from 'react';

class GameInList extends Component {
  render() {
    const {name, description, image} = this.props;

    return (
      <div>
        {image}
        <br/>
        {name}
        <br/>
        {description}
      </div>
    );
  }
}

export default GameInList;
