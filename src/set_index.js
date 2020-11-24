class SetVisualizer extends Game {
    /**
     * @param {Cathanvas} cathanvas
     */
    constructor(cathanvas, set = [], options = {}) {
        super(cathanvas);
        this.cathanvas = cathanvas;
        this.center = this.cathanvas.center;
        this.set = set;
        this.range = this.determineNumRange(options);
        this.offset = {
            x: (num) => num * this.resolution,
            y: (num) => (-1 * num * this.resolution) + (this.cathanvas.height / 2)
        };
        this.FPS = options.FPS == null ? 12 : options.FPS;
        this.circleCursor = 1;
        this.pointCursor = 0;
        this.time = Date.now();
    }

    determineNumRange(options) {
        const res = options.resolution || 1;   // How many units are on the screen
        this.resolution = res;
        return this.cathanvas.width / res;
    }

    drawNumberLine() {
        this.cathanvas.drawLineFrom([0, cathanvas.height /2], [cathanvas.width, cathanvas.height / 2]);
        this.drawTicks();
    }

    drawTicks() {
        const tickLength = 0.0005 * this.cathanvas.height;
        for (let i = 0; i < this.range; i++) {
            this.cathanvas.drawLineFrom(this.applyOffset([i, -tickLength]), this.applyOffset([i, tickLength]));
        }
    }

    drawSet() {
        let prev = null;
        for (let i = 0; i < this.set.length; i++) {
            if (prev) {
                this.drawSemiCircle([prev, 0], [this.set[i], 0], i % 2 !== 0);
            }
            prev = this.set[i];
        }
    }

    withinRateLimit() {
        if (this.FPS <= 0) {
            return true;
        }
        const timeDelta = Date.now() - this.time;
        return timeDelta > (1 / this.FPS) * 1000;
    }

    drawNextDot() {
        if (!this.withinRateLimit()) {
            return;
        }

        const i = this.circleCursor;  // semicircles
        if (i < this.set.length && this.set[i - 1] != null) {
            const j = this.pointCursor; // points on semicircle
            if (this.set[i] === j / this.resolution) { // If the animation has reached the next point on the line
                this.circleCursor += 1;
            } else {
                const fromX = this.set[i - 1];
                const toX = this.set[i];

                this.cathanvas.drawDotOnCurve(this.applyOffset([fromX, 0]), this.applyOffset([toX, 0]), j, i % 2 !== 0);
                this.pointCursor = getNextX(fromX * this.resolution, toX * this.resolution, j);
            }

        }
        this.time = Date.now();
    }

    drawNextSemicircle() {
        const i = this.circleCursor;
        if (i < this.set.length && this.set[i - 1] != null) {
            this.drawSemiCircle([this.set[i - 1], 0], [this.set[i], 0], i % 2 !== 0);
        }
        this.circleCursor += 1;
    }

    animateSet() {
        requestAnimationFrame(() => {
            this.drawNextSemicircle();
            requestAnimationFrame(() => this.animateSet());
        });
    }

    drawSemiCircle(pointA, pointB, ccw) {
        this.cathanvas.drawCurve(this.applyOffset(pointA), this.applyOffset(pointB), ccw);
    }

    numberWithinRange(num) {
        return num >= 0 && num <= this.range;
    }

    applyOffset(coords) {
        // Place the coordinate on the display coord system rather than the Canvas coord system
        const mappedCoords = [];
        if (this.offset.x) {
            mappedCoords.push(this.offset.x(coords[0]));
        } else {
            mappedCoords.push(coords[0]);
        }
        if (this.offset.y) {
            mappedCoords.push(this.offset.y(coords[1]));
        } else {
            mappedCoords.push(coords[1]);
        }
        return mappedCoords;
    }
}

 /**
 *
 * @param {Number} from
 * @param {Number} to
 * @param {Number} current
 */
 function getNextX(from, to, current) {
    if (to < from) {
        return current - 1;
    }
    return current + 1;
}