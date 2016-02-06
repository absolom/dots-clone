// Redefine modulo to work for neg numbers
Number.prototype.mod = function (x) {
    return ((this % x) + x) % x;
}

// Globals which need to be pushed into objects
var dotRadius = 13;
var dotSpacing = 18;
var gridScale = 2*dotRadius + dotSpacing;
var dotOffset = dotRadius + dotSpacing;
var mouseDown = false;

var canvas = document.getElementById("cnv");
var ctx = canvas.getContext("2d");

var canvasPos = {
    x: canvas.offsetLeft - canvas.scrollLeft + canvas.clientLeft,
    y: canvas.offsetTop - canvas.scrollTop + canvas.clientTop
}

// Utility functions
var gridToCoord = function (gridInd) {
    return gridScale * gridInd + dotOffset;
}

var coordToGrid = function (coord) {
    return Math.round((coord - dotOffset) / gridScale);
}

var getGridPosFromEvent = function(e) {
    var mouse = {
        x: e.pageX - canvasPos.x,
        y: e.pageY - canvasPos.y
    };

    var gridPos = {
        x: coordToGrid(mouse.x),
        y: coordToGrid(mouse.y)
    };

    return gridPos;
};

// Rendering Code

var drawDot = function (gridX, gridY, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(gridToCoord(gridX), gridToCoord(gridY), dotRadius, 0, 2*Math.PI);
    ctx.fill();
};

var renderDragList = function(dragList) {
    list = dragList.list;
    if (list.length < 2) {
        return;
    }

    coords = [];

    for (var i = 0; i < list.length; i++) {
        var coord = {
            x: gridToCoord(list[i].x),
            y: gridToCoord(list[i].y)
        }
        coords.push(coord);
    }

    ctx.moveTo(coords[0].x, coords[0].y);
    for (var i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i].x, coords[i].y);
    }
    ctx.stroke();
};

var renderGrid = function(context, grid) {
    for (var y = 0; y < grid.rows.length; y++) {
        for (var x = 0; x < grid.rows[y].length; x++) {
            if (grid.rows[y][x].isbomb) {
                drawDot(x, y, "#808080");
            }
            else if (grid.rows[y][x].destroyed) {
                drawDot(x, y, "#000000");
            }
            else {
                drawDot(x, y, grid.rows[y][x].color);
            }
        }
    }
};

var render = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderDragList(curDragList);
    renderGrid(ctx, curDotsGrid);
};

// Dot grid object

