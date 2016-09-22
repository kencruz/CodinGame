/**
 * Send your busters out into the fog to trap ghosts and bring them home!
 **/
var bustersPerPlayer = parseInt(readline()); // the amount of busters you control
var ghostCount = parseInt(readline()); // the amount of ghosts on the map
var myTeamId = parseInt(readline()); // if this is 0, your base is on the top left of the map, if it is one, on the bottom right
var enemyTeam;
var teamCoords = {};
if (myTeamId) {
    teamCoords.x = 16000;
    teamCoords.y = 9000;
    enemyTeam = 0;
} else {
    teamCoords.x = 0;
    teamCoords.y = 0;
    enemyTeam = 1;
}

var busterMove = [];
// game loop
while (true) {
    var entities = parseInt(readline()); // the number of busters and ghosts visible to you
    var busters = [];
    var ghosts = [];
    var enemy = [];
    for (var i = 0; i < entities; i++) {
        var inputs = readline().split(' ');
        var entityId = parseInt(inputs[0]); // buster id or ghost id
        var x = parseInt(inputs[1]);
        var y = parseInt(inputs[2]); // position of this buster / ghost
        var entityType = parseInt(inputs[3]); // the team id if it is a buster, -1 if it is a ghost.
        var state = parseInt(inputs[4]); // For busters: 0=idle, 1=carrying a ghost.
        var value = parseInt(inputs[5]); // For busters: Ghost id being carried. For ghosts: number of busters attempting to trap this ghost.
        //printErr(inputs);
        if (entityType === myTeamId) {
            busters.push({
                entityId: entityId,
                x: x,
                y: y,
                state: state,
                value: value
            });
            printErr('Buster ' + inputs);
        } else if (entityType === -1) {
            ghosts.push({
                ghostId: entityId,
                x: x,
                y: y,
                state: state,
                value: value
            });
            //printErr('Ghost ' + inputs);
        } else if (entityType === enemyTeam) {
            enemy.push({
                enemyId: entityId,
                x: x,
                y: y,
                state: state,
                value: value
            });
            printErr('Enemy ' + inputs);
        }
    }
    for (var i = 0; i < bustersPerPlayer; i++) {

        if (!busterMove[i]) {
            busterMove[i] = makePoint();
        }

        if (busterMove[i].cooldown > 0) {
            printErr('Buster ' + i + ' cooldown ' + busterMove[i].cooldown);
            busterMove[i].cooldown--;
        }

        if ((busters[i].x == busterMove[i].x) && (busters[i].y == busterMove[i].y)) {
            newPoint(i);
        }

        if (busters[i].state === 3) {
            continueBust(i);
        } else if (busters[i].state === 2) {
            move(i);
        } else if (busters[i].state === 1) {
            busterMove[i].x = teamCoords.x;
            busterMove[i].y = teamCoords.y;
            if (closeToBase(i)) {
                release(i);
            } else {
                if (closeToStun(i)) {
                    avoidEnemy();
                }
                move(i);
            }
        } else if (busters[i].state === 0) {
            if (detectEnemy()) {
                if (closeToStun(i) && canStun(i)) {
                    stun(i);
                } else {
                    if (detectGhost()) {
                        if (closeToGhost(i)) {
                            bustGhost(i);
                        } else {
                            move(i);
                        }
                    } else {
                        avoidEnemy();
                        move(i);
                    }
                }

            } else if (detectGhost()) {
                if (closeToGhost(i)) {
                    bustGhost(i);
                } else {
                    move(i);
                }
            } else {
                move(i);
            }
        }
    }
}



function distance(x1, y1, x2, y2) {
    var xdiff = Math.pow((x2 - x1), 2);
    var ydiff = Math.pow((y2 - y1), 2);
    return Math.sqrt(xdiff + ydiff);
}


function makePoint() {
    return {
        x: Math.floor(Math.random() * 16000),
        y: Math.floor(Math.random() * 9000),
        cooldown: 0
    };
}

function newPoint(i) {
    busterMove[i].x = Math.floor(Math.random() * 16000);
    busterMove[i].y = Math.floor(Math.random() * 9000);
}

function move(i) {
    print('MOVE ' + busterMove[i].x + ' ' + busterMove[i].y);
}

function makeCirclePoint(radius) {
    var x = Math.floor(Math.random() * radius);
    var y = Math.floor(Math.sqrt(Math.pow(radius, 2) - Math.pow(x, 2)));
    return [
        [x, y],
        [(x * (-1)), y],
        [x, (y * (-1))],
        [(x * (-1)), (y * (-1))]
    ];
}

