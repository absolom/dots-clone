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

canvas.addEventListener('mousemove', function(e) {
    if (mouseDown) {
        gridPos = getGridPosFromEvent(e);
        curDragList.push(gridPos);
    }

    // renderDragList(curDragList);
});


drawDot(5, 5, "#00FF00");
drawDot(5, 6, "#00FF00");
drawDot(6, 6, "#00FF00");
drawDot(6, 5, "#00FF00");
drawDot(0, 0, "#00FFFF");
drawDot(1, 0, "#00FFFF");
drawDot(0, 1, "#00FFFF");