var curDotsGrid = {
    colors: {
        magenta: "#FF00FF",
        cyan: "#00FFFF",
        blue: "#0000FF",
        green: "#00FF00",
        yellow: "#FFFF00",
        red: "#FF0000",
        getRandomColor: function () {
                var array = ["magenta", "cyan", "blue", "green", "yellow", "red"];
                var indx = Math.round(Math.random() * (array.length-1));
                return this[array[indx]];
            }
        },
    width: 10,
    height: 13,
    rows: [],
    areAllSameColor: function (listPos) {
        // Check that they are all the same color
        for (var i = 0; i < listPos.length-1; i++) {
            col1 = this.getColor(listPos[i].x, listPos[i].y);
            col2 = this.getColor(listPos[i+1].x, listPos[i+1].y)
            if (col1 != col2) {
                return false;
            }
        }
        return true;
    },
    markDestroyed: function (listPos) {
        // Remove all the dots from the line
        for (var i = 0; i < listPos.length; i++) {
            pos = listPos[i];
            this.rows[pos.y][pos.x].destroyed = true;
        }
    },
    exploadBombs: function () {
        // Blow up bomb dots and their surroundings.
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.rows[y][x].isbomb) {
                    this.rows[y][x].isbomb = false;
                    this.rows[y][x].destroyed = true;

                    // blow up adjacent
                    for (var i = -1; i <= 1; i++) {
                        for (var j = -1; j <= 1; j++) {
                            // Check if the adjacent coord is off the map
                            if (x + i < 0 ||
                                x + i >= this.width) {
                                continue;
                            }
                            if (y + j < 0 ||
                                y + j >= this.height) {
                                continue;
                            }

                            if (!this.rows[y+j][x+i].isbomb) {
                                this.rows[y+j][x+i].destroyed = true;
                            }
                        }
                    }
                }
            }
        }
    },
    markBombs: function(listPos) {
        for (var i = 0; i < listPos.length; i++) {
            this.markBomb(listPos[i].x, listPos[i].y);
        }
    },
    init: function() {
        for (var y = 0; y < this.height; y++) {
            var row = [];
            for (var x = 0; x < this.width; x++) {
                // row.push({active: true, color: this.getRandomColor()});
                row.push({destroyed: false, isbomb: false, active: true, color: this.colors.getRandomColor()});
            }
            this.rows.push(row);
        }
    },
    getColor: function(x, y) {
        return this.rows[y][x].color;
    },
    addDot: function(x, y, unallowedColors) {
        var that = this;

        this.rows[y][x].destroyed = false;
        this.rows[y][x].active = true;
        this.rows[y][x].isbomb = false;
        this.rows[y][x].color = this.colors.getRandomColor();

        var isUnallowed = function () {
            for (var i = 0; i < unallowedColors.length; i++) {
                if (unallowedColors[i] == that.rows[y][x].color) {
                    return true;
                }
            }
            return false;
        }

        while (isUnallowed()) {
            this.rows[y][x].color = this.colors.getRandomColor();
        }

    },
    removeDot: function(x, y) {
        for (var i = y; i > 0; i--) {
            this.rows[i][x].destroyed = this.rows[i-1][x].destroyed;
            this.rows[i][x].color = this.rows[i-1][x].color;
            this.rows[i][x].active = this.rows[i-1][x].active;
            this.rows[i][x].isbomb = this.rows[i-1][x].isbomb;
        }
        this.rows[0][x].active = false;
    },
    markDot: function (x, y) {
        this.rows[y][x].destroyed = true;
    },
    markAllWithColor: function (col) {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.rows[y][x].color == col) {
                    if (this.rows[y][x].isbomb == false) {
                        this.markDot(x, y);
                    }
                }
            }
        }
    },
    markBomb: function (x, y) {
        this.rows[y][x].isbomb = true;
        this.rows[y][x].active = true;
        this.rows[y][x].destroyed = false;
    },
    populateInactive: function(unallowedColors) {
        // Initialize new dots
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (!this.rows[y][x].active) {
                    this.addDot(x, y, unallowedColors);
                }
            }
        }

    },
    removeDestroyed: function () {
        // Remove inactive
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.rows[y][x].destroyed) {
                    this.removeDot(x, y);
                }
            }
        }
    }
};

// Drag list object

var curDragList = {
    list: [],
    dragListClosed: false,
    isValid: function (grid) {
        if (list.length < 2) {
            return false;
        }

        if (!grid.areAllSameColor(list)) {
            return false;
        }

        return true;
    },
    reset: function () {
        this.dragListClosed = false;
        this.list = [];
    },
    getEnclosedPos: function (width, height) {
        // if (dragList.dragListClosed) {
        // grid.setColorClear(listPos[0].x, listPos[0].y);
        // Check if there are dots enclosed to turn into bombs
        var enclosed = findEnclosed(this.list, width, height);
        return enclosed;
    },
    addGridPosToDragList: function (gridPos) {
        // No negative values
        if (gridPos.x < 0 || gridPos.y < 0) {
            return;
        }

        // No values bigger than the grid
        if (gridPos.x >= curDotsGrid.width || gridPos.y >= curDotsGrid.height) {
            return;
        }

        // If adding the same element as the last element, do nothing
        if (this.list.length > 0) {
            curPos = this.list[this.list.length-1];
            if (curPos.x == gridPos.x && curPos.y == gridPos.y) {
                return;
            }
        }

        // If adding the previous element, remove the last element instead
        if (this.list.length > 1) {
            var lastPos = this.list[this.list.length-2];
            if (lastPos.x == gridPos.x && lastPos.y == gridPos.y) {
                this.dragListClosed = false;
                this.list.pop();
                return;
            }
        }

        // If trying to add a new pos that is farther than one step from the old, skip it
        if (this.list.length > 0) {
            curPos = this.list[this.list.length-1];
            var diffX = Math.abs(curPos.x - gridPos.x);
            var diffY = Math.abs(curPos.y - gridPos.y);

            if (diffX > 1 || diffY > 1 || (diffX == 1 && diffY == 1)) {
                return;
            }
        }

        // If adding a pos already in the this.list, close the list until it is removed
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].x == gridPos.x && this.list[i].y == gridPos.y) {
                this.dragListClosed = true;
                this.list.push(gridPos);
                return;
            }
        }

        // Add element to the end of the this.list
        if (!this.dragListClosed) {
            this.list.push(gridPos);
        }
    }
};

