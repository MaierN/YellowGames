import React, { Component } from 'react';

import Turn from './Turn.jsx';

import wsMgr from '../../../js/wsMgr.js';

class Battleship extends Component {
  constructor(props) {
    super(props);

    this.state = {
      grid: [
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
      ],
      hits: [
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
      ],
      hover: [
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
      ],
      ennemyGrid: [
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
      ],
      ennemyHits: [
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
      ],
      yourTurn: props.initialInfos.yourTurn,
      phase: 0,
      boats: {
        1: {placed: false, size: 5, hits: 0, name: "Carrier"},
        2: {placed: false, size: 4, hits: 0, name: "Battleship"},
        3: {placed: false, size: 3, hits: 0, name: "Cruiser"},
        4: {placed: false, size: 3, hits: 0, name: "Submarine"},
        5: {placed: false, size: 2, hits: 0, name: "Destroyer"},
      },
      selection: null,
      rotated: false,
      ennemyBoats: {
        1: {placed: false, size: 5, sunk: false, name: "Carrier"},
        2: {placed: false, size: 4, sunk: false, name: "Battleship"},
        3: {placed: false, size: 3, sunk: false, name: "Cruiser"},
        4: {placed: false, size: 3, sunk: false, name: "Submarine"},
        5: {placed: false, size: 2, sunk: false, name: "Destroyer"},
      },
      ennemyHoverX: null,
      ennemyHoverY: null,
    };

    this.hoverX = null;
    this.hoverY = null;

    this.handleClickPlace = this.handleClickPlace.bind(this);
    this.handleChangeRotated = this.handleChangeRotated.bind(this);
    this.handleClickYourGrid = this.handleClickYourGrid.bind(this);
    this.handleHoverYourGrid = this.handleHoverYourGrid.bind(this);
    this.handleClickEnnemyGrid = this.handleClickEnnemyGrid.bind(this);
    this.handleHoverEnnemyGrid = this.handleHoverEnnemyGrid.bind(this);
  }

