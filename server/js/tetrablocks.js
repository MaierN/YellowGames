
const pieceNames = [ "O", "Z", "S", "J", "L", "I", "T" ]

const pieces = {
    "O": [
        [
            [true , true , false, false],
            [true , true , false, false],
            [false, false, false, false],
            [false, false, false, false],
        ],
        [
            [true , true , false, false],
            [true , true , false, false],
            [false, false, false, false],
            [false, false, false, false],
        ],
        [
            [true , true , false, false],
            [true , true , false, false],
            [false, false, false, false],
            [false, false, false, false],
        ],
        [
            [true, true, false, false],
            [true, true, false, false],
            [false, false, false, false],
            [false, false, false, false],
        ],
    ],
    "Z": [
        [
            [true , true , false, false],
            [false, true , true , false],
            [false, false, false, false],
            [false, false, false, false],
        ],
        [
            [false, true , false, false],
            [true , true , false, false],
            [true , false, false, false],
            [false, false, false, false],
        ],
        [
            [true , true , false, false],
            [false, true , true , false],
            [false, false, false, false],
            [false, false, false, false],
        ],
        [
            [false, true , false, false],
            [true , true , false, false],
            [true , false, false, false],
            [false, false, false, false],
        ],
    ],
    "S": [
        [
            [false, true , true , false],
            [true , true , false, false],
            [false, false, false, false],
            [false, false, false, false],
        ],
        [
            [true , false, false, false],
            [true , true , false, false],
            [false, true , false, false],
            [false, false, false, false],
        ],
        [
            [false, true , true , false],
            [true , true , false, false],
            [false, false, false, false],
            [false, false, false, false],
        ],
        [
            [true , false, false, false],
            [true , true , false, false],
            [false, true , false, false],
            [false, false, false, false],
        ],
    ],
    "J": [
        [
            [false, true , false, false],
            [false, true , false, false],
            [true , true , false, false],
            [false, false, false, false],
        ],
        [
            [true , false, false, false],
            [true , true , true , false],
            [false, false, false, false],
            [false, false, false, false],
        ],
        [
            [true , true , false, false],
            [true , false, false, false],
            [true , false, false, false],
            [false, false, false, false],
        ],
        [
            [true , true , true , false],
            [false, false, true , false],
            [false, false, false, false],
            [false, false, false, false],
        ],
    ],
    "L": [
        [
            [true , false, false, false],
            [true , false, false, false],
            [true , true , false, false],
            [false, false, false, false],
        ],
        [
            [true , true , true , false],
            [true , false, false, false],
            [false, false, false, false],
            [false, false, false, false],
        ],
        [
            [true , true , false, false],
            [false, true , false, false],
            [false, true , false, false],
            [false, false, false, false],
        ],
        [
            [false, false, true , false],
            [true , true , true , false],
            [false, false, false, false],
            [false, false, false, false],
        ],
    ],
    "I": [
        [
            [false, true , false, false],
            [false, true , false, false],
            [false, true , false, false],
            [false, true , false, false],
        ],
        [
            [false, false, false, false],
            [true , true , true , true ],
            [false, false, false, false],
            [false, false, false, false],
        ],
        [
            [false, false, true , false],
            [false, false, true , false],
            [false, false, true , false],
            [false, false, true , false],
        ],
        [
            [false, false, false, false],
            [false, false, false, false],
            [true , true , true , true ],
            [false, false, false, false],
        ],
    ],
    "T": [
        [
            [false, true , false, false],
            [true , true , true , false],
            [false, false, false, false],
            [false, false, false, false],
        ],
        [
            [false, true , false, false],
            [false, true , true , false],
            [false, true , false, false],
            [false, false, false, false],
        ],
        [
            [false, false, false, false],
            [true , true , true , false],
            [false, true , false, false],
            [false, false, false, false],
        ],
        [
            [false, true , false, false],
            [true , true , false, false],
            [false, true , false, false],
            [false, false, false, false],
        ],
    ],
}