var stripTail = function (listPos) {
    var start = listPos[0];
    var ret = [start];

    for (var i = 1; i < listPos.length; i++) {
        ret.push({x: listPos[i].x, y: listPos[i].y});
        if (listPos[i].x == start.x &&
            listPos[i].y == start.y) {
            return ret;
        }
    }

    var end = listPos[listPos.length-1];
    ret = [end];
    for (var i = listPos.length-2; i >= 0; i--) {
        ret.push({x: listPos[i].x, y: listPos[i].y});
        if (listPos[i].x == end.x &&
            listPos[i].y == end.y) {
            return ret;
        }
    }

    return ret;
};

var findDistAlongParameterizedLoop = function (ind1, ind2, loop) {
    var d1 = Math.abs(ind1 - ind2);
    var d2 = (ind1 - ind2).mod(loop.length);

    return Math.min(d1, d2);
}

// Finds the vertices on any edge which crosses over
// the horizontal line starting at (startx,y) and going
// in positive x direction
var findEdges = function (startx, y, width, vertices) {
    var edges = [];
    var edge = [];

    // look for a vertex on the same y with x > startx
    // starting with that vertex, search -x and +x until the whole edge is enumerated
    for (var x = startx; x <= width;) {
        for (var i = 0; i < vertices.length; i++) {
            var v = vertices[i];
            if (v.x == x && v.y == y) {
                edge = [i];
                break;
            }
        }

        if (edge.length != 0) {
            while (x < width) {
                x += 1;

                var edgeGrew = false;
                for (var i = 0; i < vertices.length; i++) {
                    v = vertices[i];
                    if (v.x == x && v.y == y &&
                        findDistAlongParameterizedLoop(i, edge[edge.length-1], vertices) == 1) {
                        edge.push(i);
                        edgeGrew = true;
                        break;
                    }
                }
                if (!edgeGrew) {
                    edges.push(edge);
                    edge = [];
                    x -= 1;
                    break;
                }
            }
        }

        x += 1;
    }

    return edges;
}

var isIntersection = function (edge, list) {
    var ind = (edge[0]-1).mod(list.length);
    var isOnEdge = false;
    for (var i = 0; i < edge.length; i++) {
        if (edge[i] == ind) {
            isOnEdge = true;
            break;
        }
    }

    var posA, posB;
    if (isOnEdge) {
        posA = list[(edge[0]+1).mod(list.length)];
        posB = list[(edge[edge.length-1]-1).mod(list.length)];
    }
    else {
        posA = list[(edge[0]-1).mod(list.length)];
        posB = list[(edge[edge.length-1]+1).mod(list.length)];
    }

    return posA.y != posB.y;
}

