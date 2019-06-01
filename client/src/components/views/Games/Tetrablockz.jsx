import React, { Component } from 'react';

import wsMgr from '../../../js/wsMgr.js';

class Tetrablockz extends Component {
  constructor(props) {
    super(props);

    this.state = {
      grid: (() => {
        let grid = [];
        for (let i = 0; i < 20; i++) {
          let row = [];
          for (let j = 0; j < 10; j++) {
            row.push("");
          }
          grid.push(row);
        }
        return grid;
      })(),
      otherGrid: (() => {
        let grid = [];
        for (let i = 0; i < 20; i++) {
          let row = [];
          for (let j = 0; j < 10; j++) {
            row.push("");
          }
          grid.push(row);
        }
        return grid;
      })(),
      incomingLines: 0,
    };

    this.colors = {
      "": "#e8e8e8",
      "T": "purple",
      "I": "lightblue",
      "L": "orange",
      "J": "blue",
      "S": "green",
      "Z": "red",
      "O": "yellow",
      "W": "black",
    };

    this.handleKeydown = this.handleKeydown.bind(this);

    this.handleClickBtnLeft = this.handleClickBtnLeft.bind(this);
    this.handleClickBtnRight = this.handleClickBtnRight.bind(this);
    this.handleClickBtnFastFall = this.handleClickBtnFastFall.bind(this);
    this.handleClickBtnInstantFall = this.handleClickBtnInstantFall.bind(this);
    this.handleClickBtnRotateLeft = this.handleClickBtnRotateLeft.bind(this);
    this.handleClickBtnRotateRight = this.handleClickBtnRotateRight.bind(this);
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeydown);
  }

  componentDidMount() {
    this.gameSubscription = wsMgr.subscribe("gameTetrablockz", msg => {
      const data = msg.data;
      if (data.grid) {
        this.setState({ grid: data.grid, incomingLines: data.incomingLines });
      } else {
        this.setState({ otherGrid: data.otherGrid });
      }
    });
  }

  componentWillUnmount() {
    wsMgr.unsubscribe("gameTetrablockz", this.gameSubscription);
    document.removeEventListener("keydown", this.handleKeydown);
  }

  handleKeydown(e) {
    switch (e.code) {
      case "KeyA": this.handleClickBtnLeft(); break;
      case "KeyD": this.handleClickBtnRight(); break;
      case "KeyS": this.handleClickBtnFastFall(); break;
      case "KeyW": this.handleClickBtnInstantFall(); break;
      case "ArrowLeft": this.handleClickBtnLeft(); break;
      case "ArrowRight": this.handleClickBtnRight(); break;
      case "ArrowUp": this.handleClickBtnRotateRight(); break;
      case "ArrowDown": this.handleClickBtnInstantFall(); break;
      case "KeyJ": this.handleClickBtnRotateLeft(); break;
      case "KeyL": this.handleClickBtnRotateRight(); break;
      case "KeyK": this.handleClickBtnFastFall(); break;
      case "KeyI": this.handleClickBtnInstantFall(); break;

      default: break;
    }
  }

  handleClickBtnLeft() {
    wsMgr.sendData({
      request: "play",
      data: {
        command: "left"
      }
    });
  }

  handleClickBtnRight() {
    wsMgr.sendData({
      request: "play",
      data: {
        command: "right"
      }
    });
  }

  handleClickBtnFastFall() {
    wsMgr.sendData({
      request: "play",
      data: {
        command: "fastFall"
      }
    });
  }
  
  handleClickBtnInstantFall() {
    wsMgr.sendData({
      request: "play",
      data: {
        command: "instantFall"
      }
    });
  }
  
  handleClickBtnRotateLeft() {
    wsMgr.sendData({
      request: "play",
      data: {
        command: "rotateLeft"
      }
    });
  }
  
  handleClickBtnRotateRight() {
    wsMgr.sendData({
      request: "play",
      data: {
        command: "rotateRight"
      }
    });
  }

  render() {
    const { grid, incomingLines, otherGrid } = this.state;

    const cellWidth = 30;
    const cellSpacing = 1;

    const gridComp = [];
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 10; j++) {
        gridComp.push(
          <rect
            key={i + "-" + j}
            x={j * (cellWidth + cellSpacing)}
            y={i * (cellWidth + cellSpacing)}
            width={cellWidth}
            height={cellWidth}
            fill={this.colors[grid[i][j].charAt(0)]}
            style={{opacity: grid[i][j].length > 1 ? 0.3 : 1}}/>
        );
      }
    }

    const otherGridComp = [];
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 10; j++) {
        otherGridComp.push(
          <rect
            key={i + "-" + j}
            x={j * (cellWidth + cellSpacing)}
            y={i * (cellWidth + cellSpacing)}
            width={cellWidth}
            height={cellWidth}
            fill={this.colors[otherGrid[i][j].charAt(0)]}/>
        );
      }
    }

    return (
      <div>
        <div>
          <table style={{width: "100%"}}>
            <tbody>
              <tr>
                <td valign="middle" style={{width: "60%", textAlign: "right"}}>
                  <svg
                    style={{marginTop: "25px", maxWidth: "300px", paddingRight: "40px"}}
                    viewBox={"0 0 " + (10*cellWidth + 9*cellSpacing) + " " + (20*cellWidth + 19*cellSpacing)}>
                    {gridComp}
                  </svg>
                </td>
                <td valign="middle" style={{width: "40%", textAlign: "left", paddingLeft: "40px"}}>
                  <svg
                    style={{marginTop: "25px", maxWidth: "200px"}}
                    viewBox={"0 0 " + (10*cellWidth + 9*cellSpacing) + " " + (20*cellWidth + 19*cellSpacing)}>
                    {otherGridComp}
                  </svg>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>{incomingLines > 0 ? "Warning, " + incomingLines + " incoming" : ""}</div>
        <div>
          <button onClick={this.handleClickBtnLeft}>←</button>
          <button onClick={this.handleClickBtnRight}>→</button>
          <button onClick={this.handleClickBtnFastFall}>↓</button>
          <button onClick={this.handleClickBtnInstantFall}>🡇</button>
          <button onClick={this.handleClickBtnRotateLeft}>↶</button>
          <button onClick={this.handleClickBtnRotateRight}>↷</button>
        </div>
      </div>
    );
  }
}

export default Tetrablockz;
