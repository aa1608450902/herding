let $get  = id => document.getElementById(id);
let $view = tag => document.createElement(tag);
let Get   = (obj, key, df) => obj.hasOwnProperty(key) ? obj[key] : df;

let counter = 0;

let JsonView = {
    parse(id, proto) {
        JsonView.recurse($get(id), proto);
    },
    recurse(root, proto) {
        let el = JsonView.create(root, proto);
        if (proto.hasOwnProperty('children')) {
            for (let child of proto.children) {
                JsonView.recurse(el, child);
            }
        }
    },
    create(root, attr) {
        let type = attr['ViewType'];
        let container = null;
        console.info(type);
        let isView = type.slice(-4) === 'View';
        if (isView) {
            let viewName = type.slice(0, -4);
            if (viewName === 'Text') {
                container = JsonView.createTextView(attr);
            } else if (viewName === 'Image') {
                container = JsonView.createImageView(attr);
            } else if (viewName === '') {
                container = JsonView.genericContainer(attr);
            }
            if (container !== null) {
                root.appendChild(container);
            }
            return container;
        }
        let isLayout = type.slice(-6) === 'Layout';
        if (isLayout) {
            let layoutName = type.slice(0, -6);
            if (layoutName === 'Linear') {
                container = JsonView.createLinearLayout(attr);
            }
            if (container !== null) {
                root.appendChild(container);
            }
            return container;
        }
        throw new Error(`Unknown view type(${type})!`);
    },
    createTextView(attr) {
        let options = {
            text: "",
            color: "#000000",
            AlignHorizontal: "center",
            AlignVertical: "center",
            FontFamily: "Helvetica",
            FontSize: 12,
            FontWeight: "normal",
        }
        Object.assign(options, attr);
        let container = JsonView.genericContainer(options);
        container.style.color  = options.color;
        container.style.fontSize   = `${options.FontSize}px`;
        container.style.fontFamily = `${options.FontFamily}`;
        container.style.fontWeight = `${options.FontWeight}`;
        if (options.FontFamily === 'sketchica') {
            container.style.letterSpacing = `1px`;
        }
        let textArea = $view('span');
        textArea.innerText = options.text;
        container.appendChild(textArea);
        container.style.display = 'flex';
        if (options.AlignHorizontal === 'start') {
            container.style.justifyContent = 'flex-start';
        } else if (options.AlignHorizontal === 'end') {
            container.style.justifyContent = 'flex-end';
        } else {
            container.style.justifyContent = 'center';
        }
        if (options.AlignVertical === 'start') {
            container.style.alignItems = 'flex-start';
        } else if (options.AlignVertical === 'end') {
            container.style.alignItems = 'flex-end';
        } else {
            container.style.alignItems = 'center';
        }
        return container;
    },
    createImageView(attr) {
        let container = JsonView.genericContainer(attr);
        container.style.backgroundImage = `url("${attr.source}")`;
        container.style.backgroundRepeat = 'no-repeat';
        container.style.backgroundSize = `100% 100%`;
        return container;
    },
    createLinearLayout(attr) {
        let options = {
            width: "100%",
            height: "100%",
            direction: 'vertical',
            mode: 'normal',
            radius: 0,
            opacity: 1,
        };
        Object.assign(options, attr);
        let container = JsonView.genericContainer(options);
        container.style.display = 'flex';
        if (options.direction === 'vertical') {
            container.style.flexDirection = 'column';
        }
        if (options.mode === 'between') {
            container.style.justifyContent = 'space-between';
        } else if (options.mode === 'around') {
            container.style.justifyContent = 'space-around';
        }
        return container;
    },
    genericContainer(attr) {
        let container = $view('div');
        container.id = `${attr['ViewType']}-${counter++}`;
        let options = {width: "100%", height: "100%", radius: 0, opacity: 1,};
        Object.assign(options, attr);
        container.style.position = 'relative';
        container.style.width  = options.width;
        container.style.height = options.height;
        container.style.borderRadius = `${options.radius}px`;
        container.style.opacity  = options.opacity;
        if (options.hasOwnProperty('border')) {
            container.style.border = options.border;
        }
        if (options.hasOwnProperty('margin')) {
            container.style.margin = options.margin;
        }
        if (options.hasOwnProperty('BackgroundImage')) {
            container.style.backgroundImage = `url("${options.BackgroundImage}")`;
            container.style.backgroundRepeat = 'no-repeat';
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = `center center`;
        } else if (options.hasOwnProperty('BackgroundColor')) {
            container.style.backgroundColor = options.BackgroundColor;
        }
        if (options.hasOwnProperty('click')) {
            container.style.cursor = 'pointer';
            container.onclick = () => {
                ajax.post(`channel/measure`, {
                    uid: options['click'],
                    time: new Date().getTime(),
                }, resp => {
                    alert(`From [${options['click']}]: ${resp}`);
                }, err => {
                    alert(`Error [${options['click']}]: ${err}`);
                });
            }
        }
        return container;
    },
}



