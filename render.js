// Define an object creation function
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        var F = function () {};
        F.prototype = o;
        return new F();
    }
}

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
var gridToCoordX = function (gridInd) {
    return gridScale * gridInd + dotOffset;
}

var gridToCoordY = function (gridInd) {
    return gridScale * gridInd + dotOffset + 70;
}

var coordToGridX = function (coord) {
    return Math.round((coord - dotOffset) / gridScale);
}

var coordToGridY = function (coord) {
    return Math.round((coord - dotOffset - 70) / gridScale);
}

var getGridPosFromEvent = function(e) {
    var mouse = {
        x: e.pageX - canvasPos.x,
        y: e.pageY - canvasPos.y
    };

    var gridPos = {
        x: coordToGridX(mouse.x),
        y: coordToGridY(mouse.y)
    };

    return gridPos;
};

// Rendering Code

var drawDot = function (gridX, gridY, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(gridX, gridY, dotRadius, 0, 2*Math.PI);
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
            x: gridToCoordX(list[i].x),
            y: gridToCoordY(list[i].y)
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
                drawDot(gridToCoordX(x), gridToCoordY(y), "#808080");
            }
            else if (grid.rows[y][x].destroyed) {
                drawDot(gridToCoordX(x), gridToCoordY(y), "#000000");
            }
            else {
                drawDot(gridToCoordX(x), gridToCoordY(y), grid.rows[y][x].color);
            }
        }
    }
};

var renderScore = function (x, y, score, context) {
    ctx.font = "18px Courier";

    ctx.strokeText(score[0].progress.toString() + "/" + score[0].goal.toString(), x-20, y+40);
    drawDot(x, y, score[0].color);

    ctx.strokeText(score[1].progress.toString() + "/" + score[1].goal.toString(), x-20+100, y+40);
    drawDot(x+100, y, score[1].color);

    ctx.strokeText(score[2].progress.toString() + "/" + score[2].goal.toString(), x-20+200, y+40);
    drawDot(x+200, y, score[2].color);
}

var render = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderDragList(curDragList);
    renderGrid(ctx, curDotsGrid);
    renderScore(120, 20, gameState.score, ctx);
};