function play(playState, data, connection, isAuto) {
    if (playState.ended) return;

    const isP1 = playState.p1 === connection;

    const piece = isP1 ? playState.pieceP1 : playState.pieceP2;
    const grid = isP1 ? playState.gridP1 : playState.gridP2;

    const otherPiece = isP1 ? playState.pieceP2 : playState.pieceP1;
    const otherGrid = isP1 ? playState.gridP2 : playState.gridP1;
    const otherConnection = isP1 ? playState.p2 : playState.p1;
    
    if (piece.shouldCreate) {
        createPiece(piece);
        connection.sendCustom({
            type: 'gameTetrablocks',
            data: {
                grid: renderGrid(grid, piece, true),
                incomingLines: isP1 ? (playState.lineSent < 0 ? -playState.lineSent : 0) : (playState.lineSent > 0 ? playState.lineSent : 0)
            }
        });
        otherConnection.sendCustom({
            type: 'gameTetrablocks',
            data: {
                otherGrid: renderGrid(grid, piece, false)
            }
        });
        clearTimeout(isP1 ? playState.timeoutP1 : playState.timeoutP2);
        if (isP1) playState.timeoutP1 = setTimeout(() => play(playState, {command: "fastFall"}, playState.p1, true), playState.playDelay);
        else playState.timeoutP2 = setTimeout(() => play(playState, {command: "fastFall"}, playState.p2, true), playState.playDelay);
        return;
    }

    let oldR = piece.r;
    switch (data.command) {
        case "left":
        piece.x--;
        if (!isPieceValid(grid, piece)) piece.x++;
        break;

        case "right":
        piece.x++;
        if (!isPieceValid(grid, piece)) piece.x--;
        break;

        case "fastFall":
        piece.y++;
        if (!isPieceValid(grid, piece)) {
            piece.y--;
            validatePiece(grid, piece);
        }
        isAuto = true;
        break;

        case "instantFall":
        while (isPieceValid(grid, piece)) piece.y++;
        piece.y--;
        validatePiece(grid, piece);
        isAuto = true;
        break;

        case "rotateLeft":
        piece.r = (piece.r - 1 + 4) % 4;
        if (!isPieceValid(grid, piece)) piece.r = oldR;
        break;
        
        case "rotateRight":
        piece.r = (piece.r + 1) % 4;
        if (!isPieceValid(grid, piece)) piece.r = oldR;
        break;

        default: break;
    }

    while (removeLine(grid)) playState.lineSent += (isP1 ? 1 : -1);

    let lost = false;
    
    if (piece.shouldCreate) {
        if (isP1 && playState.lineSent < 0 || !isP1 && playState.lineSent > 0) {

            let addLines = Math.abs(playState.lineSent);
            playState.lineSent = 0;

            const hole = Math.floor(Math.random() * 10);
            let lost = false;
            while (addLines > 0) {
                for (let j = 0; j < 10; j++) {
                    if (grid[0][j] !== "") {
                        lost = true;
                    }
                }
    
                for (let i = 0; i < 19; i++) {
                    for (let j = 0; j < 10; j++) {
                        grid[i][j] = grid[i+1][j];
                    }
                }
    
                for (let j = 0; j < 10; j++) {
                    grid[19][j] = j === hole ? "" : "W";
                }
    
                addLines--;
            }
        }
        createPiece(piece);
    }

    const oldY = piece.y;
    while (!isPieceValid(grid, piece)) piece.y--;
    
    connection.sendCustom({
        type: 'gameTetrablocks',
        data: {
            grid: renderGrid(grid, piece, true),
            incomingLines: isP1 ? (playState.lineSent < 0 ? -playState.lineSent : 0) : (playState.lineSent > 0 ? playState.lineSent : 0)
        }
    });
    otherConnection.sendCustom({
        type: 'gameTetrablocks',
        data: {
            otherGrid: renderGrid(grid, piece, false)
        }
    });
    (isP1 ? playState.p2 : playState.p1).sendCustom({
        type: 'gameTetrablocks',
        data: {
            grid: renderGrid(otherGrid, otherPiece, true),
            incomingLines: !isP1 ? (playState.lineSent < 0 ? -playState.lineSent : 0) : (playState.lineSent > 0 ? playState.lineSent : 0)
        }
    });

    piece.y = oldY;

    if (isAuto) {
        clearTimeout(isP1 ? playState.timeoutP1 : playState.timeoutP2);
        if (isP1) playState.timeoutP1 = setTimeout(() => play(playState, {command: "fastFall"}, playState.p1, true), playState.playDelay);
        else playState.timeoutP2 = setTimeout(() => play(playState, {command: "fastFall"}, playState.p2, true), playState.playDelay);
    }

    if (lost || !isPieceValid(grid, piece)) {
        playState.ended = true;
        connection.gameState += "_1";
        (playState.p1 === connection ? playState.p2 : playState.p1).gameState += "_1";
        connection.sendCustom({
            type: 'game',
            request: 'defeat',
        });
        (playState.p1 === connection ? playState.p2 : playState.p1).sendCustom({
            type: 'game',
            request: 'victory',
        });
    }
}

