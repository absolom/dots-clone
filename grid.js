// Dot grid object

var DotsGrid = function() {
    var that = {};

    that.width = 10;
    that.height = 13;
    var rows = [];
    var colors = {
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
        };

    var markDot = function (x, y) {
        rows[y][x].destroyed = true;
    };

    var removeDot = function(x, y) {
        for (var i = y; i > 0; i--) {
            rows[i][x].destroyed = rows[i-1][x].destroyed;
            rows[i][x].color = rows[i-1][x].color;
            rows[i][x].active = rows[i-1][x].active;
            rows[i][x].isbomb = rows[i-1][x].isbomb;
        }
        rows[0][x].active = false;
    };

    var addDot = function(x, y, unallowedColors) {
        rows[y][x].destroyed = false;
        rows[y][x].active = true;
        rows[y][x].isbomb = false;
        rows[y][x].color = colors.getRandomColor();

        var isUnallowed = function () {
            for (var i = 0; i < unallowedColors.length; i++) {
                if (unallowedColors[i] == rows[y][x].color) {
                    return true;
                }
            }
            return false;
        }

        while (isUnallowed()) {
            rows[y][x].color = colors.getRandomColor();
        }

    };

    var getColor = function(x, y) {
        return rows[y][x].color;
    };

    var markDestroyed = function (listPos) {
        // Remove all the dots from the line
        for (var i = 0; i < listPos.length; i++) {
            pos = listPos[i];
            rows[pos.y][pos.x].destroyed = true;
        }
    };


    var init = function() {
        for (var y = 0; y < that.height; y++) {
            var row = [];
            for (var x = 0; x < that.width; x++) {
                row.push({destroyed: false, isbomb: false, active: true, color: colors.getRandomColor()});
            }
            rows.push(row);
        }
    };

    var areAllSameColor = function (listPos) {
        // Check that they are all the same color
        for (var i = 0; i < listPos.length-1; i++) {
            col1 = getColor(listPos[i].x, listPos[i].y);
            col2 = getColor(listPos[i+1].x, listPos[i+1].y)
            if (col1 != col2) {
                return false;
            }
        }
        return true;
    };

    var exploadBombs = function () {
        // Blow up bomb dots and their surroundings.
        for (var x = 0; x < that.width; x++) {
            for (var y = 0; y < that.height; y++) {
                if (rows[y][x].isbomb) {
                    rows[y][x].isbomb = false;
                    rows[y][x].destroyed = true;

                    // blow up adjacent
                    for (var i = -1; i <= 1; i++) {
                        for (var j = -1; j <= 1; j++) {
                            // Check if the adjacent coord is off the map
                            if (x + i < 0 ||
                                x + i >= that.width) {
                                continue;
                            }
                            if (y + j < 0 ||
                                y + j >= that.height) {
                                continue;
                            }

                            if (!rows[y+j][x+i].isbomb) {
                                rows[y+j][x+i].destroyed = true;
                            }
                        }
                    }
                }
            }
        }
    };

    var markBombs = function(listPos) {
        for (var i = 0; i < listPos.length; i++) {
            markBomb(listPos[i].x, listPos[i].y);
        }
    };

    var markBomb = function (x, y) {
        rows[y][x].isbomb = true;
        rows[y][x].active = true;
        rows[y][x].destroyed = false;
    };

    var markAllWithColor = function (col) {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (rows[y][x].color == col) {
                    if (rows[y][x].isbomb == false) {
                        markDot(x, y);
                    }
                }
            }
        }
    };

    var populateInactive = function(unallowedColors) {
        // Initialize new dots
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (!rows[y][x].active) {
                    addDot(x, y, unallowedColors);
                }
            }
        }
    };

    var removeDestroyed = function () {
        var ret = {
            magenta: 0,
            cyan: 0,
            blue: 0,
            green: 0,
            yellow: 0,
            red: 0
        };
        // Remove inactive
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (rows[y][x].destroyed) {
                    col = getColor(x, y);
                    if (col == colors.magenta) {
                        ret.magenta += 1;
                    }
                    if (col == colors.cyan) {
                        ret.cyan += 1;
                    }
                    if (col == colors.blue) {
                        ret.blue += 1;
                    }
                    if (col == colors.green) {
                        ret.green += 1;
                    }
                    if (col == colors.yellow) {
                        ret.yellow += 1;
                    }
                    if (col == colors.red) {
                        ret.red += 1;
                    }
                    removeDot(x, y);
                }
            }
        }

        return ret;
    };

    that.init = init;
    that.markDestroyed = markDestroyed;
    that.areAllSameColor = areAllSameColor;
    that.getColor = getColor;
    that.exploadBombs = exploadBombs;
    that.markBombs = markBombs;
    that.markAllWithColor = markAllWithColor;
    that.populateInactive = populateInactive;
    that.removeDestroyed = removeDestroyed;
    that.rows = rows;

    return that;
};
