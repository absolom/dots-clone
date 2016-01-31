var dotRadius = 13;
var dotSpacing = 18;
var gridScale = 2*dotRadius + dotSpacing;
var dotOffset = dotRadius + dotSpacing;

var gridToCoord = function (gridInd) {
    return gridScale * gridInd + dotOffset;
}

var drawDot = function (gridX, gridY, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(gridToCoord(gridX), gridToCoord(gridY), dotRadius, 0, 2*Math.PI);
    ctx.fill();
};

var canvas = document.getElementById("cnv");
var ctx = canvas.getContext("2d");
drawDot(5, 5, "#00FF00");
drawDot(5, 6, "#00FF00");
drawDot(6, 6, "#00FF00");
drawDot(6, 5, "#00FF00");
drawDot(0, 0, "#00FFFF");
drawDot(1, 0, "#00FFFF");
drawDot(0, 1, "#00FFFF");
