'use strict';

function getRandomPos() {
    var coor = {
        posI: Math.floor(Math.random() * (gLevel.SIZE )),
        posJ: Math.floor(Math.random() * (gLevel.SIZE ))
    }
    return coor
}

function setTimer() {
    var elapsedTime = Date.now() - gStartTime;
    gGame.secsPassed = (elapsedTime / 1000).toFixed(1);
}