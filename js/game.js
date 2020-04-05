'use strict';

var gLevel = {
    SIZE: 8,
    MINES: 12
};

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};

var gHints = {
    isOn: false,
    countHints: 0
};

var gGameSteps = [];


var gBoard = [];
var gTimerInterval = 0;
var gLives = 3;
var gStartTime;
var gSafeClick = 3;
var gIsManualMode = false
var gManuMineCounter = 0

var MINE = '💣';
var FLAG = '🚩';
var NORMAL = '🙂';
var LOSE = '😭';
var WIN = '😎';


function init() {
    gBoard = buildBoard();
    renderBoard();
    renderGameStatus();
}


function buildBoard() {
    var board = [];

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            board[i][j] = cell
        }
    }
    return board;
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].minesAroundCount = getNegsIsMine(i, j).length
        }
    }
}

function getNegsIsMine(posI, posJ) {
    var cells = []
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (i === posI && j === posJ) continue;
            var cell = gBoard[i][j]
            if (cell.isMine) {
                var coor = {
                    posI: i,
                    posJ: j
                }
                cells.push(coor);
            }
        }
    }
    return cells;
}

function getNegsIsNotMine(posI, posJ) {
    var cells = []
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            var cell = gBoard[i][j]
            if (!cell.isMine) {
                var coor = {
                    posI: i,
                    posJ: j
                }
                cells.push(coor);
            }
        }
    }
    return cells;
}


function manualMode(elButton) {
    gIsManualMode = true;
    gGame.isOn = false
}


function cellClicked(elCell, posI, posJ) {
    var cell = gBoard[posI][posJ]

    if (gGame.isOn && !gHints.isOn) {

        if (gGame.shownCount === 0 && !gIsManualMode) {
            gStartTime = Date.now()
            gTimerInterval = setInterval(renderGameStatus, 100);
            createRandomMines(posI, posJ)
            setMinesNegsCount();
        } else {

            gTimerInterval = setInterval(renderGameStatus, 100);
            setMinesNegsCount();
        }

        if (elCell.which === 3 && !(cell.isShown)) {
            cellMarked(posI, posJ)
            renderBoard()
            var step = {
                posI: posI,
                posJ: posJ,
                button: 'right'
            }
            gGameSteps.push(step)
        }
        else if (gBoard[posI][posJ].isMine) {
            var step = {
                posI: posI,
                posJ: posJ,
                button: 'left'
            }
            gGameSteps.push(step)
            checkGameOver();

        } else {
            var step = {
                posI: posI,
                posJ: posJ,
                button: 'left'
            }
            gGameSteps.push(step)
            expandShown(gBoard, elCell, posI, posJ)
            renderBoard()

        }
        if (((gLevel.SIZE ** 2) - gLevel.MINES === gGame.shownCount) &&
            (gGame.markedCount === gLevel.MINES)) {
            checkGameOver()
        }

    } else if (gHints.isOn) revealHint(posI, posJ)
    else {
        gBoard[posI][posJ].isMine = true
        gManuMineCounter++;

        if (gManuMineCounter >= gLevel.MINES) {
            gGame.isOn = true
            gStartTime = Date.now()
        }
    }
}


function checkGameOver() {
    var isWin = false
    if (gGame.markedCount === gLevel.MINES) {

        for (var i = 0; i < gLevel.SIZE; i++) {
            for (var j = 0; j < gLevel.SIZE; j++) {
                var cell = gBoard[i][j];

                if (cell.isMarked && !cell.isShown && cell.isMine) isWin = true

                if (cell.shownCount === ((gLevel.SIZE * 2) - gLevel.MINES)) isWin = true
            }
        }
    }
    isWin ? playerWin() : playerLose();
}

function playerWin() {
    document.querySelector('.isWin').innerHTML = WIN;
    setBestScore();
    clearInterval(gTimerInterval)
}

function playerLose() {
    revelAllMines()
    document.querySelector('.isWin').innerHTML = LOSE;
    gLives--;
    renderGameStatus()
    clearInterval(gTimerInterval)
    if (!gLives) {
        document.querySelector('.livesLeft').innerHTML = 'GAME OVER';
        gGame.isOn = false;

    }
}

function revelAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) cell.isShown = true
        }
    }
    renderBoard()
}

function createRandomMines(posI, posJ) {
    var clickeNegs = getNegsIsNotMine(posI, posJ)
    var isExists = false;

    for (var i = 0; i < gLevel.MINES; i++) {
        var coor = getRandomPos();
        for (var j = 0; j < clickeNegs.length; j++) {
            if (coor.posI === clickeNegs[j].posI && coor.posJ === clickeNegs[j].posJ || gBoard[coor.posI][coor.posJ].isMine) {
                isExists = true
                break
            }
        }
        if (!isExists) {
            gBoard[coor.posI][coor.posJ].isMine = true
        } else {
            isExists = false;
            i--;
        }
    }
}


function cellMarked(cellI, cellJ) {
    var cell = gBoard[cellI][cellJ];

    if (!cell.isMarked) {
        cell.isMarked = true;
        gGame.markedCount++
    } else {
        cell.isMarked = false;
        gGame.markedCount--
    }
}

