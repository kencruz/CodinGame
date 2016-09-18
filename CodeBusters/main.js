/**
 * Send your busters out into the fog to trap ghosts and bring them home!
 **/
var bustersPerPlayer = parseInt(readline()); // the amount of busters you control
var ghostCount = parseInt(readline()); // the amount of ghosts on the map
var myTeamId = parseInt(readline()); // if this is 0, your base is on the top left of the map, if it is one, on the bottom right
var teamCoords = {};
if (myTeamId) {
    teamCoords.x = 16000;
    teamCoords.y = 9000;
} else {
    teamCoords.x = 0;
    teamCoords.y = 0;
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
                x: x,
                y: y,
                state: state,
                value: value
            });
            printErr(inputs);
        } else if (entityType == -1) {
            ghosts.push({
                ghostId: entityId,
                x: x,
                y: y,
                state: state,
                value: value
            });
            printErr(inputs);
        } else {
            enemy.push({
                enemyId: entityId,
                x: x,
                y: y,
                state: state,
                value: value
            });
        }
    }
    for (var i = 0; i < bustersPerPlayer; i++) {

        if (!busterMove[i] || (busters[i].x == busterMove[i].x && busters[i].y == busterMove[i].y)) {
            busterMove[i] = makePoint();
        }

        if (busters[i].state == 1) {
            if (distance(busters[i].x, busters[i].y, teamCoords.x, teamCoords.y) < 1600) {
                busterMove[i] = makePoint();
                print('RELEASE');
            } else {
                move(i);
            }
        } else {
            if (ghosts.length > 0) {
                var canBust = 0;
                for (var j = 0; j < ghosts.length; j++) {
                    if (distance(busters[i].x, busters[i].y, ghosts[j].x, ghosts[j].y) < 1760 &&
                        distance(busters[i].x, busters[i].y, ghosts[j].x, ghosts[j].y) > 900) {
                        printErr('Buster can bust');
                        canBust = 1;
                        busterMove[i] = {
                            x: teamCoords.x,
                            y: teamCoords.y
                        };
                        print('BUST ' + ghosts[j].ghostId);
                        break;
                    }
                }
                if (canBust === 0) {
                    move(i);
                }
            } else {
                move(i);
            }
        }
    }
    printErr('number of ghosts nearby: ' + ghosts.length);
}

function distance(x1, y1, x2, y2) {
    var xdiff = Math.pow((x2 - x1), 2);
    var ydiff = Math.pow((y2 - y1), 2);
    return Math.sqrt(xdiff + ydiff);
}


function makePoint() {
    return {
        x: Math.floor(Math.random() * 16000),
        y: Math.floor(Math.random() * 9000)
    };
}

function move(i) {
    print('MOVE ' + busterMove[i].x + ' ' + busterMove[i].y);
}
