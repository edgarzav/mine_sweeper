'use strict';
function renderBoard() {
    var strHTML = ''
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = gBoard[i][j];
            var className = ''
            var content = ''

            if (cell.isMarked) {
                content = FLAG;
            }
            else if (cell.isShown) {
                if (cell.isMine) content = MINE;
                else if (cell.minesAroundCount === 0) {
                    content = ''
                } else content = cell.minesAroundCount

                // content = checkCellContent(i, j);
                className = ((i + j) % 2 === 0) ? ' darkeRevel' : ' revel'
            }
            strHTML += `<td class="cell cell${i}-${j}${className} ${((i + j) % 2 === 0) ? ' darker' : ''}" onmousedown="cellClicked(event,${i}, ${j})">${content}</td>`
        }
        strHTML += '</tr>'
    }
    document.querySelector('.boardGame').innerHTML = strHTML;
}


function renderBestScore(score) {
    document.querySelector('.bestScore').innerHTML = `Best Score: ${score}`
}

function renderGameStatus() {
    var strHTML = ` 
    <h2 class="status secsPassed"><i class="fas fa-stopwatch"></i></i> ${gGame.secsPassed}</h2>
    <h2 class="status shownCount">Revealed: ${gGame.shownCount}</h2>
    <h2 class="status markedCount"><i class="far fa-flag"></i> ${gGame.markedCount}</h2>`
    document.querySelector('.gameStatus').innerHTML = strHTML;
    setTimer();
}




