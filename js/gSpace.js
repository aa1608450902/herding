// import {JPoint, JLine, wireFrame} from "./herding/js/WireFrame";

let uuid = {
    gen() {
        let s = [];
        let hexDigits = "0123456789abcdef";
        for (let i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = "-";
        return s.join("");
    }
};

let cursor = {
    x: 0, y: 0,
    taskType: 0,
};

let keptView = null;

function ViewGroup() {
    let self = this;
    this.uid = uuid.gen();
    this.els = [];
    this.append = el => {
        self.els.push(el);
        return self;
    };
    this.listeners = [];
    this.addListener = lis => {
        self.listeners.push(lis);
        return this;
    };
    // this.drivable = false;
    // this.drivableEl = null;
    // this.getDrivableEl = () => {
    //     return self.drivableEl;
    // };
    // this.setDrivable = () => {
    //     self.drivable = true;
    //     self.drivableEl = self.els[self.els.length - 1];
    //     return self;
    // }
    this.kept = [];
    this.record = () => {
        self.kept.splice(0, this.kept.length);
        self.els.forEach(el => {
            let prefix = el.localName === 'circle' ? `c` : '';
            self.kept.push({
                x: parseInt(el.getAttribute(`${prefix}x`)),
                y: parseInt(el.getAttribute(`${prefix}y`)),
            });
        });
        return self;
    };
    this.moveTo = (biasX, biasY) => {
        for (let i = 0; i < self.els.length; i++) {
            try {
                let el = self.els[i];
                let prefix = el.localName === 'circle' ? `c` : '';
                el.setAttribute(`${prefix}x`, self.kept[i].x + biasX);
                el.setAttribute(`${prefix}y`, self.kept[i].y + biasY);
            } catch (e) {
                console.error(e);
            }
        }
        self.listeners.forEach(lis => lis());
        return self;
    };
}

let linesGroup = [];

//
// function JPoint(x, y) {this.x = x;this.y = y;}
// function JLine(p0, p1) {this.p0 = p0;this.p1 = p1;}
// let wireFrame = {
//     get(o, s) {return parseFloat(o.getAttribute(s));},
//     inBox(x, y, px, py, w, h) {return ((px < x) && (x < (px + w))) && ((py < y) && (y < (py + h)));},
//     planeCross(v0, v1) {return v0.x * v1.y - v1.x * v0.y;},
//     lineCross(L0, L1) {
//         if ((L0.p1.y - L0.p0.y) * (L1.p1.x - L1.p0.x) === (L1.p1.y - L1.p0.y) * (L0.p1.x - L0.p0.x)) return false;
//         return (wireFrame.planeCross(new JPoint(L1.p0.x - L0.p0.x, L1.p0.y - L0.p0.y), new JPoint(L0.p1.x - L0.p0.x, L0.p1.y - L0.p0.y))
//                 * wireFrame.planeCross(new JPoint(L1.p1.x - L0.p0.x, L1.p1.y - L0.p0.y), new JPoint(L0.p1.x - L0.p0.x, L0.p1.y - L0.p0.y)) < 0)
//             && (wireFrame.planeCross(new JPoint(L0.p0.x - L1.p0.x, L0.p0.y - L1.p0.y), new JPoint(L1.p1.x - L1.p0.x, L1.p1.y - L1.p0.y))
//                 * wireFrame.planeCross(new JPoint(L0.p1.x - L1.p0.x, L0.p1.y - L1.p0.y), new JPoint(L1.p1.x - L1.p0.x, L1.p1.y - L1.p0.y)) < 0);
//     },
//     select(group, frame) {
//         let _r = [];
//         let frameX = parseFloat(frame.style.left.slice(0, -2));
//         let frameY = parseFloat(frame.style.top.slice(0, -2));
//         let frameWidth = parseFloat(frame.style.width.slice(0, -2));
//         let frameHeight = parseFloat(frame.style.height.slice(0, -2));
//         for (let i in group) {
//             let line = group[i];
//             let p1TF = wireFrame.inBox(wireFrame.get(line, 'x1'), wireFrame.get(line, 'y1'), frameX, frameY, frameWidth, frameHeight);
//             let p2TF = wireFrame.inBox(wireFrame.get(line, 'x2'), wireFrame.get(line, 'y2'), frameX, frameY, frameWidth, frameHeight);
//             if (p1TF || p2TF) {_r.push(i);continue;}
//             let jPoint0 = new JPoint(frameX, frameY);
//             let jPoint1 = new JPoint(frameX + frameWidth, frameY);
//             let jPoint2 = new JPoint(frameX, frameY + frameHeight);
//             let jPoint3 = new JPoint(frameX + frameWidth, frameY + frameHeight);
//             let jLine0  = new JLine(jPoint0, jPoint1);
//             let jLine1  = new JLine(jPoint0, jPoint2);
//             let jLine2  = new JLine(jPoint1, jPoint3);
//             let jLine3  = new JLine(jPoint2, jPoint3);
//             let jLine   = new JLine(new JPoint(wireFrame.get(line, 'x1'), wireFrame.get(line, 'y1')), new JPoint(wireFrame.get(line, 'x2'), wireFrame.get(line, 'y2')));
//             if (wireFrame.lineCross(jLine0, jLine) || wireFrame.lineCross(jLine1, jLine) || wireFrame.lineCross(jLine2, jLine) || wireFrame.lineCross(jLine3, jLine)) {_r.push(i);}
//         }
//         return _r;
//     }
// }

let gSpace = {
    namespace: 'http://www.w3.org/2000/svg',
    palette: null,
    groups: new Map(),
    frame: null,

    overlay(p0, p1) {
        // console.info(`cursor x:${cursor.x}, y:${cursor.y}`)
        if (gSpace.frame === null) {
            gSpace.frame = document.createElement('div');
            gSpace.frame.style.position = 'absolute';
            gSpace.frame.style.backgroundColor = 'rgba(36,104,162,0.25)';
            gSpace.frame.style.opacity = '0.8';
            // gSpace.frame.style.overflow = 'hidden';
            // gSpace.frame.style.pointerEvents = 'none';
            gSpace.frame.style.border = '1px solid rgb(36,104,162)';
            document.body.appendChild(gSpace.frame);
        }
        // gSpace.frame.style.width = `${(p1.x - p0.x)}px`;
        // gSpace.frame.style.height = `${(p1.y - p0.y)}px`;
        // gSpace.frame.style.top = `${p0.y}px`;
        // gSpace.frame.style.left = `${p0.x}px`;
        gSpace.frame.style.width = `${Math.abs(p1.x - p0.x)}px`;
        gSpace.frame.style.height = `${Math.abs(p1.y - p0.y)}px`;
        if (p0.x <= p1.x && p0.y <= p1.y) {//right down
            gSpace.frame.style.top = `${p0.y}px`;
            gSpace.frame.style.left = `${p0.x}px`;
        } else if (p0.x <= p1.x && p0.y > p1.y) {//right up
            gSpace.frame.style.top = `${p1.y}px`;
            gSpace.frame.style.left = `${p0.x}px`;
        } else if (p0.x > p1.x && p0.y <= p1.y) { //left down
            gSpace.frame.style.top = `${p0.y}px`;
            gSpace.frame.style.left = `${p1.x}px`;
        } else if (p0.x > p1.x && p0.y > p1.y)  {//left up
            gSpace.frame.style.top = `${p1.y}px`;
            gSpace.frame.style.left = `${p1.x}px`;
        }
    },

    createTag(tag, options) {
        let el = document.createElement(tag);
        el.id  = uuid.gen();
        for (let attr in options) {
            el.setAttribute(attr, options[attr]);
        }
        return el;
    },
    createSvgTag(tag, options) {
        let el = document.createElementNS(this.namespace, tag);
        el.id  = uuid.gen();
        for (let attr in options) {
            el.setAttribute(attr, options[attr]);
        }
        return el;
    },
    remove() {
    },
    get(uid) {
    },
    mouseUp(e) {
        if (cursor.taskType === 3) {
            // console.info('up')
            // gSpace.overlay(new JPoint(cursor.x, cursor.y), new JPoint(e.pageX, e.pageY));
            // gSpace.frame.setAttribute('width', e.pageX - cursor.x);
            // gSpace.frame.setAttribute('height', e.pageY - cursor.y);

            let indices = wireFrame.select(linesGroup, gSpace.frame);
            console.info(indices);
            for (let i in linesGroup) {
                let has = false;
                for (let j of indices) {
                    if (j === i) {
                        has = true;
                        break;
                    }
                }
                // console.info(linesGroup[i]);
                if (has) {
                    linesGroup[i].setAttribute('stroke', 'rgb(51,163,220)')
                } else {
                    linesGroup[i].setAttribute('stroke', 'rgb(255,255,255)')
                }
            }
        }
         cursor.taskType = 0;
    },
    mouseMove(e, self) {
        if (cursor.taskType === 1 && e.buttons === 1 && keptView !== null) {
            keptView.moveTo(e.pageX - cursor.x, e.pageY - cursor.y);
        } else if (cursor.taskType === 2 && (e.buttons === 2 || e.buttons === 4)) {
            // self.groups.forEach(group => group.moveTo(e.pageX - cursor.x, e.pageY - cursor.y));
        } else if (cursor.taskType === 3 && e.buttons === 1) {
            gSpace.overlay(new JPoint(cursor.x, cursor.y), new JPoint(e.pageX, e.pageY));
            // gSpace.frame.setAttribute('width', e.pageX - cursor.x);
            // gSpace.frame.setAttribute('height', e.pageY - cursor.y);
        }
    },
    mouseDown(e, self) {
        if (e.buttons === 2 || e.buttons === 4) {
            cursor.taskType = 2;
            cursor.x = e.pageX;
            cursor.y = e.pageY;
            // self.groups.forEach(group => group.record());
        } else if (e.buttons === 1) {
            console.info("start to draw frame");
            cursor.taskType = 3;
            cursor.x = e.pageX;
            cursor.y = e.pageY;
            if (gSpace.frame !== null) {
                gSpace.frame.remove();
            }
            if (gSpace.frame !== null) {
                gSpace.frame.remove();
                gSpace.frame = null;
            }
            gSpace.overlay(new JPoint(cursor.x, cursor.y), new JPoint(e.pageX, e.pageY));
            // gSpace.frame = gSpace.createRect(cursor.x, cursor.y, 0, 0, 0,
            //     {fill: 'rgba(51,163,220,0.5)',stroke: 'rgb(51,163,220)'});
            // gSpace.palette.appendChild(gSpace.frame);

            // Object.assign(gSpace.frame, {
            //     x: cursor.x, y: cursor.y, h: 0, w: 0,
            //     fill: 'rgba(51,163,220,0.5)',
            //     stroke: 'rgb(51,163,220)'
            // });
        }
    },
    viewMouseDown(e, self, view) {
        if (e.buttons === 1) {
            cursor.taskType = 1;
            cursor.x = e.pageX;
            cursor.y = e.pageY;
            keptView = view;
            keptView.record();
        } else if (e.buttons === 2 || e.buttons === 4) {
            cursor.taskType = 2;
            cursor.x = e.pageX;
            cursor.y = e.pageY;
        }
    },
    createOverlay(p0, p1) {

    },
    prepare(paletteUid) {
        this.palette = document.getElementById(paletteUid);
        let self = this;
        window.addEventListener('mouseup', e => self.mouseUp(e));
        window.addEventListener('mousedown', e => self.mouseDown(e, self));
        window.addEventListener('mousemove', e => self.mouseMove(e, self));
        return this;
    },
    bind(el) {
        let self = this;
        const view = this.groups.get(el.id);
        el.addEventListener('mousedown', e => self.viewMouseDown(e, self, view));
        el.addEventListener('mousemove', e => self.mouseMove(e, self));
        // el.style.cursor = 'move';
        return this;
    },
    createCircle(cx, cy, r=10, options={}) {
        let defaultOptions = {
            cx, cy, r,
            'stroke': 'white',
            'stroke-width': 4,
            'fill': '#333333',
        };
        Object.assign(defaultOptions, options);
        return this.createSvgTag('circle', defaultOptions);
    },
    createRect(x, y, w=120, h=30, r=5, options={}) {
        let defaultOptions = {
            x: x - w / 2, y: y - h / 2,
            width: w, height: h,
            rx: r, ry: r,
            'fill': 'white',
            // 'class': 'svg-hover',
        };
        Object.assign(defaultOptions, options);
        return this.createSvgTag('rect', defaultOptions);
    },
    createCurve(p1x, p1y, p2x, p2y, dir='v', options={}) {
        let point1 = [p1x, p1y];
        let point2 = [p2x, p2y];
        let path;
        if (dir === 'v') {
            path = `M${point1[0]} ${point1[1]} ` +
                `C${point1[0]} ${(point1[1] + point2[1]) / 2}` +
                ` ${point2[0]} ${(point1[1] + point2[1]) / 2}` +
                ` ${point2[0]} ${point2[1]}`;
        } else {
            path = `M${point1[0]} ${point1[1]} ` +
                `C${(point1[0] + point2[0]) / 2} ${point1[1]}` +
                ` ${(point1[0] + point2[0]) / 2} ${point2[1]}` +
                ` ${point2[0]} ${point2[1]}`;
        }
        let defaultOptions = {
            d: path,
            'stroke': 'white',
            'stroke-width': 2,
            'fill': 'none',
        };
        Object.assign(defaultOptions, options);
        return this.createSvgTag('path', defaultOptions);
    },
    createLine(p1x, p1y, p2x, p2y, options={}) {
        let defaultOptions = {
            x1: p1x, y1: p1y,
            x2: p2x, y2: p2y,
            'stroke': 'white',
            'stroke-width': 2,
            'fill': 'none',
        };
        Object.assign(defaultOptions, options);
        return this.createSvgTag('line', defaultOptions);
    },
    createText(x, y, w, h, text) {
        let foreign = this.createSvgTag('foreignObject', {
            'pointer-events': 'none',
            x: x - w / 2, y: y - h / 2, width: w, height: h,
        }, false);
        let divOuter = this.createTag('div', {}, false);
        let style = {
            'display': 'flex',
            'align-items': 'center',
            // 'align-self': 'center',
            'justify-content': 'flex-start',
            'padding': '0 15px',
            // 'justify-content': 'flex-end',
            'width': `${w}px`,
            'height': `1px`,
            // 'user-select': 'none',
            'padding-top': `${0.5 * h}px`,
        };
        for (let k in style) {
            divOuter.style.setProperty(k, style[k]);
        }
        let divInner = this.createTag('div', {}, false);
        style = {
            'display': 'inline-block',
            // 'user-select': 'none',
            'font-family': 'sketchica',
            'font-weight': 800,
            'letter-spacing': '3px',
            // 'font-weight': 'bold',
            'font-size': '14px',
            'overflow-wrap': 'normal',
            // 'color': '#333333',
            'color': '#ffffff',
        }
        for (let k in style) {
            divInner.style.setProperty(k, style[k]);
        }
        divInner.innerText = text;
        divOuter.appendChild(divInner);
        foreign.appendChild(divOuter);
        return foreign;
    },
};

let reactiveGraph = {
    driver: {
        points: [
            {x: 10, y: 5},
            {x: 60, y: 20},
            {x: 75, y: 15},
            {x: 100, y: 45},
            {x: 30, y: 10},
        ],
    },
    viewLayer: {
        points:[],
        lines: [],
    },
    create() {
        let self = this;

        for (let i = 0; i < this.driver.points.length - 1; i++) {
            let point1 = this.driver.points[i];
            let point2 = this.driver.points[i + 1];
            let line = gSpace.createLine(point1.x, point1.y, point2.x, point2.y, {'stroke-width': 2});
            this.viewLayer.lines.push(line);
            gSpace.palette.appendChild(line);
        }

        for (let i = 0; i < this.driver.points.length; i++) {
            let point = this.driver.points[i];
            let circle = gSpace.createCircle(point.x, point.y, 6, {'stroke': '#EEEEEE', 'stroke-width': 2});
            this.viewLayer.points.push(circle);
            let view = new ViewGroup().append(circle).addListener(() => {
                let x = parseInt(self.viewLayer.points[i].getAttribute('cx'));
                let y = parseInt(self.viewLayer.points[i].getAttribute('cy'));
                if (i === 0) {
                    self.viewLayer.lines[i].setAttribute('x1', x);
                    self.viewLayer.lines[i].setAttribute('y1', y);
                } else if (i === self.driver.points.length - 1) {
                    self.viewLayer.lines[i - 1].setAttribute('x2', x);
                    self.viewLayer.lines[i - 1].setAttribute('y2', y);
                } else {
                    self.viewLayer.lines[i - 1].setAttribute('x2', x);
                    self.viewLayer.lines[i - 1].setAttribute('y2', y);
                    self.viewLayer.lines[i].setAttribute('x1', x);
                    self.viewLayer.lines[i].setAttribute('y1', y);
                }
            });
            gSpace.palette.appendChild(circle);
            gSpace.groups.set(circle.id, view);
            gSpace.bind(circle);
        }

    },

};

let graph = {
    createNode(x, y, name) {
        let settings = {
            lineWidth: 120,
            lineHeight: 30,
        };
        let rect = gSpace.createRect(x, y, settings.lineWidth, settings.lineHeight, 5, {'fill': '#a3cf62'});
        let port = gSpace.createCircle(x - settings.lineWidth * 0.5, y, 6, {'stroke': '#EEEEEE', 'stroke-width': 2});
        let text = gSpace.createText(x, y, settings.lineWidth - 20, settings.lineHeight, name);
        let view = new ViewGroup().append(rect).append(text).append(port);
        gSpace.palette.appendChild(rect);
        gSpace.palette.appendChild(text);
        gSpace.palette.appendChild(port);
        gSpace.groups.set(rect.id, view);
        gSpace.bind(rect);
    },
};