const MOVE = {
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
};

export class Grid {

    constructor (itemsCount, gridWidth) {
        this.itemsCount = itemsCount;
        this.gridWidth = gridWidth;
    }

    rowsCount () {
        return Math.ceil(this.itemsCount / this.gridWidth);
    }

    cellsCount () {
        return this.rowsCount() * this.gridWidth;
    }

    positionExists (position) {
        return position / this.gridWidth < this.itemsCount / this.gridWidth;
    }

    translatePosition (position, vector) {
        let cellsCount = this.cellsCount();
        return (cellsCount + position + vector) % cellsCount;
    }

    getListVector (move, gridWidth) {

        if (move === MOVE.LEFT) {
            return -1;
        }

        if (move === MOVE.RIGHT) {
            return 1;
        }

        if (move === MOVE.UP) {
            return -gridWidth;
        }

        if (move === MOVE.DOWN) {
            return gridWidth;
        }

        return 0;

    }

    moveOnGrid (position, move) {
        let vector = this.getListVector(move, this.gridWidth);
        let newPos = this.translatePosition(position, vector);

        while (!this.positionExists(newPos)) {
            vector += this.getListVector(move, this.gridWidth);
            newPos = this.translatePosition(position, vector);
        }

        return newPos;
    }
}