  componentDidMount() {
    const { grid, boats, hover, ennemyBoats, hits, ennemyHits, ennemyGrid } = this.state;

    this.gameSubscription = wsMgr.subscribe("gameBattleship", msg => {
      const data = msg.data;

      switch (data.request) {
        case "put":
        for (let i = 0; i < boats[data.selection].size; i++) {
          grid[data.row + (data.rotated ? i : 0)][data.col + (data.rotated ? 0 : i)] = data.selection;
        }
        boats[data.selection].placed = true;

        this.hoverX = null;
        this.hoverY = null;
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            hover[i][j] = "";
          }
        }

        this.setState({ grid, boats, selection: null, hover });
        break;

        case "ennemyPut":
        ennemyBoats[data.selection].placed = true;
        this.setState({ ennemyBoats });
        break;

        case "phase1":
        this.setState({phase: 1});
        break;

        case "attack":
        hits[data.row][data.col] = "X";
        if (data.type === "water") {

        } else if (data.type === "touched") {
          ennemyGrid[data.row][data.col] = "a";
        } else {
          ennemyGrid[data.row][data.col] = "a";
          ennemyBoats[data.boat].sunk = true;
        }
        this.setState({ hits, ennemyGrid, ennemyBoats, yourTurn: data.yourTurn });
        break;

        case "ennemyAttack":
        ennemyHits[data.row][data.col] = "X";
        if (grid[data.row][data.col] !== "") {
          boats[grid[data.row][data.col]].hits++;
        }
        this.setState({ ennemyHits, boats, yourTurn: data.yourTurn });
        break;

        default: break;
      }
    });
  }

  componentWillUnmount() {
    wsMgr.unsubscribe("gameBattleship", this.gameSubscription);
  }

  handleClickPlace(e, boat) {
    this.setState({selection: boat});
  }

  handleChangeRotated(e) {
    this.setState({ rotated: e.target.checked });
  }

  handleClickYourGrid(e, row, col) {
    const { rotated, selection } = this.state;

    wsMgr.sendData({
      request: "play",
      data: {
        request: "put",
        row,
        col,
        rotated,
        selection,
      },
    });
  }

  handleHoverYourGrid(e, row, col) {
    const { selection, rotated, hover, boats } = this.state;

    if (selection === null) return;

    if (this.hoverX !== null) {
      for (let i = 0; i < boats[selection].size; i++) {
        if (this.hoverX + (rotated ? i : 0) <= 9 && this.hoverY + (rotated ? 0 : i) <= 9) {
          hover[this.hoverX + (rotated ? i : 0)][this.hoverY + (rotated ? 0 : i)] = "";
        }
      }
    }

    if (row !== null) {
      for (let i = 0; i < boats[selection].size; i++) {
        if (row + (rotated ? i : 0) <= 9 && col + (rotated ? 0 : i) <= 9) {
          hover[row + (rotated ? i : 0)][col + (rotated ? 0 : i)] = "1";
        }
      }
    }

    this.hoverX = row;
    this.hoverY = col;

    this.setState({ hover });
  }

  handleClickEnnemyGrid(e, row, col) {
    wsMgr.sendData({
      request: "play",
      data: {
        request: "attack",
        row,
        col,
      },
    });
  }

  handleHoverEnnemyGrid(e, row, col) {
    this.setState({ ennemyHoverX: row, ennemyHoverY: col });
  }

  render() {
    const { grid, hits, phase, boats, yourTurn, selection, hover, rotated, ennemyBoats, ennemyGrid, ennemyHits, ennemyHoverX, ennemyHoverY } = this.state;

    const yourGridT = [];
    for (let i = 0; i < 10; i++) {
      const rowT = [];
      for (let j = 0; j < 10; j++) {
        rowT.push({
          color: (grid[i][j] === "" ? (hover[i][j] === "" ? styles.cellWater : styles.cellHover) : ennemyHits[i][j] === "" ? styles.cellBoat : styles.cellHit).backgroundColor,
          cursor: selection && phase === 0 ? "pointer" : "default",
          content: ennemyHits[i][j],
          onClick: !selection || phase !== 0 ? () => {} : e => this.handleClickYourGrid(e, i, j),
          onMouseOver: e => this.handleHoverYourGrid(e, i, j),
        });
      }
      yourGridT.push(rowT);
    }

    const yourBoatsComp = [];
    for (let i = 1; i <= 5; i++) {
      const clickable = !boats[i].placed && selection !== i;
      yourBoatsComp.push(
        <tr key={i}>
          <td style={{textAlign: "right"}}>{boats[i].name + " (" + boats[i].size + (phase === 1 ? " - " + boats[i].hits : "") + "): "}</td>
          <td style={{textAlign: "left"}}>
            {phase === 0 ? (
              <button
                className={"battleship-placeButton" + (clickable ? "" : " battleship-placeButtonDisabled")}
                disabled={!clickable}
                onClick={!clickable ? () => {} : e => this.handleClickPlace(e, i)}>
                {boats[i].placed ? "Placed..." : selection === i ? "Selected..." : "Place!"}
              </button>
            ) : (
              boats[i].hits < boats[i].size ? "Alive!" : "Sunk..."
            )}
          </td>
        </tr>
      );
    }

    const ennemyGridT = [];
    for (let i = 0; i < 10; i++) {
      const rowT = [];
      for (let j = 0; j < 10; j++) {
        rowT.push({
          color: (hits[i][j] === "" ? (phase === 1 && yourTurn && i === ennemyHoverX && j === ennemyHoverY ? styles.cellAttack : {backgroundColor: "white"}) : ennemyGrid[i][j] === "" ? styles.cellWater : styles.cellHit).backgroundColor,
          cursor: phase === 1 && yourTurn && hits[i][j] === "" ? "pointer" : "default",
          content: hits[i][j],
          onClick: phase === 0 || !yourTurn || hits[i][j] !== "" ? () => {} : e => this.handleClickEnnemyGrid(e, i, j),
          onMouseOver: e => this.handleHoverEnnemyGrid(e, i, j),
        });
      }
      ennemyGridT.push(rowT);
    }

    const ennemyBoatsComp = [];
    for (let i in ennemyBoats) {
      ennemyBoatsComp.push(
        <tr key={i}>
          <td style={{textAlign: "right"}}>{ennemyBoats[i].name + " (" + ennemyBoats[i].size + "): "}</td>
          <td style={{textAlign: "left"}}>{(!ennemyBoats[i].placed ? "Not placed..." : !ennemyBoats[i].sunk ? (phase === 0 ? "Placed" : "Alive...") : "Sunk!")}</td>
        </tr>
      );
    }

    return (
      <div>
        <div>
          <Turn yourTurn={yourTurn} text={phase === 0 ? "Place your ships!" : null}></Turn>
        </div>
        <div className="battleship-mainContainer">
          <div style={{flexBasis: "calc(50% - 1px)", flexGrow: "0", flexShrink: "0", paddingRight: "7.5px", boxSizing: "border-box"}}>
            <div>
              <div className="battleship-title">Your side:</div>
              <div onMouseLeave={e => this.handleHoverYourGrid(e, null, null)}>{this.renderGrid(yourGridT)}</div>
              <table style={{margin: "10px auto", color: "#333333", fontFamily: "Montserrat, sans-serif", fontWeight: "bold", fontSize: "18px"}}>
                <tbody>
                  {yourBoatsComp}
                </tbody>
              </table>
              {phase === 1 ? null : (
                <div style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: "5px"}}>
                  <span style={{color: "#333333", fontFamily: "Montserrat, sans-serif", fontWeight: "bold", fontSize: "23px"}}>Place vertically:</span>
                  <input className="battleship-verticalCheckbox" type="checkbox" checked={rotated} onChange={this.handleChangeRotated}></input>
                </div>
              )}
            </div>
          </div>
          <div style={{flexBasis: "2px", flexGrow: "0", flexShrink: "0", backgroundColor: "rgb(254,185,45)", borderRadius: "1px"}} className="battleship-separator"></div>
          <div style={{flexBasis: "calc(50% - 1px)", flexGrow: "0", flexShrink: "0", paddingLeft: "7.5px", boxSizing: "border-box"}}>
            <div>
              <div className="battleship-title">Ennemy side:</div>
              <div onMouseLeave={e => this.handleHoverEnnemyGrid(e, null, null)}>{this.renderGrid(ennemyGridT)}</div>
              <table style={{margin: "10px auto", color: "#333333", fontFamily: "Montserrat, sans-serif", fontWeight: "bold", fontSize: "18px"}}>
                <tbody>
                  {ennemyBoatsComp}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderGrid(t) {
    const { phase } = this.state;

    const elems = [];
    for (let i = 0; i < t.length; i++) {
      for (let j = 0; j < t.length; j++) {
        elems.push(
          <rect
            key={i + "-" + j}
            x={j * 22 + 2}
            y={i * 22 + 2}
            width="20"
            height="20"
            rx="2"
            ry="2"
            style={{fill: t[i][j].color, transition: phase === 0 ? "0s" : ".15s"}}
            />
        );

        if (t[i][j].content) {
          elems.push(<line key={i + "-" + j + "-x1"} className="battleship-fadeIn" x1={j*22+6} y1={i*22+6} x2={j*22+18} y2={i*22+18} style={{strokeWidth: "2"}}/>);
          elems.push(<line key={i + "-" + j + "-x2"} className="battleship-fadeIn" x2={j*22+6} y1={i*22+6} x1={j*22+18} y2={i*22+18} style={{strokeWidth: "2"}}/>);
        }

        elems.push(
          <rect
            key={i + "-" + j + "-a"}
            x={j * 22 + 1}
            y={i * 22 + 1}
            width="22"
            height="22"
            style={{cursor: t[i][j].cursor, fill: "transparent"}}
            onClick={t[i][j].onClick}
            onMouseOver={t[i][j].onMouseOver}
            />
        );
      }
    }


    return (
      <svg style={{width: "300px", maxWidth: "100%"}} viewBox="0 0 222 222">
        <rect x="0" y="0" width="100%" height="100%" fill="rgb(254,185,45)" rx="4" ry="4"/>
        {elems}
      </svg>
    );
  }
}

const styles = {
  cellWater: {
    backgroundColor: "#82c6ff",
  },
  cellHover: {
    backgroundColor: "#acffa0",
  },
  cellBoat: {
    backgroundColor: "#66ff4f",
  },
  cellHit: {
    backgroundColor: "#f7be42",
  },
  cellAttack: {
    backgroundColor: "#c4c4c4",
  },
};

export default Battleship;
