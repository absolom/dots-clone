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
                if (this.rows[y][x].destroyed) {
                    col = this.getColor(x, y);
                    if (col == this.colors.magenta) {
                        ret.magenta += 1;
                    }
                    if (col == this.colors.cyan) {
                        ret.cyan += 1;
                    }
                    if (col == this.colors.blue) {
                        ret.blue += 1;
                    }
                    if (col == this.colors.green) {
                        ret.green += 1;
                    }
                    if (col == this.colors.yellow) {
                        ret.yellow += 1;
                    }
                    if (col == this.colors.red) {
                        ret.red += 1;
                    }
                    this.removeDot(x, y);
                }
            }
        }

        return ret;
    }
};
