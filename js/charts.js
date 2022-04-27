function JRect(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

function inBox(x, y, px, py, w, h) {
    return ((px < x) && (x < (px + w))) && ((py < y) && (y < (py + h)));
}

Array.prototype.min = function() {
    var min = this[0];
    var len = this.length;
    for (var i = 1; i < len; i++){
        if (this[i] < min){
            min = this[i];
        }
    }
    return min;
}
Array.prototype.max = function() {
    var max = this[0];
    var len = this.length;
    for (var i = 1; i < len; i++){
        if (this[i] > max) {
            max = this[i];
        }
    }
    return max;
}

let lineChart = {
    defaultOptions: {
        xScope: ['a', 'b', 'c', 'd'],
        yScope: [10, 15, 13, 20],
        gWidth: 0,
        gHeight: 0,
    },
    locations: [],
    points: null,
    scope: null,

    create(id, options={}) {
        for (let key in this.defaultOptions) {
            if (options.hasOwnProperty(key)) {
                this.defaultOptions[key] = options[key];
            }
        }
        console.info("options:")
        console.info(this.defaultOptions);

        let container = document.getElementById(id);
        let canvas    = document.createElement('canvas')
        this.defaultOptions.gWidth = parseInt(container.style.width.slice(0, -2));
        this.defaultOptions.gHeight = parseInt(container.style.height.slice(0, -2));
        // let gWidth    = parseInt(container.style.width.slice(0, -2));
        // let gHeight   = parseInt(container.style.height.slice(0, -2));
        canvas.width  = this.defaultOptions.gWidth;
        canvas.height = this.defaultOptions.gHeight;
        container.appendChild(canvas);
        this.scope   = canvas.getContext('2d');
        let gap = 50;
        let xPer = (this.defaultOptions.gWidth - gap * 2) / (this.defaultOptions.xScope.length - 1 + 3);
        // let locations = [];
        let yMax = this.defaultOptions.yScope.max();
        let yMin = this.defaultOptions.yScope.min();
        console.info(`yMin: ${yMin}, yMax: ${yMax}`)
        let yPer = (this.defaultOptions.gHeight - gap * 4) / (yMax - yMin);

        this.points = canvas.getContext('2d');

        let createPoint = (x, y) => {
            return new JRect(x - 5, y - 5, 10, 10);
        }

        for (let i = 0; i < this.defaultOptions.xScope.length; i++) {
            let yi = (this.defaultOptions.yScope[i] - yMin) * yPer;
            // yi = this.defaultOptions.gHeight - yi;
            console.info(yi);
            this.locations.push(createPoint((i + 1 ) * xPer, yi + 80));
        }
        canvas.addEventListener('mousemove', e => {
            for (let i = 0; i < this.defaultOptions.xScope.length; i++) {
                let box = this.locations[i];
                if (inBox(e.offsetX, e.offsetY, box.x, box.y, box.w, box.h)) {
                    this.locations[i].x = (box.x + box.x + box.w) / 2 - 10;
                    this.locations[i].y = (box.y + box.y + box.h) / 2 - 10;
                    this.locations[i].w = 20;
                    this.locations[i].h = 20;
                    // break;
                } else {
                    this.locations[i].x = (box.x + box.x + box.w) / 2 - 5;
                    this.locations[i].y = (box.y + box.y + box.h) / 2 - 5;
                    this.locations[i].w = 10;
                    this.locations[i].h = 10;
                }
                this.draw();
            }
        });
    },
    draw() {
        this.points.clearRect(0, 0, this.defaultOptions.gWidth, this.defaultOptions.gHeight);
        this.scope.fillStyle = '#000000';
        this.scope.lineWidth = 1;
        let gap = 50;
        // x scope
        this.scope.moveTo(gap, this.defaultOptions.gHeight - gap);
        this.scope.lineTo(this.defaultOptions.gWidth - gap, this.defaultOptions.gHeight - gap);
        // y scope
        this.scope.moveTo(gap, this.defaultOptions.gHeight - gap);
        this.scope.lineTo(gap, gap);
        this.scope.stroke();
        let drawPoint = box => {
            this.points.fillStyle = 'rgb(187,255,255)';
            this.points.fillRect(box.x, box.y, box.w, box.h);
        };
        console.info("---")
        for (let i = 0; i < this.defaultOptions.xScope.length; i++) {
            let box = this.locations[i];
            drawPoint(this.locations[i]);
            console.info(`${box.x},${box.y}`)
        }
    },
}