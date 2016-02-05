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

    for (i = 0; i < list.length; i++) {
        var coord = {
            x: gridToCoord(list[i].x),
            y: gridToCoord(list[i].y)
        }
        coords.push(coord);
    }

    ctx.moveTo(coords[0].x, coords[0].y);
    for (i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i].x, coords[i].y);
    }
    ctx.stroke();
};

var renderGrid = function(context, grid) {
    for (y = 0; y < grid.rows.length; y++) {
        for (x = 0; x < grid.rows[y].length; x++) {
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
        for (i = 0; i < listPos.length-1; i++) {
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
        for (i = 0; i < listPos.length; i++) {
            pos = listPos[i];
            this.rows[pos.y][pos.x].destroyed = true;
        }
    },
    exploadBombs: function () {
        // Blow up bomb dots and their surroundings.
        for (x = 0; x < this.width; x++) {
            for (y = 0; y < this.height; y++) {
                if (this.rows[y][x].isbomb) {
                    this.rows[y][x].isbomb = false;
                    this.rows[y][x].destroyed = true;

                    // blow up adjacent
                    for (i = -1; i <= 1; i++) {
                        for (j = -1; j <= 1; j++) {
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
        for (i = 0; i < listPos.length; i++) {
            this.markBomb(listPos[i].x, listPos[i].y);
        }
    },
    init: function() {
        for (y = 0; y < this.height; y++) {
            var row = [];
            for (x = 0; x < this.width; x++) {
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
            for (i = 0; i < unallowedColors.length; i++) {
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
        for (i = y; i > 0; i--) {
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
        for (x = 0; x < this.width; x++) {
            for (y = 0; y < this.height; y++) {
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
        for (x = 0; x < this.width; x++) {
            for (y = 0; y < this.height; y++) {
                if (!this.rows[y][x].active) {
                    this.addDot(x, y, unallowedColors);
                }
            }
        }

    },
    removeDestroyed: function () {
        // Remove inactive
        for (x = 0; x < this.width; x++) {
            for (y = 0; y < this.height; y++) {
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
        for (i = 0; i < this.list.length; i++) {
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

    for (i = 1; i < listPos.length; i++) {
        ret.push({x: listPos[i].x, y: listPos[i].y});
        if (listPos[i].x == start.x &&
            listPos[i].y == start.y) {
            return ret;
        }
    }

    var end = listPos[listPos.length-1];
    ret = [end];
    for (i = listPos.length-2; i >= 0; i--) {
        ret.push({x: listPos[i].x, y: listPos[i].y});
        if (listPos[i].x == end.x &&
            listPos[i].y == end.y) {
            return ret;
        }
    }

    return ret;
};

var findEnclosed = function (listPos, width, height) {
    var enclosed = [];
    var str = "";
    listPos = stripTail(listPos);
    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            var crossed = 0;
            var onEdge = false;
            for (i = 0; i < listPos.length; i++) {
                if (listPos[i].x == x && listPos[i].y == y) {
                    onEdge = true;
                    break;
                }
            }
            if (onEdge) {
                continue;
            }
            var skipInds = [];
            for (i = 0; i < listPos.length-1; i++) {
                // Check if we've already identified this listPos as
                // part of an edge which we are intersecting along
                var skip = false;
                for (j = 0; j < skipInds.length; j++) {
                    if (skipInds[j] == i) {
                        skip = true;
                        break;
                    }
                }
                if (skip) {
                    continue;
                }

                if (listPos[i].x >= x) {
                    if (listPos[i].y == y) {
                        // Count the number of consecutive polygon vertices
                        // along the tangent
                        var edgeLen = 1;
                        var j = (i+1).mod(listPos.length-1);
                        while (j != i && listPos[j].y == y) {
                            edgeLen += 1;
                            j += 1;
                            j = j % (listPos.length-1);
                        }

                        if (edgeLen > 1) {
                            for (k = 0; k < edgeLen; k++) {
                                skipInds.push(i+k);
                            }
                            continue;
                        }

                        edgeLen = 1;
                        j = (i-1).mod(listPos.length-1);
                        while (j != i && listPos[j].y == y) {
                            edgeLen += 1;
                            j -= 1;
                            j = j % (listPos.length-1);
                        }

                        if (edgeLen > 1) {
                            for (k = 0; k < edgeLen; k++) {
                                skipInds.push(i-k);
                            }
                            continue;
                        }

                        crossed += 1;
                    }
                    else {
                    }
                }
            }

            // If crossed is odd
            if (crossed % 2 == 1) {
                enclosed.push({x: x, y: y});
                // str += "(" + x.toString() + "," + y.toString() + ")";
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

var found = findEnclosed([
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 1, y: 1},
        {x: 0, y: 1},
        {x: 0, y: 0}
    ], 10, 10);

if (found.length != 0) {
    alert('failed 1');
}

var found = findEnclosed([
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 2, y: 1},
        {x: 2, y: 2},
        {x: 1, y: 2},
        {x: 0, y: 2},
        {x: 0, y: 1},
        {x: 0, y: 0},
    ], 10, 10);

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
        {x: 3, y: 9},
        {x: 3, y: 10},
        {x: 3, y: 11},
        {x: 3, y: 12},
        {x: 4, y: 12},
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
    ], 10, 13);

if (found.length != 8 ) {
    alert('failed 5 (' + found.length.toString() + ')');
}