function expandShown(board, elCell, i, j) {

    if (board[i][j].minesAroundCount === 0 && board[i][j].isMine === false) {
        var negsIsNotMine = getNegsIsNotMine(i, j)
        for (var i = 0; i < negsIsNotMine.length; i++) {
            var posI = negsIsNotMine[i].posI;
            var posJ = negsIsNotMine[i].posJ;
            if (board[posI][posJ].minesAroundCount === 0 && board[posI][posJ].isShown === false) {
                board[posI][posJ].isShown = true

                expandShown(board, elCell, posI, posJ)
            }
            board[posI][posJ].isShown = true
        }
    } else {
        board[i][j].isShown = true;
    }
    gGame.shownCount = countShownCells()
}

function countShownCells() {
    var counter = 0
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isShown)
                counter++;
        }
    }
    return counter
}


function getHint(elHint) {

    if (gHints.isOn) {
        elHint.innerHTML = 'Hint Off'
        gHints.isOn = false;
        return
    }
    if (gHints.countHints < 3) {
        gHints.isOn = true;
        elHint.innerHTML = 'Hint On'
    }
}

function revealHint(posI, posJ) {
    var coor = getNegsIsShown(posI, posJ)
    for (let i = 0; i < coor.length; i++) {
        var cell = gBoard[coor[i].posI][coor[i].posJ];
        cell.isShown = true
    }
    renderBoard();
    for (let i = 0; i < coor.length; i++) {
        var cell = gBoard[coor[i].posI][coor[i].posJ];
        cell.isShown = false
    }
    setTimeout(renderBoard, 1000)
    gHints.countHints++;
    document.querySelector('.hintButton').innerHTML = 'Hint Off'
    gHints.isOn = false;
}



function getNegsIsShown(posI, posJ) {
    var cells = []
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            var cell = gBoard[i][j]
            if (!cell.isShown) {
                var coor = {
                    posI: i,
                    posJ: j
                }
                cells.push(coor);
            }
        }
    }
    return cells;
}


function onLevelSelect() {
     var selectedLevel = document.querySelector('.level-select').value;
    switch (selectedLevel) {
        case 'Expert':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            var bestScore = localStorage.getItem('bestExpertScore')
            if (bestScore === null)
                bestScore = 0;
            renderBestScore(bestScore)
            break;
        case 'Medium':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            var bestScore = localStorage.getItem('bestMediumScore')
            if (bestScore === null)
                bestScore = 0;
            renderBestScore(bestScore)
            break;
        case 'Beginner':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            var bestScore = localStorage.getItem('bestBeginnerScore')
            if (bestScore === null)
                bestScore = 0;
            renderBestScore(bestScore)
            break;
        default:
            break;
    }
    resetGame()
}

function safeClick() {
    var isAvaiable = false;
    if (gSafeClick) {
        while (!isAvaiable) {
            var coor = getRandomPos();
            var cell = gBoard[coor.posI][coor.posJ]
            if (!cell.isMine && !cell.isShown) {
                var elSafe = document.querySelector(`.cell${coor.posI}-${coor.posJ}`)
                elSafe.classList.add('safeClass');
                setTimeout(function () { elSafe.classList.remove('safeClass') }, 3000)
                gSafeClick--;
                document.querySelector('.safeAviable').innerHTML = `${gSafeClick} clicks available`
                isAvaiable = true
            }
        }
    }
}


function setBestScore() {

    switch (gLevel.SIZE) {
        case 4:
            var score = getBestScore('bestBeginnerScore')
            break;
        case 8:
            var score = getBestScore('bestMediumScore')
            break;
        case 12:
            var score = getBestScore('bestExpertScore')
            break;

        default:
            break;
    }
    renderBestScore(score);
}


function getBestScore(level) {
    var score = localStorage.getItem(level)
    if (gGame.secsPassed < score || score === null) {
        localStorage.setItem(level, gGame.secsPassed);
        score = gGame.secsPassed
    }
    return score;
}


function resetGame() {
    if (!gGame.isOn) gLives = 3;
    clearInterval(gTimerInterval)
    gTimerInterval = 0;
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gIsManualMode = false
    gManuMineCounter = 0
    gSafeClick = 3;
    gHints.countHints = 0
    document.querySelector('.isWin').innerHTML = NORMAL;
    gStartTime = Date.now();
    init();
}


function undo() {
    var posI = gGameSteps[gGameSteps.length - 1].posI
    var posJ = gGameSteps[gGameSteps.length - 1].posJ
    var button = gGameSteps[gGameSteps.length - 1].button
    if (button === 'right') {
        cellMarked(posI, posJ)

        renderBoard()
    } else {
        if (gBoard[posI][posJ].isMine === true) {
            ++gLives;
            gGame.isOn = true
            renderGameStatus()
            document.querySelector('.isWin').innerHTML = NORMAL;
            unRevelAllMines()
        }
        unShown(gBoard, posI, posJ)
        renderBoard()
        if (gGame.shownCount === 0) resetGame()
    }
    gGameSteps.splice(gGameSteps.length - 1, 1)
}



function unRevelAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) cell.isShown = false
        }
    }
    renderBoard()
}


function unShown(board, i, j) {

    if (board[i][j].minesAroundCount === 0 && board[i][j].isMine === false) {
        var negsIsNotMine = getNegsIsNotMine(i, j)
        for (var i = 0; i < negsIsNotMine.length; i++) {
            var posI = negsIsNotMine[i].posI;
            var posJ = negsIsNotMine[i].posJ;
            if (board[posI][posJ].minesAroundCount === 0 && board[posI][posJ].isShown === true) {
                board[posI][posJ].isShown = false

                unShown(board, posI, posJ)
            }
            board[posI][posJ].isShown = false
        }
    } else {
        board[i][j].isShown = false;
    }
    gGame.shownCount = countShownCells()
}