const SvgNs = 'http://www.w3.org/2000/svg'
let $SvgView = tag => {
    let _r = document.createElementNS(SvgNs, tag);
    _r.setAttribute('xmlns', SvgNs);
    return _r;
};
let $foreign = () => {
    let _r = document.createElementNS(SvgNs, 'foreignObject');
    _r.setAttribute("xmlns", SvgNs);
    return _r;
}
let Assign = (o, options) => {
    for (let k in options) {
        o.setAttribute(k, options[k]);
    }
}
let Style = (o, options) => {
    for (let k in options) {
        o.style.setProperty(k, options[k]);
    }
}

let gWidth = 400;
let gHeight= 380;

let JsonViewSvg = {
    root: null,
    parse(root, proto) {
        JsonViewSvg.root = $get(root);
        JsonViewSvg.recurse(JsonViewSvg.root, proto);
    },
    recurse(parent, proto) {
        if (proto.hasOwnProperty('children')) {
            for (let child of proto.children) {
                JsonViewSvg.recurse(JsonViewSvg.root, child);
            }
        } else {
            JsonViewSvg.create(JsonViewSvg.root, proto)
        }
    },
    create(parent, attr) {
        let type = attr['ViewType'];
        let container = null;
        let isView = type.slice(-4) === 'View';
        if (isView) {
            let viewName = type.slice(0, -4);
            if (viewName === 'Text') {
                JsonViewSvg.createTextView(attr);
            } else if (viewName === 'Image') {
                JsonViewSvg.createImageView(attr);
            } else if (viewName === '') {
                JsonViewSvg.createView(attr);
            }
            if (container !== null) {
                parent.appendChild(container);
            }
            return container;
        }
        // let isLayout = type.slice(-6) === 'Layout';
        // if (isLayout) {
        //     let layoutName = type.slice(0, -6);
        //     if (layoutName === 'Linear') {
        //         container = JsonViewSvg.createLinearLayout(attr);
        //     }
        //     if (container !== null) {
        //         parent.appendChild(container);
        //     }
        //     return container;
        // }
        throw new Error(`Unknown view type(${type})!`);
    },
    _mapFlexAlign(type) {
        if (type === 'start') {
            return 'flex-start';
        } else if (type === 'end') {
            return 'flex-end';
        } else {
            return 'center';
        }
    },
    createTextView(attr) {
        let options = {
            x: "0px", y: "0px",
            text: "",
            width: "10px",
            height: "1px",
            color: '#333333',
            AlignHorizontal: "center",
            AlignVertical: "center",
            FontFamily: "sketchica",
            FontSize: 18,
            FontWeight: "bold",
        };
        Object.assign(options, attr);
        let foreign = $foreign();
        let outer = $view('div');
        let inner = $view('div');
        Assign(foreign, {
            x: "0px", y: "0px",
            width: gWidth, height: gHeight,
            "pointer-events": "none",
        });
        Style(foreign, {
            position: 'relative',
        });
        Style(outer, {
            'padding-top': `${options.y}`,
            'margin-left': `${options.x}`,
            'display': 'flex',
            'justify-content': JsonViewSvg._mapFlexAlign(options.AlignHorizontal),
            'align-items': JsonViewSvg._mapFlexAlign(options.AlignVertical),
            'width': options.width,
            'height': options.height,
            // 'user-select': 'none',
        });
        // JsonViewSvg._setBorder(outer, options);
        Style(inner, {
            'color': options.color,
            'display': 'inline-block',
            'zoom': 1,
            // 'user-select': 'none',
            'font-size': `${options.FontSize}px`,
            'font-weight': options.FontWeight,
            'font-family': options.FontFamily,
            'overflow-wrap': 'normal',
        });
        inner.innerText = options.text;
        outer.appendChild(inner);
        foreign.appendChild(outer);
        let group = $SvgView('g');
        let back = $SvgView('rect');
        Assign(back, {
            x: options.x.slice(0, -2), y: options.y.slice(0, -2),
            width: options.width, height: options.height,
            fill: "rgba(255,255,255,0)",
        });
        if (options.hasOwnProperty('radius')) {
            back.setAttribute('rx', options.radius.slice(0, -2));
            back.setAttribute('ry', options.radius.slice(0, -2));
        }
        JsonViewSvg._setBorder(back, options);
        JsonViewSvg._setBackgroundColor(back, options);
        group.appendChild(back);
        group.appendChild(foreign);
        JsonViewSvg._bind(back, options);
        JsonViewSvg.root.appendChild(group);
        // return group;
    },
    createImageView(attr) {
        let options = {
            x: "0px", y: "0px",
            width: "10px", height: "1px",
        };
        Object.assign(options, attr);
        let image = $SvgView('image');
        Assign(image, {
            x: options.x.slice(0, -2),
            y: options.y.slice(0, -2),
            width: options.width.slice(0, -2),
            height: options.height.slice(0, -2),
            href: options.source,
        });
        JsonViewSvg._setBorder(image, options);
        JsonViewSvg._setBackgroundColor(image, options);
        if (options.hasOwnProperty('radius')) {
            image.setAttribute('rx', options.radius.slice(0, -2));
            image.setAttribute('ry', options.radius.slice(0, -2));
        }
        JsonViewSvg._bind(image, options);
        JsonViewSvg.root.appendChild(image);
    },
    createView(attr) {
        let options = {
            x: "0px", y: "0px",
            width: "10px",
            height: "1px",
        };
        Object.assign(options, attr);
        let view = $SvgView('rect');
        Assign(view, {
            x: options.x.slice(0, -2), y: options.y.slice(0, -2),
            width: options.width.slice(0, -2), height: options.height.slice(0, -2),
        });
        JsonViewSvg._setBorder(view, options);
        JsonViewSvg._setBackgroundColor(view, options);
        if (options.hasOwnProperty('radius')) {
            view.setAttribute('rx', options.radius.slice(0, -2));
            view.setAttribute('ry', options.radius.slice(0, -2));
        }
        JsonViewSvg._bind(view, options);
        JsonViewSvg.root.appendChild(view);
    },
    _setBorder(obj, options) {
        if (options.hasOwnProperty('border')) {
            let borderArray = options.border.split(' solid ');
            obj.setAttribute('stroke', borderArray[1]);
            obj.setAttribute('stroke-width', borderArray[0].slice(0, -2));
        }
    },
    _setBackgroundColor(obj, options) {
        if (options.hasOwnProperty('BackgroundColor')) {
            obj.setAttribute('fill', options.BackgroundColor);
        }
    },
    _bind(obj, options) {
        if (options.hasOwnProperty('click')) {
            obj.style.cursor = 'pointer';
            obj.addEventListener('click', () => {
                ajax.post(`channel/measure`, {
                    uid: options['click'],
                    time: new Date().getTime(),
                }, resp => {
                    alert(`From [${options['click']}]: ${resp}`);
                }, err => {
                    alert(`Error [${options['click']}]: ${err}`);
                });
            })
        }
    }
};
