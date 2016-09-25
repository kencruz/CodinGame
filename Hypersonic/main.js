/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs = readline().split(' ');
var width = parseInt(inputs[0]);
var height = parseInt(inputs[1]);
var myId = parseInt(inputs[2]);

var moveGoal = 0;
var bestTile;

var moveX = 5;
var moveY = 5;

// game loop
while (true) {
    var map = [];
    var myPlayer = {};
    for (var i = 0; i < height; i++) {
        var row = readline();
        for (var j = 0; j < row.length; j++) {
            map.push({x: j, y: i, type: row[j]});
        }
    }
    printErr('# of Optimal spots: ' + adjBoxTiles(map).length);
    var entities = parseInt(readline());
    for (var i = 0; i < entities; i++) {
        var inputs = readline().split(' ');
        var entityType = parseInt(inputs[0]);
        var owner = parseInt(inputs[1]);
        var x = parseInt(inputs[2]);
        var y = parseInt(inputs[3]);
        var param1 = parseInt(inputs[4]);
        var param2 = parseInt(inputs[5]);
        
        if (entityType === 0 && owner === myId) {
            if (!moveGoal) {
                moveGoal = closestSpot(x, y, adjBoxTiles(map));
                //printErr(closestSpot(x, y, map));
                //printErr(moveGoal.x + ' ' + moveGoal.y);
            }
            
            if ((Number(x) == moveGoal.x) && (Number(y) == moveGoal.y)) {
                printErr('Destination reached');
                print('BOMB ' + moveGoal.x + ' ' + moveGoal.y);
                if (adjBoxTiles(map).length) {
                    moveGoal = closestSpot(x, y, adjBoxTiles(map));
                } else {
                    moveGoal = closestSpot(x, y, safeAdjBoxTiles(map));
                }
                
                
                printErr('Next coords : ' + moveGoal.x + ' ' + moveGoal.y);
        
            } else {
                print('MOVE ' + moveGoal.x + ' ' + moveGoal.y);
            }       
            //print('MOVE 5 5');
        }
    }

    // Write an action using print()
    // To debug: printErr('Debug messages...');
    
 
    
    
    
    
    
    
    
    /*
    if ((Number(x) == moveGoal.x) && (Number(y) == moveGoal.y)) {
        printErr('Destination reached');
        moveGoal = closestSpot(x, y, adjBoxTiles(map));
        print('BOMB ' + moveGoal.x + ' ' + moveGoal.y);
        
    } else {
        print('BOMB ' + moveGoal.x + ' ' + moveGoal.y);
    }
    */
    
    
}

function distance(x1, y1, x2, y2) {
    var xdiff = Math.pow((x2 - x1), 2);
    var ydiff = Math.pow((y2 - y1), 2);
    return Math.sqrt(xdiff + ydiff);
}

function bombCount(arr) {
    var count = 0;
    arr.map(function(item) {
        if (item.type === '0') {
            count++;
        }
    });
    return count;
}

function filterType(arr, str) {
    return arr.filter (function(item) {
        if (item.type === str) {
            return item;
        }
    });
}

function findAdjacent(x, y) {
    return [[(x - 1), y],
            [(x + 1),y],
            [(x - 2), y],
            [(x + 2), y],
            [x, (y - 1)],
            [x, (y + 1)],
            [x, (y - 2)],
            [x, (y + 2)]]
                .filter(function(item) {
                    if ((item[0] > -1 && item[0] < 13) && (item[1] > -1 && item[1] < 11)) {
                        return item}
        });
}

function numAdjBoxes(x, y, arr) {
    var adjacentTiles = findAdjacent(x, y);
    var boxTiles = filterType(arr, '0');
    var count = 0;
    for (var i = 0; i < boxTiles.length; i++) {
        for (var j = 0; j < adjacentTiles.length; j++) {
            if (boxTiles[i].x === adjacentTiles[j][0] 
            && boxTiles[i].y === adjacentTiles[j][1]) {
                count++;
            }
        }
    }
    return count;
}

function adjBoxTiles(arr) { 
        return arr.filter(function(item) {
            if (numAdjBoxes(item.x, item.y, arr) > 1) {
                if (item.type === '.') {
                    return item;
                }
            }
        });
}

function safeAdjBoxTiles(arr) { 
        return arr.filter(function(item) {
            if (numAdjBoxes(item.x, item.y, arr) === 1) {
                if (item.type === '.') {
                    return item;
                }
            }
        });
}

/*
function closestSpot(x, y, arr) {
    var closest = arr.reduce(function(a, b) {
        if ((distance(x, y, a.x, a.y) !== 0) && (distance(x, y, a.x, a.y) <= distance(x, y, b.x, b.y))) {
            return a;
        } else {
            return b;
        }
    });
    return closest[0];
}
*/

function closestSpot(x, y, arr) {
   return arr.filter(function(item){
      if (distance(x,y,item.x,item.y) !== 0) {
        return item;}})
    .reduce(function(a, b) {
        if (distance(x, y, a.x, a.y) <= distance(x, y, b.x, b.y)) {
            return a;
        } else {
            return b;
        }
    });
}
