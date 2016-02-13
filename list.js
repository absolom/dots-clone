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
                if (!this.dragListClosed) {
                    this.list.push(gridPos);
                    this.dragListClosed = true;
                }
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
            }

            if (crossed % 2 == 1) {
                enclosed.push({x: x, y: y});
            }
        }
    }
    return enclosed;
};