var findEnclosed = function (listPos, width, height) {
    var enclosed = [];

    listPos = stripTail(listPos);
    list = listPos.slice(1);

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var inList = false;
            for (var i = 0; i < list.length; i++) {
                var v = list[i];
                if (v.x == x && v.y == y) {
                    inList = true;
                }
            }
            if (inList) {
                continue;
            }

            var edges = findEdges(x, y, width, list);
            // check if edge is intersection or tangent
            var crossed = 0;
            for (var k = 0; k < edges.length; k++) {
                if (isIntersection(edges[k], list)) {
                    crossed += 1;
                }
                // posA = list[(edges[k][0]-1).mod(list.length)];
                // posB = list[(edges[k][edges[k].length-1]+1).mod(list.length)];
                // if (posA.y != posB.y) {
                //     // We have an intersections
                //     crossed += 1;
                // }
            }

            if (crossed % 2 == 1) {
                enclosed.push({x: x, y: y});
            }
        }
    }
    return enclosed;
};

// Input Listeners

canvas.addEventListener('mousedown', function(e) {
    curDragList.reset();
    mouseDown = true;
});

canvas.addEventListener('mouseup', function(e) {
    if (gameState.advance(curDragList, curDotsGrid) == 0) {
        curDragList.reset();
    }
    render();

    var intrvl = setInterval(function () {
        var newState = gameState.advance(curDragList, curDotsGrid);
        if (newState == 2) {
            curDragList.reset();
        }
        else if (newState == 0) {
            clearInterval(intrvl);
        }
        render();
    }, 300);
    mouseDown = false;
});

canvas.addEventListener('mouseout', function(e) {
    mouseDown = false;
    curDragList.reset();
    render();
});

canvas.addEventListener('mousemove', function(e) {
    if (mouseDown) {
        gridPos = getGridPosFromEvent(e);
        curDragList.addGridPosToDragList(gridPos);
    }

    render();
});

var gameState = {
    state: 0,
    colorClear: false,
    colorClearCol: "#000000",
    advance: function (list, grid) {
        switch (this.state) {
            case 0:
                // In this state we are waiting for user to finish a drag list
                if (list.isValid(grid)) {
                    this.state = 1;
                }
                break;
            case 1:
                // This state we are marking the dots on the dragline
                // and changing state of other affected dots
                // We will also detect a closed polygon creating a colorclear
                // and mark all dots of that color inactive
                grid.markDestroyed(list.list);
                if (list.dragListClosed) {
                    this.colorClearCol = grid.getColor(list.list[0].x, list.list[0].y);
                    this.colorClear = true;
                    grid.markAllWithColor(this.colorClearCol);

                    var enclosedPos = list.getEnclosedPos(grid.width, grid.height);
                    grid.markBombs(enclosedPos);
                }
                else {
                    this.colorClear = false;
                }

                this.state = 2;
                break;
            case 2:
                // In this state we remove and replace inactive dots
                grid.removeDestroyed();
                grid.populateInactive([this.colorClearCol]);
                this.state = 3;
                break;
            case 3:
                // In this state we are exploading bombs, marking them inactive,
                // and changing the state of adjacent dots
                grid.exploadBombs();
                this.state = 4;
                break;
            case 4:
                // In this state we are removing and replacing inactive dots
                grid.removeDestroyed();
                grid.populateInactive([this.colorClearCol]);
                this.state = 0;
                break;
        }

        return this.state;
    },
};

curDotsGrid.init();
render();

//////// Unit tests

var makeLine = function(x, y, dirs) {
    var ret = [{x: x, y: y}];
    for (var i = 0; i < dirs.length; i++) {
        switch(dirs[i]) {
            case 'U':
                y -= 1;
                break;
            case 'D':
                y += 1;
                break;
            case 'L':
                x -= 1;
                break;
            case 'R':
                x += 1;
                break;
            default:
                continue;
        }
        ret.push({x: x, y: y});
    }
    return ret;
}

var found = findEnclosed(makeLine(0, 0, "RDLU"), 10, 10);

if (found.length != 0) {
    alert('failed 1');
}

var found = findEnclosed(makeLine(0, 0, "RRDDLLUU"), 10, 10);

if (found.length != 1 ||
    (found[0].x != 1 || found[0].y != 1)) {
    alert('failed 2');
}

