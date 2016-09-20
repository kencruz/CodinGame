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
        if (entityType == myTeamId) {
            busters.push({
                entityId: entityId,
                x: x,
                y: y,
                state: state,
                value: value
            });
            printErr('Buster ' + inputs);
        } else if (entityType == -1) {
            ghosts.push({
                ghostId: entityId,
                x: x,
                y: y,
                state: state,
                value: value
            });
            //printErr('Ghost ' + inputs);
        } else if (state == enemyTeam) {
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
            busterMove[i].cooldown--;
        }

        if (busters[i].x == busterMove[i].x && busters[i].y == busterMove[i].y) {
            newPoint();
        }

        if (isStunned()) {
            move(i);
        } else {
            if (haveGhost()) {
                if (closeToBase()) {
                    release();
                } else {
                    if (detectEnemy()) {
                        if (closeToStun) {
                            avoidEnemy();
                        }
                    }
                    move(i);
                }

            } else {
                if (detectGhost()) {
                    if (closeToGhost()) {
                        bustGhost();
                        //break;
                    } else {
                        move(i);
                    }

                } else {
                    if (detectEnemy()) {
                        if (closeToStun()) {
                            if (canStun()) {
                                stun();
                            } else {
                                avoidEnemy();
                                //move(i);
                            }
                        }
                    }
                    move(i);
                }
            }
        }
        
        printErr('Buster ' + busters[i].entityId + ' move to ' + busterMove[i].x + ' ' + busterMove[i].y);
    }
    //printErr('number of ghosts nearby: ' + ghosts.length);


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

function newPoint() {
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
    if (busters[i].value == -1) {
        if (enemy.length) {
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
    }

}

function isStunned() {
    if (busters[i].state == 2) {
        return true;
    } else {
        return false;
    }
}

function haveGhost() {
    if (busters[i].state == 1) {
        return true;
    } else {
        return false;
    }
}

function closeToBase() {
    if (distance(busters[i].x, busters[i].y, teamCoords.x, teamCoords.y) < 1600) {
        return true;
    } else {
        return false;
    }
}

function release() {
    newPoint();
    print('RELEASE');
}

function detectGhost() {
    if (ghosts.length > 0) {
        return true;
    } else {
        return false;
    }
}

function closeToGhost() {
    var test = 0;
    for (var j = 0; j < ghosts.length; j++) {
        if (distance(busters[i].x, busters[i].y, ghosts[j].x, ghosts[j].y) < 1760 &&
            distance(busters[i].x, busters[i].y, ghosts[j].x, ghosts[j].y) > 900) {
            test = 1;
        }
    }
    return test;
}

function bustGhost() {
    for (var j = 0; j < ghosts.length; j++) {
        if (distance(busters[i].x, busters[i].y, ghosts[j].x, ghosts[j].y) < 1760 &&
            distance(busters[i].x, busters[i].y, ghosts[j].x, ghosts[j].y) > 900) {
            print('BUST ' + ghosts[j].ghostId);
            busterMove[i].x = teamCoords.x;
            busterMove[i].y = teamCoords.y;
            break;
        }
    }
}

function detectEnemy() {
    if (enemy.length > 0) {
        return true;
    } else {
        return false;
    }
}

function canStun() {
    if (busters[i].cooldown > 0) {
        return false;
    } else {
        return true;
    }
}

function closeToStun() {
    var test = 0;
    for (var j = 0; j < enemy.length; j++) {
        if (distance(busters[i].x, busters[i].y, enemy[j].x, enemy[j].y) < 1760) {
            test = 1;
        }
    }
    return test;
}

function stun() {
    for (var j = 0; j < enemy.length; j++) {
        if (distance(busters[i].x, busters[i].y, enemy[j].x, enemy[j].y) < 1760) {
            printErr('Buster can stun');
            print('STUN ' + enemy[j].enemyId);
            busterMove[i].cooldown = 20;
            newPoint();
            break;
        }
    }
}
