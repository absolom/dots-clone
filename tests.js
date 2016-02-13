
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

var edges = findEdges(0, 0, 10, makeLine(3, 0, "LL"));
var edges = findEdges(0, 0, 10, makeLine(3, 0, "DLU"));

var dist = findDistAlongParameterizedLoop(0, 3, makeLine(3, 0, "DLU"));