function JPoint(x, y) {
    this.x = x;
    this.y = y;
}

function JLine(p0, p1) {
    this.p0 = p0;
    this.p1 = p1;
}

let wireFrame = {
    get(o, s) {
        return parseFloat(o.getAttribute(s));
    },
    inBox(x, y, px, py, w, h) {
        return ((px < x) && (x < (px + w))) && ((py < y) && (y < (py + h)));
    },
    planeCross(v0, v1) {
        return v0.x * v1.y - v1.x * v0.y;
    },
    lineCross(L0, L1) {
        if ((L0.p1.y - L0.p0.y) * (L1.p1.x - L1.p0.x) === (L1.p1.y - L1.p0.y) * (L0.p1.x - L0.p0.x)) return false;
        return (wireFrame.planeCross(new JPoint(L1.p0.x - L0.p0.x, L1.p0.y - L0.p0.y), new JPoint(L0.p1.x - L0.p0.x, L0.p1.y - L0.p0.y)) * wireFrame.planeCross(new JPoint(L1.p1.x - L0.p0.x, L1.p1.y - L0.p0.y), new JPoint(L0.p1.x - L0.p0.x, L0.p1.y - L0.p0.y)) < 0) && (wireFrame.planeCross(new JPoint(L0.p0.x - L1.p0.x, L0.p0.y - L1.p0.y), new JPoint(L1.p1.x - L1.p0.x, L1.p1.y - L1.p0.y)) * wireFrame.planeCross(new JPoint(L0.p1.x - L1.p0.x, L0.p1.y - L1.p0.y), new JPoint(L1.p1.x - L1.p0.x, L1.p1.y - L1.p0.y)) < 0);
    },
    select(group, frame) {
        let _r = [];
        let frameX = parseFloat(frame.style.left.slice(0, -2));
        let frameY = parseFloat(frame.style.top.slice(0, -2));
        let frameWidth = parseFloat(frame.style.width.slice(0, -2));
        let frameHeight = parseFloat(frame.style.height.slice(0, -2));
        for (let i in group) {
            let line = group[i];
            let p1TF = wireFrame.inBox(wireFrame.get(line, 'x1'), wireFrame.get(line, 'y1'), frameX, frameY, frameWidth, frameHeight);
            let p2TF = wireFrame.inBox(wireFrame.get(line, 'x2'), wireFrame.get(line, 'y2'), frameX, frameY, frameWidth, frameHeight);
            if (p1TF || p2TF) {
                _r.push(i);
                continue;
            }
            let jPoint0 = new JPoint(frameX, frameY);
            let jPoint1 = new JPoint(frameX + frameWidth, frameY);
            let jPoint2 = new JPoint(frameX, frameY + frameHeight);
            let jPoint3 = new JPoint(frameX + frameWidth, frameY + frameHeight);
            let jLine0 = new JLine(jPoint0, jPoint1);
            let jLine1 = new JLine(jPoint0, jPoint2);
            let jLine2 = new JLine(jPoint1, jPoint3);
            let jLine3 = new JLine(jPoint2, jPoint3);
            let jLine = new JLine(new JPoint(wireFrame.get(line, 'x1'), wireFrame.get(line, 'y1')), new JPoint(wireFrame.get(line, 'x2'), wireFrame.get(line, 'y2')));
            if (wireFrame.lineCross(jLine0, jLine) || wireFrame.lineCross(jLine1, jLine) || wireFrame.lineCross(jLine2, jLine) || wireFrame.lineCross(jLine3, jLine)) {
                _r.push(i);
            }
        }
        return _r;
    }
}

export {JPoint, JLine, wireFrame}