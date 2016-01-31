var dotRadius = 13;
var dotSpacing = 18;
var gridScale = 2*dotRadius + dotSpacing;
var dotOffset = dotRadius + dotSpacing;
var curDragList = [];
var mouseDown = false;
var dragListClosed = false;

var gridToCoord = function (gridInd) {
    return gridScale * gridInd + dotOffset;
}

var coordToGrid = function (coord) {
    return Math.round((coord - dotOffset) / gridScale);
}

var drawDot = function (gridX, gridY, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(gridToCoord(gridX), gridToCoord(gridY), dotRadius, 0, 2*Math.PI);
    ctx.fill();
};

var canvas = document.getElementById("cnv");
var ctx = canvas.getContext("2d");

var canvasPos = {
    x: canvas.offsetLeft - canvas.scrollLeft + canvas.clientLeft,
    y: canvas.offsetTop - canvas.scrollTop + canvas.clientTop
}

var renderDragList = function(list) {
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
}

var curDotsGrid = {
    colors: [
        "#FF00FF",
        "#00FFFF",
        "#0000FF",
        "#00FF00",
        "#FFFF00",
        "#FF0000"
        ],
    width: 10,
    height: 13,
    rows: [],
    render: function(context) {
        for (y = 0; y < this.rows.length; y++) {
            for (x = 0; x < this.rows[y].length; x++) {
                drawDot(x, y, this.rows[y][x].color);
            }
        }
    },
    getRandomColor: function () {
        return this.colors[Math.round(Math.random() * (this.colors.length-1))];
    },
    reset: function() {
        for (y = 0; y < this.height; y++) {
            var row = [];
            for (x = 0; x < this.width; x++) {
                row.push({active: true, color: this.getRandomColor()});
            }
            this.rows.push(row);
        }
    },
    getColor: function(x, y) {
        return this.rows[y][x].color;
    },
    addDot: function(x, y) {
        this.rows[y][x].active = true;
        this.rows[y][x].color = this.getRandomColor();
    },
    setColorClear: function (x, y) {
        this.colorClear = true;
        this.colorClearCol = this.getColor(x, y);
    },
    clearColorClear: function () {
        this.colorClear = false;
    },
    removeDot: function(x, y) {
        for (i = y; i > 0; i--) {
            this.rows[i][x].color = this.rows[i-1][x].color;
            this.rows[i][x].active = this.rows[i-1][x].active;
        }
        this.rows[0][x].active = false;
    },
    markDot: function (x, y) {
        this.rows[y][x].active = false;
    },
    markAllWithColor: function (col) {
        for (x = 0; x < this.width; x++) {
            for (y = 0; y < this.height; y++) {
                if (this.rows[y][x].color == col) {
                    this.markDot(x, y);
                }
            }
        }
    },
    refresh: function() {
        var finished = true;

        // If color clear, mark all color clear colored dots inactive
        if (this.colorClear) {
            this.markAllWithColor(this.colorClearCol);
        }

        // Find all inactive dots, remove them, fill in missing dots.
        for (x = 0; x < this.width; x++) {
            for (y = 0; y < this.height; y++) {
                if (!this.rows[y][x].active) {
                    finished = false;
                    this.removeDot(x, y);
                }
            }
        }

        // Newly added dots need to be initialized
        for (x = 0; x < this.width; x++) {
            for (y = 0; y < this.height; y++) {
                if (!this.rows[y][x].active) {
                    this.addDot(x, y);
                    if (this.colorClear) {
                        while (this.getColor(x, y) == this.colorClearCol) {
                            this.addDot(x, y);
                        }
                    }
                }
            }
        }

        return finished;
    }
};

var render = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderDragList(curDragList);
    curDotsGrid.render(ctx);
};

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

var addGridPosToDragList = function (list, gridPos) {
    // No negative values
    if (gridPos.x < 0 || gridPos.y < 0) {
        return;
    }

    // No values bigger than the grid
    if (gridPos.x >= curDotsGrid.width || gridPos.y >= curDotsGrid.height) {
        return;
    }

    // If adding the same element as the last element, do nothing
    if (list.length > 0) {
        curPos = list[list.length-1];
        if (curPos.x == gridPos.x && curPos.y == gridPos.y) {
            return;
        }
    }

    // If adding the previous element, remove the last element instead
    if (list.length > 1) {
        var lastPos = list[list.length-2];
        if (lastPos.x == gridPos.x && lastPos.y == gridPos.y) {
            dragListClosed = false;
            list.pop();
            return;
        }
    }

    // If trying to add a new pos that is farther than one step from the old, skip it
    if (list.length > 0) {
        curPos = list[list.length-1];
        var diffX = Math.abs(curPos.x - gridPos.x);
        var diffY = Math.abs(curPos.y - gridPos.y);

        if (diffX > 1 || diffY > 1 || (diffX == 1 && diffY == 1)) {
            return;
        }
    }

    // If adding a pos already in the list, ignore unless it is the first one
    for (i = 0; i < list.length; i++) {
        if (list[i].x == gridPos.x && list[i].y == gridPos.y) {
            if (i == 0) {
                dragListClosed = true;
                list.push(gridPos);
                return;
            }
            else {
                return;
            }
        }
    }

    // Add element to the end of the list
    if (!dragListClosed) {
        list.push(gridPos);
    }
};

var activateDragList = function(listPos, grid) {
    // Check that the list has 2 or more points
    if (listPos.length < 2) {
        return;
    }

    // Check that they are all the same color
    for (i = 0; i < listPos.length-1; i++) {
        col1 = grid.getColor(listPos[i].x, listPos[i].y);
        col2 = grid.getColor(listPos[i+1].x, listPos[i+1].y)
        if (col1 != col2) {
            return;
        }
    }

    // Check if they create a closed polygon (start == end)
    if (listPos[0].x == listPos[listPos.length-1].x &&
        listPos[0].y == listPos[listPos.length-1].y) {
        grid.setColorClear(listPos[0].x, listPos[0].y);
        // Check for enclosed dots and make bombs
    }

    // Remove all the dots from the line
    for (i = 0; i < listPos.length; i++) {
        pos = listPos[i];
        grid.markDot(pos.x, pos.y);
        grid.rows[listPos[i].y][listPos[i].x].color = "#000000";
    }
}

canvas.addEventListener('mousedown', function(e) {
    curDragList = [];
    dragListClosed = false;
    mouseDown = true;
});

canvas.addEventListener('mouseup', function(e) {
    activateDragList(curDragList, curDotsGrid);
    curDotsGrid.refresh();
    curDotsGrid.clearColorClear();
    mouseDown = false;
    curDragList = [];
});

canvas.addEventListener('mouseout', function(e) {
    mouseDown = false;
    curDragList = [];
    render();
});

canvas.addEventListener('mousemove', function(e) {
    if (mouseDown) {
        gridPos = getGridPosFromEvent(e);
        addGridPosToDragList(curDragList, gridPos);
    }

    render();
});

curDotsGrid.reset();
render();