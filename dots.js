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
    score: [{
                color: "#00FF00", // TODO: Change this to a dot instance
                progress: 0,
                goal: 20
            },
            {
                color: "#0000FF",
                progress: 0,
                goal: 25
            },
            {
                color: "#FF0000",
                progress: 0,
                goal: 20
            }],
    colorClear: false,
    colorClearCol: "#000000",
    updateScore: function (destroyed) {
        this.score[0].progress += destroyed.green || 0;
        this.score[1].progress += destroyed.blue || 0;
        this.score[2].progress += destroyed.red || 0;
    },
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
                var removed = grid.removeDestroyed();
                this.updateScore(removed);
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
                var removed = grid.removeDestroyed();
                grid.populateInactive([this.colorClearCol]);
                this.updateScore(removed);
                this.state = 0;
                break;
        }

        return this.state;
    },
};

curDotsGrid.init();
render();

