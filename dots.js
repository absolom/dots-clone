var dotRadius = 13;
var dotSpacing = 18;
var gridScale = 2*dotRadius + dotSpacing;
var dotOffset = dotRadius + dotSpacing;
var curDragList = [];
var mouseDown = false;

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

var dot = {
    color: "#0000FF"
}

var curDotsGrid = {
    width: 6,
    height: 6,
    rows: [],
    render: function(context) {
        for (y = 0; y < this.rows.length; y++) {
            for (x = 0; x < this.rows[y].length; x++) {
                drawDot(x, y, this.rows[y][x].color);
            }
        }
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

canvas.addEventListener('mousedown', function(e) {
    curDragList = [];
    mouseDown = true;
});

canvas.addEventListener('mouseup', function(e) {
    mouseDown = false;
    for (i = 0; i < curDragList.length; i++) {
        drawDot(curDragList[i].x, curDragList[i].y, "#FF00F0");
    }
    curDragList = [];
});

var addGridPosToDragList = function (list, gridPos) {
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

    // Add element to the end of the list
    list.push(gridPos);
};

canvas.addEventListener('mousemove', function(e) {
    if (mouseDown) {
        gridPos = getGridPosFromEvent(e);
        addGridPosToDragList(curDragList, gridPos);
    }

    render();
});


redDotsRow = [{color: "#FF00FF"},{color: "#00FFFF"},{color: "#0000FF"},
              {color: "#00FF00"},{color: "#FFFF00"},{color: "#FF0000"}];

for (x = 0; x < 6; x++) {
    curDotsGrid.rows.push(redDotsRow.slice());
}

render();