function makePointOrigin(x, y, radius) {
    return makeCirclePoint(radius).map(function(item) {
        return [(item[0] + x), (item[1] + y)];
    });
}

function parseSafePoints(x, y, arr) {
    return arr.filter(function(item) {
        if (distance(x, y, item[0], item[1]) > 2200) {
            return item;
        }
    }).map(function(item) {
        if (item[0] < 0) {
            item[0] = 0;
        }
        if (item[0] > 16000) {
            item[0] = 16000;
        }
        if (item[1] < 0) {
            item[1] = 0;
        }
        if (item[1] > 9000) {
            item[1] = 9000;
        }
        return item;
    });
}

function findClosestEnemy(x, y, arr) {
    return arr.reduce(function(prev, curr) {
        if (distance(x, y, prev.x, prev.y) < distance(x, y, curr.x, curr.y)) {
            return prev;
        } else {
            return curr;
        }
    });
}

function avoidEnemy() {
    var closestEnemy = findClosestEnemy(busters[i].x, busters[i].y, enemy);
    if (distance(busters[i].x, busters[i].y, closestEnemy.x, closestEnemy.y) < 1760) {
        try {
            var possiblePoints = makePointOrigin(busters[i].x, busters[i].y, 800).concat(makePointOrigin(busters[i].x, busters[i].y, 800));
            var safePoints = parseSafePoints(closestEnemy.x, closestEnemy.y, possiblePoints);
            busterMove[i].x = safePoints[0][0];
            busterMove[i].y = safePoints[0][1];
            printErr('Dodge Attempt with ' + safePoints.length + ' safe points');
        } catch (e) {
            printErr('No safe points');
            //avoidEnemy();
        }
    }
}

function isStunned(i) {
    if (busters[i].state === 2) {
        return true;
    } else {
        return false;
    }
}

function haveGhost(i) {
    if (busters[i].state === 1) {
        return true;
    } else {
        return false;
    }
}

function closeToBase(i) {
    if (distance(busters[i].x, busters[i].y, teamCoords.x, teamCoords.y) < 1600) {
        return true;
    } else {
        return false;
    }
}

function release(i) {
    newPoint(i);
    print('RELEASE');
}

function detectGhost() {
    if (ghosts.length > 0) {
        return true;
    } else {
        return false;
    }
}

function closeToGhost(i) {
    var test = 0;
    for (var j = 0; j < ghosts.length; j++) {
        if (distance(busters[i].x, busters[i].y, ghosts[j].x, ghosts[j].y) < 1760 &&
            distance(busters[i].x, busters[i].y, ghosts[j].x, ghosts[j].y) > 900) {
            test = 1;
        }
        if (distance(busters[i].x, busters[i].y, ghosts[j].x, ghosts[j].y) < 2200 &&
            distance(busters[i].x, busters[i].y, ghosts[j].x, ghosts[j].y) > 900) {
            busterMove[i].x = ghosts[j].x;
            busterMove[i].y = ghosts[j].y;
        }
    }
    return test;
}

function bustGhost(i) {
    for (var j = 0; j < ghosts.length; j++) {
        if (distance(busters[i].x, busters[i].y, ghosts[j].x, ghosts[j].y) < 1760 &&
            distance(busters[i].x, busters[i].y, ghosts[j].x, ghosts[j].y) > 900) {
            print('BUST ' + ghosts[j].ghostId);
            break;
        }
    }
}

function continueBust(i) {
    print('BUST ' + busters[i].value);
}

function detectEnemy() {
    if (enemy.length > 0) {
        return true;
    } else {
        return false;
    }
}

function canStun(i) {
    if (busterMove[i].cooldown > 0) {
        return false;
    } else {
        return true;
    }
}

function closeToStun(i) {
    var test = false;
    for (var j = 0; j < enemy.length; j++) {
        if (distance(busters[i].x, busters[i].y, enemy[j].x, enemy[j].y) < 1760) {
            test = true;
        }
    }
    return test;
}

function stun(i) {
    var failCheck = 1;
    for (var j = 0; j < enemy.length; j++) {
        if ((distance(busters[i].x, busters[i].y, enemy[j].x, enemy[j].y) < 1760) && enemy[j].state !== 2) {
            printErr('Buster ' + i + ' can stun ' + enemy[j].enemyId);
            print('STUN ' + enemy[j].enemyId);
            busterMove[i].cooldown = 21;
            failCheck = 0;
            //newPoint();
            break;
        }
    }
    if (failCheck === 1) {
        move(i);
    }
}