var stripped = stripTail([
        {x: 2, y: 2},
        {x: 1, y: 2},
        {x: 0, y: 2},
        {x: 0, y: 1},
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 2, y: 1},
        {x: 2, y: 2},
        {x: 3, y: 2},
        {x: 3, y: 3}]);

if (stripped.length != 9) {
    alert('failed a');
}

var found = findEnclosed([
        {x: 2, y: 2},
        {x: 1, y: 2},
        {x: 0, y: 2},
        {x: 0, y: 1},
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 2, y: 1},
        {x: 2, y: 2},
        {x: 3, y: 2},
        {x: 3, y: 3},
    ], 10, 10);

if (found.length != 1 ||
    (found[0].x != 1 || found[0].y != 1)) {
    alert('failed 3');
}

var stripped = stripTail([
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 5, y: 0},
        {x: 5, y: 1},
        {x: 6, y: 1},
        {x: 7, y: 1},
        {x: 7, y: 2},
        {x: 7, y: 3},
        {x: 6, y: 3},
        {x: 5, y: 3},
        {x: 5, y: 2},
        {x: 5, y: 1}]);

if (stripped.length != 9 ||
    (stripped[8].x != 5 || stripped[8].y != 1)) {
    alert('failed b');
}

var found = findEnclosed([
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 5, y: 0},
        {x: 5, y: 1},
        {x: 6, y: 1},
        {x: 7, y: 1},
        {x: 7, y: 2},
        {x: 7, y: 3},
        {x: 6, y: 3},
        {x: 5, y: 3},
        {x: 5, y: 2},
        {x: 5, y: 1},
    ], 10, 10);

if (found.length != 1 ||
    (found[0].x != 6 || found[0].y != 2)) {
    alert('failed 4');
    alert('length: ' + found.length.toString());
}

var found = findEnclosed([
        {x: 5, y: 12},
        {x: 6, y: 12},
        {x: 7, y: 12},
        {x: 8, y: 12},
        {x: 9, y: 12},
        {x: 10, y: 12},
        {x: 10, y: 11},
        {x: 9, y: 11},
        {x: 9, y: 10},
        {x: 9, y: 9},
        {x: 8, y: 9},
        {x: 7, y: 9},
        {x: 6, y: 9},
        {x: 5, y: 9},
        {x: 4, y: 9},
        {x: 3, y: 9},
        {x: 3, y: 10},
        {x: 3, y: 11},
        {x: 3, y: 12},
        {x: 4, y: 12},
        {x: 5, y: 12},
    ], 10, 13);

if (found.length != 8 ) {
    alert('failed 5 (' + found.length.toString() + ')');
}

var found = findEnclosed(makeLine(5, 12, "RRUULLDD"), 10, 13);

if (found.length != 1 ) {
    alert('failed 6 (' + found.length.toString() + ')');
}

var found = findEnclosed(makeLine(9, 10, "LLLLDDRRURU"), 10, 13);

if (found.length != 1 ) {
    alert('failed 7 (' + found.length.toString() + ')');
}


var edge = findEdges(0, 0, 10, makeLine(1, 0, "RRRDLLL"));

if (edge.length != 1 ||
    edge[0].length != 4) {
    alert("edge 0 failed!");
}

edge = findEdges(0, 1, 10, makeLine(1, 2, "UURDDRURRD"));

if (edge.length != 3 ||
    edge[0].length != 1 ||
    edge[1].length != 1 ||
    edge[2].length != 3) {
    alert("edge 1 failed!");
}

edge = findEdges(0, 1, 10, makeLine(8, 2, "UULDDLULLLLU"));

if (edge.length != 3 ||
    edge[0].length != 5 ||
    edge[1].length != 1 ||
    edge[2].length != 1) {
    alert("edge 2 failed!");
}

edges = findEdges(0, 0, 10, makeLine(3, 0, "LL"));
edges = findEdges(0, 0, 10, makeLine(3, 0, "DLU"));

dist = findDistAlongParameterizedLoop(0, 3, makeLine(3, 0, "DLU"));