function removeLine(grid) {
    for (let i = 0; i < 20; i++) {
        let complete = true;
        for (let j = 0; j < 10; j++) {
            if (grid[i][j] === "") {
                complete = false;
            }
        }
        if (complete) {
            while (i > 0) {
                for (let j = 0; j < 10; j++) {
                    grid[i][j] = grid[i-1][j];
                }
                i--;
            }
            for (let j = 0; j < 10; j++) {
                grid[i][j] = "";
            }
            return true;
        }
    }
    return false;
}

function createPiece(piece) {
    piece.type = pieceNames[Math.floor(Math.random() * 7)];
    piece.x = 4;
    piece.y = 0;
    piece.r = 0;
    piece.shouldCreate = false;
}

function validatePiece(grid, piece) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (pieces[piece.type][piece.r][i][j]) {
                grid[i + piece.y][j + piece.x] = piece.type;
            }
        }
    }
    piece.shouldCreate = true;
}

function isPieceValid(grid, piece) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (pieces[piece.type][piece.r][i][j] && i + piece.y >= 0) {
                if (i + piece.y >= 20 || j + piece.x >= 10 || grid[i + piece.y][j + piece.x] !== "") return false
            }
        }
    }
    return true;
}

function renderGrid(gridP, piece, showProjection) {
    let grid = [];
    for (let i = 0; i < 20; i++) {
        let row = [];
        for (let j = 0; j < 10; j++) {
            row.push("");
        }
        grid.push(row);
    }

    if (showProjection && !piece.shouldCreate && isPieceValid(gridP, piece)) {
        const oldY = piece.y;
        while (isPieceValid(gridP, piece)) piece.y++;
        piece.y--;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (pieces[piece.type][piece.r][i][j]) {
                    if (i + piece.y < 20 && j + piece.x < 10 && i + piece.y >= 0 && j + piece.x >= 0) {
                        grid[i + piece.y][j + piece.x] = piece.type + "L";
                    }
                }
            }
        }

        piece.y = oldY;
    }

    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 10; j++) {
            if (gridP[i][j] !== "") {
                grid[i][j] = gridP[i][j]
            }
        }
    }
    
    if (!piece.shouldCreate) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (pieces[piece.type][piece.r][i][j]) {
                    if (i + piece.y < 20 && j + piece.x < 10 && i + piece.y >= 0 && j + piece.x >= 0) {
                        grid[i + piece.y][j + piece.x] = piece.type;
                    }
                }
            }
        }
    }

    return grid;
}

module.exports = {
  play
};
