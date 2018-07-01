import React, { Component } from 'react';

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
        1: {placed: false, size: 5, hits: 0},
        2: {placed: false, size: 4, hits: 0},
        3: {placed: false, size: 3, hits: 0},
        4: {placed: false, size: 3, hits: 0},
        5: {placed: false, size: 2, hits: 0},
      },
      selection: null,
      rotated: false,
      ennemyBoats: {
        1: {placed: false, size: 5, sunk: false},
        2: {placed: false, size: 4, sunk: false},
        3: {placed: false, size: 3, sunk: false},
        4: {placed: false, size: 3, sunk: false},
        5: {placed: false, size: 2, sunk: false},
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

    const yourGridComp = [];
    for (let i = 0; i < 10; i++) {
      const rowComp = [];
      for (let j = 0; j < 10; j++) {
        const style = grid[i][j] === "" ? (hover[i][j] === "" ? styles.cellWater : styles.cellHover) : ennemyHits[i][j] === "" ? styles.cellBoat : styles.cellHit;
        rowComp.push(
          <div
            key={j}
            style={{...styles.cell, ...style, ...(selection && phase === 0 ? styles.clickableCell : {})}}
            onClick={!selection || phase !== 0 ? () => {} : e => this.handleClickYourGrid(e, i, j)}
            onMouseOver={e => this.handleHoverYourGrid(e, i, j)}>
            {ennemyHits[i][j]}
          </div>);
      }
      yourGridComp.push(<div key={i} style={styles.row}>{rowComp}</div>);
    }

    const yourBoatsComp = [];
    for (let i = 1; i <= 5; i++) {
      const clickable = !boats[i].placed && selection !== i;
      yourBoatsComp.push(
        <div key={i}>
          {boats[i].size + ": "}
          {phase === 0 ? (
            <button
              disabled={!clickable}
              onClick={!clickable ? () => {} : e => this.handleClickPlace(e, i)}>
              {boats[i].placed ? "Placed..." : selection === i ? "Selected..." : "Place !"}
            </button>
          ) : (
            boats[i].hits < boats[i].size ? "Alive !" : "Sunk..."
          )}
        </div>
      );
    }

    const ennemyGridComp = [];
    for (let i = 0; i < 10; i++) {
      const rowComp = [];
      for (let j = 0; j < 10; j++) {
        const style = hits[i][j] === "" ? (phase === 1 && yourTurn && i === ennemyHoverX && j === ennemyHoverY ? styles.cellAttack : {}) : ennemyGrid[i][j] === "" ? styles.cellWater : styles.cellHit;
        rowComp.push(
          <div
            key={j}
            style={{...styles.cell, ...style, ...(phase === 1 && yourTurn && hits[i][j] === "" ? styles.clickableCell : {})}}
            onClick={phase === 0 || !yourTurn || hits[i][j] !== "" ? () => {} : e => this.handleClickEnnemyGrid(e, i, j)}
            onMouseOver={e => this.handleHoverEnnemyGrid(e, i, j)}>
            {hits[i][j]}
          </div>);
      }
      ennemyGridComp.push(<div key={i} style={styles.row}>{rowComp}</div>);
    }

    const ennemyBoatsComp = [];
    for (let i in ennemyBoats) {
      ennemyBoatsComp.push(<div key={i}>{ennemyBoats[i].size + ": " + (!ennemyBoats[i].placed ? "Not placed..." : !ennemyBoats[i].sunk ? (phase === 0 ? "Placed" : "Alive...") : "Sunk !")}</div>);
    }

    return (
      <div>
        <div>{phase === 0 ? "Place your ships !" : yourTurn ? "Your turn !" : "Opponent is playing..."}</div>
        <div>Ennemy side:</div>
        <div>
          <div style={{display: "flex", flexDirection: "row"}}>
            <div style={{display: "flex", flexDirection: "column"}} onMouseLeave={e => this.handleHoverEnnemyGrid(e, null, null)}>{ennemyGridComp}</div>
            <div style={{flexGrow: 1}}></div>
          </div>
          <div>{ennemyBoatsComp}</div>
        </div>
        <div>Your side:</div>
        <div>
          <div style={{display: "flex", flexDirection: "row"}}>
            <div style={{display: "flex", flexDirection: "column"}} onMouseLeave={e => this.handleHoverYourGrid(e, null, null)}>{yourGridComp}</div>
            <div style={{flexGrow: 1}}></div>
          </div>
          <div>
            <div>{yourBoatsComp}</div>
            <div>
              <label>Rotate: <input type="checkbox" checked={rotated} onChange={this.handleChangeRotated}></input></label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  cell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    border: "1px solid black",
    height: "20px",
    width: "20px",
    cursor: "default",
  },
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
  clickableCell: {
    cursor: "pointer",
  },
  row: {
    display: "flex",
    flexDirection: "row",
  },
};

export default Battleship;
