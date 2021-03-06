/**
 * Progetto "linguaggi client side" per master MWT
 * Studente: Di Vincenzo Damiano
 * */
"use strict";
// Reminder vincoli: Generazione dom tramite javascript, no librerie esterne.

function addCssRule(styleNode, selector = 'body', rules = {}, index = -1) {
    // fix upperCase to dashed upper-case version accepted by css
    let keys = Object.keys(rules);
    for (let key of keys) {
        if (key.indexOf('--') === 0) continue; // non considerare le variabili css come maiuscole
        let key_ = key.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
        if (key_ === key) continue;
        rules[key_] = rules[key];
        delete rules[key];
    }

    let rules_str = Object.entries(rules).map(function(kv, i) {
        return '\n    ' + kv[0] + ': ' + kv[1] + ";";
    }).join('; ');

    const rawRule = '' + selector + ' {' + rules_str + '\n}\n\n';
    if (index < 0 || !index && (index !== 0)) index = styleNode.sheet.rules.length;
    console.warn('adding rule:', rawRule);
    styleNode.sheet.insertRule(rawRule, index);
}
function addCssRule0(styleNode, selector = 'body', rules = [], index = -1) {
    const rawRule = '' + selector + ' {\n' + rules.join(';\n   ') + '}\n\n';
    if (index < 0 || !index && (index !== 0)) index = styleNode.sheet.rules.length;
    styleNode.sheet.insertRule(rawRule, index);
}


function makeCssConicGradient(colors, degrees, overlaps) {
    let deg = 0, i = 0;
    let slices = [];
    while (deg < 360) {
        slices.push(colors[i] + ' ' + (deg - overlaps[i]) +'deg ' + (deg + degrees[i]) + 'deg');
        deg += degrees[i];
        i = (i + 1) % degrees.length;
    }
    return 'conic-gradient(' + slices.join(',  ') + ')';
}

function GuiSpinner() {
    if (!GuiSpinner.didFirstInit) {
        GuiSpinner.didFirstInit = true;
        GuiSpinner.makesvg = (tag) => document.createElementNS("http://www.w3.org/2000/svg", tag);
    }
    this.svg = GuiSpinner.makesvg('svg');
    this.svg.setAttribute("width", "100%"); // as attributes shorthand
    this.svg.setAttribute("height", "100%");
    this.svg.setAttribute("viewBox", "-10 -10 220 220");
    this.circle = GuiSpinner.makesvg('circle');
    this.circle.classList.add('torusSegment');
    this.circle.setAttribute("cx", "100");
    this.circle.setAttribute("cy", "100");
    this.circle.setAttribute("r", "100");
    this.text = GuiSpinner.makesvg('text');
    this.text.classList.add('torusText');
    this.text.setAttribute("x", "100");
    this.text.setAttribute("y", "100");
    this.text.setAttribute("dy", ".3em");
    this.svg.appendChild(this.circle);
    this.svg.appendChild(this.text);

    this.init = function (min = 0, max = 100, digits = 0, reverseFill = false,
                          startRGB = {r:0, g:255, b:0}, endRGB = {r:255, g:0, b:0},
                          prefix = '', postfix = '') {
        this.options = { min, max, digits, reverseFill, startRGB, endRGB, prefix, postfix };
        this.setValue(min);
    }

    this.setValue = function (value0) {
        const o = this.options;
        let perc = +(value0-o.min)/(o.max-o.min);
        perc = Math.min(1, Math.max(0, o.reverseFill ? perc : 1 - perc));
        const digits = 10 ** o.digits; // equals to Math.pow(10, o.digits);
        const val = value0.toFixed(o.digits) // or Math.floor(value0 * digits) / digits;
        const R = Math.floor((1-perc)*o.startRGB.r + (perc)*o.endRGB.r);
        const G = Math.floor((1-perc)*o.startRGB.g + (perc)*o.endRGB.g);
        const B = Math.floor((1-perc)*o.startRGB.b + (perc)*o.endRGB.b);
        const rgb = `rgb(${R}, ${G}, ${B})`;
        this.circle.style.stroke = rgb;
        this.text.style.fill = rgb;
        const c = Math.PI * 200; // 200 = diametro
        this.circle.style.strokeDasharray = (perc * c) + ' ' + (1 - perc) * c;
        this.circle.style.strokeDashoffset = (0.25 - (1-perc)/2) * c + '';
        this.text.innerHTML = o.prefix + val + o.postfix;
    }
}

function htmlMaker() {
    document.title = "Veg Snek"
    const table = document.createElement('table');
    const options = document.createElement('section');
    const style = document.createElement('style');
    const gameSection = document.createElement('section');
    const tableWrapper = document.createElement('div');
    const blackScreen = document.createElement('div');
    blackScreen.id = "blackscreen";
    gameSection.id = "game";
    document.body.appendChild(style);
    document.body.appendChild(options);
    options.style.margin = '10px 0';
    // document.body.appendChild(controls);
    document.body.appendChild(gameSection);
    document.body.appendChild(blackScreen);

    const gameendimg = document.createElement('img');
    const gameendtext = document.createElement('h1');
    const gameendconfirm = document.createElement('button');
    blackScreen.appendChild(gameendtext);
    blackScreen.appendChild(gameendimg);
    blackScreen.appendChild(gameendconfirm);
    gameendconfirm.innerText = "Play again";

    // gameSection.style.flexGrow = '1';
    gameSection.style.height = '100%';
    gameSection.style.overflow = 'hidden';
    const timeOverOutput = new GuiSpinner();
    const scoreOutput = new GuiSpinner();
    const left_bar = document.createElement('div'), right_bar = document.createElement('div');
    left_bar.appendChild(timeOverOutput.svg);
    right_bar.appendChild(scoreOutput.svg);
    left_bar.classList.add('left-bar');
    right_bar.classList.add('right-bar');
    tableWrapper.classList.add('tableWrapper');
    tableWrapper.appendChild(table);
    gameSection.appendChild(left_bar);
    gameSection.appendChild(tableWrapper);
    gameSection.appendChild(right_bar);
    let size = 10;
    let multiplierSize = 4;
    let animationspeed = 2;
    let as_var = "var(--game-speed)";
    function SpawnableChance(constructor, chance){
        this.constructorReference = constructor;
        this.name = constructor.name.replace(/([A-Z]+)/g, ' $1').trim(); // aggiunge spazi prima delle maiuscole
        this.chance = chance
        this.input = null;
    }
    const spawnables = [new SpawnableChance(Fruit, 0.55), new SpawnableChance(Deadly, 0.25),
        new SpawnableChance(Trap, 0.05), new SpawnableChance(MovementTrap, 0.15)];

    addCssRule(style, '*', {boxSizing: 'border-box'});
    addCssRule(style, 'circle.torusSegment', {strokeWidth: '20px', fill: 'transparent'});
    addCssRule(style,'text.torusText', {textAnchor: 'middle', fontSize: '70pt', strokeWidth: '.1px'});
    addCssRule(style, '.input-wrapper', {position: 'relative', display: 'flex', flexFlow: 'column', textAlign: 'center'});
    addCssRule(style, '.input-wrapper input[type="number"]', {paddingLeft: '30px', textAlign: 'center'});
    addCssRule(style, '.input-wrapper input[type="number"]::-webkit-inner-spin-button', {flexBasis: '30px'});
    addCssRule(style, 'section', {display: 'flex', flexFlow: 'row', width: '100%', alignItems: 'center', alignContent: 'flex-end', justifyContent: 'space-evenly'});
    addCssRule(style, '[appendUnit]::after', {content: 'attr(appendUnit)', position: 'absolute', top: '50%', right: '10px'});

    addCssRule(style, 'label.input-wrapper:hover::after, label.input-wrapper:focus-within::after', {content: '""'});

    addCssRule(style, '#game .left-bar, #game .right-bar', {flexGrow: '1', flexBasis: '0px', padding: '30px', height: '100%'});
    addCssRule(style, '.tableWrapper', {display: 'flex', flexGrow: '0', height: '100%', flexFlow: 'column'});
    addCssRule(style, 'table', {width: 'auto', background: 'black', tableLayout: 'fixed', margin: 'auto'});
    addCssRule(style, 'table', {background: 'white', display: 'flex', flexFlow: 'column'});
    addCssRule(style, 'tr', {flexBasis: '0', flexGrow: '1', display: 'flex', flexFlow: 'row', height: '0'});
    addCssRule(style, 'td', {flexBasis: '0', flexGrow: '1', border: '0.5px solid black', overflow: 'hidden', padding: '0'});
    addCssRule(style, 'td>img', {width: '100%', height: '100%', position: 'absolute',
     //   zIndex: 1
    }); // se snake mangia una bomba li sovrappongo mostrando sopra la bomba

    addCssRule(style, 'body', {width: '100vw', height: '100vh', display: 'flex', flexFlow: 'column',
        flexWrap: 'nowrap', padding: '0', margin: '0', border: 'solid transparent', borderWidth: '0px 10px'});
    addCssRule(style, 'button', {
        fontFamily: "'VT323', monospace",
        background: '#7C7C7C',
        borderBottom: '6px inset rgba(0,0,0,.5)',
        borderLeft: '6px inset rgba(0,0,0,.5)',
        borderRight: '6px inset rgba(255,255,255,.5)',
        borderTop: '6px inset rgba(255,255,255,.5)',
        color: 'white',
        cursor: 'pointer',
        display: 'inline-block',
        fontSize: '1.3rem',
        // margin: '1rem',
        minWidth: '200px',
        padding: '.3rem',
        textTransform: 'uppercase',
        width: 'auto'
    });
    addCssRule(style, '.danger', {background: '#881400'});
    addCssRule(style, '.danger:hover', {background: '#A81000', outline: 'none'});
    addCssRule(style, '.success', {background: '#005800'});
    addCssRule(style, '.success:hover', {background: '#006800', outline: 'none'});
    addCssRule(style, '.muted', {background: '#7C7C7C'});
    addCssRule(style, '.muted:hover', {background: '#BCBCBC', outline: 'none'});

    addCssRule(style, '.top, .left, .bottom, .right', {display: 'flex', border: '0px solid red',
        borderimage: 'url(http://i.stack.imgur.com/wLdVc.png) 2 round', height: '100%', width: '100%', margin: 'auto'});



    addCssRule(style, '.top::after, .left::after, .bottom::after, .right::after',
        {background: 'white', display: 'flex', flexGrow: '1', margin: (size + 1) + 'px', content: '""', borderRadius: '50%'});
    addCssRule(style, '#blackscreen', {position: 'absolute', left: '0', display: 'none', flexFlow: 'column',
        background: '#00000077', height: '100vh', width: '100vw', padding: '5vh 5vw', zIndex: 2});
    addCssRule(style, '#blackscreen >img', {flexGrow: '5', flexBasis: '0', height: '0'});
    addCssRule(style, 'img', {pointerEvents: 'none'});

    addCssRule(style, '#blackscreen >*', {margin: 'auto'});
    addCssRule(style, '#blackscreen >h1', {fontFamily: 'sans-serif', fontWeight: 'bolder', fontSize: '70px', textTransform: 'uppercase',
        flexGrow: '1', display: 'flex', flexBasis: '0',
    textShadow: 'rgb(85 0 0) -5px 5px 0px, rgb(170 0 0) -10px 10px 0px, rgb(255 0 0) -15px 15px 0px, rgb(0 0 0 / 6%) 2px 0px 6px'});
    addCssRule(style, '#blackscreen.won, #blackscreen.lost', { display:'flex'});
    addCssRule(style, '#blackscreen.won >h1', { textShadow: '#e0e0e0 2px -2px 0, #e0e0e0 -0px 1px 0, rgb(0 85 0) -5px 5px 0px, rgb(0 170 0) -10px 10px 0px, rgb(0 255 0) -15px 15px 0px, rgb(0 0 0 / 6%) 2px 0px 6px'});
    // addCssRule(style, '#blackscreen::after', {content:'""', 'flex-grow:1'});
    addCssRule(style, '#blackscreen >button', { width: '33%', padding: '20px', color: 'white', outline: 'none',
        background: 'dodgerblue', border: '2px solid blue', borderRadius: '9999px', marginTop: '20px', fontSize: '30px'});

    // head, tail
    addCssRule(style, 'div.snake.head', {
        position: 'relative',
        animation: 'none',
        border: '5px solid black',
        width: '66.66666%',
        height: '66.66666%',
        borderRadius: 0,
        margin: 'auto',
        top: 'initial',
        left: 'initial'});
    addCssRule(style, 'div.snake.head', { transform: 'rotate(45deg)' });
    addCssRule(style, 'div.snake.head.lr, div.snake.head.lt, div.snake.head.lb', { marginLeft: 0 });
    addCssRule(style, 'div.snake.head.rt, div.snake.head.rl, div.snake.head.rb', { marginRight: 0 });
    addCssRule(style, 'div.snake.head.tl, div.snake.head.tr, div.snake.head.tb', { marginTop: 0 });
    addCssRule(style, 'div.snake.head.br, div.snake.head.bl, div.snake.head.bt', { marginBottom: 0 });
    addCssRule(style, 'div.snake.head.bl, div.snake.head.tr, div.snake.head.lt, div.snake.head.rb', {
        transform: 'rotate(' + (90 + 45/2) + 'deg)' });
    addCssRule(style, 'div.snake.head.br, div.snake.head.tl, div.snake.head.lb, div.snake.head.rt', {
        transform: 'rotate(' + (90 - 45/2) + 'deg)' });


        /*
            addCssRule(style, '.left', '.right', {height: 'calc(50% - 4px)', 'top: 'calc(50% - 2px)'});
            addCssRule(style, '.top', '.bottom', {width: 'calc(50% - 4px)', 'left: 'calc(50% - 2px)'});*/
        /*
         addCssRule(style, '.top.left', '.top.right', '.bottom.left', '.bottom.right', {height: 'calc(50% - 2px)]) ;//', 'width: 'calc(50% - 2px)'});
        /** /addCssRule(style, '.top.left', '.top.right', '.bottom.left', '.bottom.right', {width: '100%', 'height:100%'});
        /** /addCssRule(style, '.left.top', {margin-left: 'calc(-50% - 2px);', 'margin-top: 'calc(-50% - 2px)'});
        /** /addCssRule(style, '.left.bottom', {margin-left: 'calc(-50% - 2px);', 'margin-top: 'calc(50% - 2px)'});
        /** /addCssRule(style, '.right.top', {margin-left: 'calc(50% - 2px);', 'margin-top: 'calc(-50% - 2px)'});
        /** /addCssRule(style, '.right.bottom', {margin-left: 'calc(50% - 2px);', 'margin-top: 'calc(-50% - 2px)'});
        addCssRule(style, '.top.bottom', {margin: 'auto', 'width:0', 'top:0'});
        addCssRule(style, '.left.right', {margin: 'auto', 'height:0'});
        addCssRule(style, '.top.bottom', {border-left-width: '4px'});
        addCssRule(style, '.left.right', {border-top-width: '4px', 'animation: 'animationlr 5s linear 0s infinite normal;'});
        addCssRule(style, '.left.top', {border-bottom-width: '4px', 'border-right-width: '4px'});
        addCssRule(style, '.left.bottom', {border-top-width: '4px', 'border-right-width: '4px'});
        addCssRule(style, '.right.top', {border-bottom-width: '4px', 'border-left-width: '4px'});
        addCssRule(style, '.right.bottom', {border-top-width: '4px', 'border-left-width: '4px'});*/
        // modalit?? background
        addCssRule(style, 'td', {position: 'relative'});
    addCssRule(style, '.left, .right, .top, .bottom', {position: 'absolute'});
    // corners
    addCssRule(style, '.left.top, .left.bottom, .right.top, .right.bottom', {
        // 'width: '100%', 'height: '100%,
        width: 'calc(100% + ' + size + 'px + 1.15px)',
        height: 'calc(100% + ' + size + 'px + 1.15px)',
    transform: 'rotate(22.5deg)',
    backgroundImage: makeCssConicGradient(['red', 'black'], [90/2, 90/2], [0, 0]), borderRadius: '50%'});
    addCssRule(style, '.left.top, .left.bottom', {left: 'calc(-100% + ' + size + 'px - 1.15px)'});
    addCssRule(style, '.right.top, .right.bottom', {left: 'calc(50% - ' + size/2 + 'px)'});
    addCssRule(style, '.top.left, .top.right', {top: 'calc(-100% + ' + size + 'px - 1.15px)'}); // 0.65 = 0.5 cell border + unknown addition
    addCssRule(style, '.bottom.left, .bottom.right', {top: 'calc(50% - ' + size/2 + 'px)'});
    addCssRule(style, '.lb, .tl, .rt, .br', // clockwise angoli interni
        {animation: 'rotateclock ' + as_var + ' linear 0s infinite normal'}); // rotazione per match colori or: 'scaleX(-1)
    addCssRule(style, '.lt, .tr, .rb, .bl', // .top.left, .bottom.right,
{animation: 'rotateclock ' + as_var + ' linear 0s infinite reverse'}); // rotazione per match colori or: 'scaleX(-1)
    // edges
    addCssRule(style, '.left.right, .rr, .ll', {width: '400%', height: size + 'px', top: 'calc(50% - ' + size/2 + 'px)', left: 'calc(-150% + ' + size*3/4 + 'px)',
    background: 'repeating-linear-gradient(90deg, black, black ' + (100 / multiplierSize / 2) + '%, red ' + (100 / multiplierSize / 2) + '%, red ' + 100 / multiplierSize + '%)'});
    addCssRule(style, '.top.bottom, .tt, .bb', {width: size + 'px', height: '400%', left: 'calc(50% - ' + size/2 + 'px)', top: 'calc(-150% - ' + size*3/4 + 'px)',
    background: 'repeating-linear-gradient(0deg, black, black ' + (100 / multiplierSize / 2) + '%, red ' + (100 / multiplierSize / 2) + '%, red ' + 100 / multiplierSize + '%)'});

    // addCssRule(style, '.right.bottom', {border-top-width: ' + size + 'px, 'border-left-width: ' + size + 'px'});
    const cellsize = size * 3;
    addCssRule(style, 'td', {minWidth: cellsize + 'px', minHeight: cellsize + 'px', maxWidth: cellsize + 'px', maxHeight: cellsize + 'px', flexGrow: '0'});
    addCssRule(style, 'tr', {minHeight: cellsize + 'px', maxHeight: cellsize + 'px', height: cellsize + 'px'});
    addCssRule(style, '.lr, .rr', {animation: 'traslatelr calc(' + as_var + " / " + multiplierSize + ') linear 0s infinite normal'});
    addCssRule(style, '.rl, .ll', {animation: 'traslaterl calc(' + as_var + " / " + multiplierSize + ') linear 0s infinite normal'});
    addCssRule(style, '.tb, .bb', {animation: 'traslatetb calc(' + as_var + " / " + multiplierSize + ') linear 0s infinite normal'});
    addCssRule(style, '.bt, .tt', {animation: 'traslatebt calc(' + as_var + " / " + multiplierSize + ') linear 0s infinite normal'});
    document.body.setAttribute('playing', '0');
    addCssRule(style, 'body[playing="1"] .hideonplay', {display: 'none'});
    addCssRule(style, 'body[playing="0"] .showonplay', {display: 'none'});

    addCssRule(style, '.top', {marginTop: '0'});
    addCssRule(style, '.bottom', {marginBottom: '0'});
    addCssRule(style, '.left', {marginLeft: '0'});
    addCssRule(style, '.right', {marginRight: '0'});
    addCssRule(style, 'td', {display: 'flex'});
/*
    addCssRule(style, 'td', ['position: relative']);
    addCssRule(style, '.top, .left, .bottom, .right', ['width: 300%', 'position: absolute', 'left: calc(-100% + 2px);', 'top:calc(50% - 2px)']);*/
    style.sheet['insertRule']('@keyframes traslatelr {\n' +
        '  0%   {background-color:red;} \n' +
        // '  25%  {background-color:yellow; }\n' +
        // '  50%  {background-color:blue; }\n' +
        // '  75%  {background-color:green; }\n' +
        '  100% {background-color:red; transform: translate(25%, 0); }\n' +
        '}', 0);
    style.sheet['insertRule']('@keyframes traslaterl {\n' +
        '  0%   {background-color:red;} \n' +
        // '  25%  {background-color:yellow; }\n' +
        // '  50%  {background-color:blue; }\n' +
        // '  75%  {background-color:green; }\n' +
        '  100% {background-color:red; transform: translate(-25%, 0); }\n' +
        '}', 0);
    style.sheet['insertRule']('@keyframes traslatetb {\n' +
        '  0%   {background-color:red;} \n' +
        // '  25%  {background-color:yellow; }\n' +
        // '  50%  {background-color:blue; }\n' +
        // '  75%  {background-color:green; }\n' +
        '  100% {background-color:red; transform: translate(0, 25%); }\n' +
        '}', 0);
    style.sheet['insertRule']('@keyframes traslatebt {\n' +
        '  0%   {background-color:red;} \n' +
        // '  25%  {background-color:yellow; }\n' +
        // '  50%  {background-color:blue; }\n' +
        // '  75%  {background-color:green; }\n' +
        '  100% {background-color:red; transform: translate(0, -25%); }\n' +
        '}', 0);
    // angoli "specchiati"
    style.sheet['insertRule']('@keyframes rotateclock {\n' +
        '  0%   {background-color:red;  transform: rotate(22.5deg)} \n' +
        // '  25%  {background-color:yellow; }\n' +
        // '  50%  {background-color:blue; }\n' +
        // '  75%  {background-color:green; }\n' +
        '  100% {background-color:red; transform: rotate(382.5deg); }\n' +
        '}', 0);
    // angoli normali

     // fill controls
    var [pauseWrapper, pauseButton, pauseLabel] = makeInputWithLabel('button', null, null, 'Pause');
    pauseButton.innerText = pauseLabel.innerText;
    pauseLabel.parentElement.removeChild(pauseLabel);
    pauseLabel = pauseButton; // fast trick perch?? abbandono la label e metto tutto nel pulsante.
    pauseButton.addEventListener('click', () => {
        if (Game.get().isPaused()) {
            pauseLabel.innerText = 'Pause';
            pauseButton.setAttribute('class', 'muted'); // non uso classList perch?? voglio svuotarlo
            Game.get().resume();
        } else {
            pauseLabel.innerText = 'Resume';
            pauseButton.setAttribute('class', 'success');
            Game.get().pause();
        } });
    pauseWrapper.classList.add('showonplay');
    options.appendChild(pauseWrapper);

    var [wrapper, startStopButton, startLabel] = makeInputWithLabel('button', null, null, 'Play');
    startStopButton.innerText = startLabel.innerText;
    startStopButton.classList.add('success');
    startLabel.parentElement.removeChild(startLabel);
    startLabel = startStopButton; // fast trick perch?? abbandono la label e metto tutto nel pulsante.
    options.appendChild(wrapper);
/*
    var {wrapper, input} = makeControlWithLabel('button', 'Options');
    input.addEventListener('click', () => { game.pause(); options.style.display = 'block'; } );
    options.appendChild(wrapper);*/

    function changeBoardSize() { // closure on variables
        while (table.firstElementChild) table.removeChild(table.firstElementChild);
        Game.get().clean();
        console.log('changeboardsize', heightInput.value, widthInput.value, table);
        for (let i = 0 ; i < +heightInput.value; i++) {
            const row = document.createElement('tr');
            for (let j = 0 ; j < +widthInput.value; j++) {
                const cell = document.createElement('td');
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
    }

    // fill options
    var [wrapper, speedInput] = makeInputWithLabel('input', 'range', animationspeed, 'Turn length');
    speedInput.min = '' + 0.001;
    speedInput.max = '' + 5; // imposta anche automaticamente width dell'elemento
    speedInput.step = 'any';
    addCssRule(style, 'body', {'--game-speed': speedInput.value + "s"});
    speedInput.addEventListener('change', () => {
        // todo: dovrei cancellare la vecchia regola anche se non ?? strettamente necessario perch?? si sovrascrive
        addCssRule(style, 'body', {'--game-speed': speedInput.value + "s"});
        if (Game.get().isRunning()) Game.get().speedChanged();
    });
    // wrapper.classList.add('hideonplay');
    options.appendChild(wrapper);

    let widthInput, heightInput;
    let setupcell = (wrapper, input) => {
        input.min = '' + 2;
        input.max = '' + 100000; // imposta anche automaticamente width dell'elemento
        input.step = '' + 1;
        wrapper.classList.add('hideonplay');
        wrapper.setAttribute('appendUnit', 'cells');
        input.addEventListener('change', changeBoardSize);
        options.appendChild(wrapper);
    };

    setupcell(...([wrapper, widthInput] = makeInputWithLabel('input', 'number', '30', 'Width')));
    setupcell(...([wrapper, heightInput] = makeInputWithLabel('input', 'number', '20', 'Height')));

    changeBoardSize();

    var [wrapper, timeOverInput] = makeInputWithLabel('input', 'number', '180', 'Time');
    timeOverInput.min = '' + 1;
    timeOverInput.max = '' + 99999; // imposta anche automaticamente width dell'elemento
    timeOverInput.step = '1';
    wrapper.classList.add('hideonplay');
    wrapper.setAttribute('appendUnit', 'sec');
    options.appendChild(wrapper);

    var [wrapper, scoreInput] = makeInputWithLabel('input', 'number', '100', 'Score req.');
    scoreInput.max = '' + 99999; // imposta anche automaticamente width dell'elemento
    scoreInput.min = '' + 10;
    scoreInput.step = '10';
    wrapper.classList.add('hideonplay');
    wrapper.setAttribute('appendUnit', 'pts');
    options.appendChild(wrapper);

    var [wrapper, spawnChanceInput] = makeInputWithLabel('input', 'number', '100', 'Spawn chance');
    spawnChanceInput.min = '' + 0;
    spawnChanceInput.max = '' + 100;
    spawnChanceInput.step = '' + 0.01;
    spawnChanceInput.id = "spawn";
    wrapper.setAttribute('appendUnit', '%');
    options.appendChild(wrapper);

    /*
    const spawnables = ['Fruit', 'Deadly', 'Trap', 'Movement trap'];
    const chances = [0.55, 0.125, 0.125, 0.05, 0.15];*/
    for (let i = 0; i < spawnables.length; i++) {
        const name = spawnables[i].name;
        const chance = spawnables[i].chance;
        var [wrapper, input] = makeInputWithLabel('input', 'range', '' + chance*100, name + ' chance');
        spawnables[i].input = input;
        input.min = '' + 0;
        input.max = '' + 100;
        input.step = '' + 0.01;
        input.id = name.replace(' ', '-').toLowerCase();
        // wrapper.setAttribute('appendUnit', '%');
        options.appendChild(wrapper);
    }

    function togglePlay() {
        const game = Game.get();
        if (game.isRunning()) {
            startLabel.innerText = 'Play';
            // pauseWrapper.style.display = 'none';
            startStopButton.setAttribute('class', 'success');
            game.stop();
        }
        else {
            startLabel.innerText = 'Stop';
            pauseLabel.innerText = 'Pause';
            pauseButton.setAttribute('class', 'muted');
            startStopButton.setAttribute('class', 'danger');
            // pauseWrapper.style.display = 'block';
            game.start(table, new Position(+widthInput.value, +heightInput.value), speedInput, +timeOverInput.value, timeOverOutput, +scoreInput.value, scoreOutput, spawnChanceInput, spawnables);
        }
    }

    gameendconfirm.addEventListener('click', togglePlay);
    startStopButton.addEventListener('click', togglePlay);
}

function makeControlWithLabel(maintype = 'input', labelText= '') {
    const input = document.createElement(maintype);
    const label = document.createElement('span');
    const wrapper = document.createElement('label');
    wrapper.classList.add('input-wrapper');
    label.innerText = labelText;
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return {wrapper, input, label};
}

function makeInputWithLabel(maintype = 'input', subtype= 'text', value = '', labelText= '') {
    const {wrapper, input, label} = makeControlWithLabel(maintype, labelText);
    if (input instanceof HTMLInputElement) input.type = subtype;
    if (input instanceof HTMLSelectElement || input instanceof HTMLInputElement) input.value = value;
    return [wrapper, input, label];
}

function onDocumentReady() {
    window.document.body.addEventListener('keydown', (evt) => {
        const game = Game.get();
        if (!game.isRunning() || game.snake.forcedMovement) return;
        let direction;
        switch (evt.key) {
            case 'ArrowUp': direction = 'top'; break;
            case 'ArrowDown': direction = 'bottom'; break;
            case 'ArrowLeft': direction = 'left'; break;
            case 'ArrowRight': direction = 'right'; break;
        }
        if (!game.snake.isValidMovement(direction)) return; // cannot flip backward unless size <= 2
        game.snake.head.nextDirection = direction;
        // game.snake.head.nextDirection = game.nextMovement;
        game.snake.head.updateHtml();
    });
    htmlMaker();
}

// eseguiti prima di onDocumentReady, sono riuniti ed organizzati per un fatto di ordine, la funzione non ?? necessaria.
(function onScriptReading() {
    Game.get = () => Game.game || (Game.game = new Game());
    Fruit.dictionary = ["apple", "apricot", "avocado", "bananas", "beetroot", "bell-pepper", "berry", "blueberry",
        "broccoli", "capsicum", "carrot", "cauliflower", "corn", "dragon-fruit", "eggplant1", "eggplant2", "garlic",
        "lemon", "mango", "okra", "orange", "papaya", "pear", "pomegranate", "pumpkin", "rose-apple", "strawberry", "tomato", "watermelon"];
    Trap.kindCounter = 6;
    MovementTrap.kindCounter = 1;
    Deadly.kindCounter = 6;
    Positionable.mapByID = {}; // propriet?? statiche
    Positionable.getAll = function() { return Object.values(Positionable.mapByID); }
    Positionable.maxID = 0;
    Positionable.getById = function (id) { return Positionable.mapByID['' + id]; }
    Positionable.getByCell = function (node) { return Positionable.mapByID[node.dataset.isFilledWith]; }

    MovementTrap.score = -2;
    Trap.score = -8;
    Fruit.score = +10;

    MovementTrap.findSpawnablePositions
        = Trap.findSpawnablePositions
        = Deadly.findSpawnablePositions
        = Fruit.findSpawnablePositions
        = function () {
        const positions = [];
        const game = Game.get();
        for (let y = 0; y < game.table.rows.length; y++) {
            for (let x = 0; x < game.table.rows[y].cells.length; x++) {
                if (game.table.rows[y].cells[x].dataset.isFilledWith) continue;
                // console.warn(y + ', ' + x +']filledWith: ', game.table.rows[y].cells[x].dataset.isFilledWith)
                positions.push(new Position(x, y));
            }
        }
        return positions;
    }

    Positionable.spawnIfPossible = function(constructor){
        let positions = constructor.findSpawnablePositions();
        let spawnPosition = positions[ Math.floor(Math.random() * positions.length) ];
        // console.log('spawning:', spawnable, 'at', spawnPosition, ' positions:', positions, 'index-sample:', Math.random() * positions.length);
        if (!positions.length) return; // non esistono caselle vuote
        return new constructor(spawnPosition); // $ note: unconventional usage of a constructor
    }




    let positionableInstance = new Positionable();
    let subclasses =  [SnakeSegment, Deadly, Fruit, Trap, MovementTrap];

    // equivalente a this.getCellHtml interno al costruttore Positionable, ma setta la funzione solo su questa istanza.
    positionableInstance.getCellHtml = function() {
        if (!this.position) return null;
        return Game.get().table.rows[this.position.y].cells[this.position.x];
    };
    for (let Subclass of subclasses) {
        makeItExtend(Subclass, Positionable, positionableInstance);
        // da questo punto non ho pi?? necessit?? di modificare o estendere i loro prototipi.
        Subclass.prototype = Object.freeze(Subclass.prototype);
    }

    document.addEventListener('DOMContentLoaded', onDocumentReady, false);
})(); // dichiarazione ed esecuzione immediata

// "estende" il timer nativo aggiungendo la capacit?? di sospendere e riprendere una azione in coda
// senza perdere traccia del tempo rimanente.
function MyTimeout(action, time, repeat = false, firstTimer = null){
  this.initialTime = time;
  this.timeLeft = null != firstTimer ? firstTimer : time;
  this.timeStart = new Date().getTime();
  this.isExpired = false;
  this.executionCount = 0;
  // this.timeEnd = this.timeStart + time;
  // this.timerID = setTimeout(action, time);
  const actionAugmented = () => {
      // decido se preparare una prossima esecuzione e aggiorno lo stato
      if ((this.isExpired = !repeat)){ // assegnamento e controllo in uno statement
          this.cancel();
      } else {
          // NB: non uso setInterval perch?? se ho un interval ogni 5 secondi, e lo fermo dopo 4,
          // dovrei eseguire il prossimo dopo 1 secondo ma i restanti dopo 5 e non ?? possibile usando solo setInterval
          this.timeLeft = this.initialTime;
          this.resume();
      }

      this.executionCount++;
      // eseguo
      action(this);
  }

  this.isPaused = true;
  this.cancel = function() {
      // (repeat ? setInterval : setTimeout)(this.timerID);
      clearTimeout(this.timerID);
      this.cancel = this.pause = this.resume = () => {}; // sovrascrivo le funzioni per disattivarle
  }
  this.pause = function() {
      //(repeat ? clearInterval : clearTimeout)(this.timerID);
      clearTimeout(this.timerID);
      this.isPaused = true;
      this.timeLeft = Math.max(0, this.timeEnd - new Date().getTime());
  }
  this.resume = function() {
      this.timeEnd = new Date().getTime() + this.timeLeft;
      // this.timerID = (repeat ? setInterval : setTimeout)(actionAugmented, this.timeLeft);
      this.timerID = setTimeout(actionAugmented, this.timeLeft);
      this.isPaused = false;
  }
  this.changeTimer = function(newTimer) {
      const wasPaused = this.isPaused;
      const oldTimer = this.initialTime; // low is fast
      this.initialTime = newTimer;
      let changePercent = newTimer / oldTimer;
      this.pause();
      this.timeLeft *= changePercent;
      if (!wasPaused) this.resume();
  }

  this.resume();
}

function Game(){
    this.table = null;
    this.timeouts = [];
    this.boardSize = null;
    this.snake = null;
    this.gameSpeed = null;
    this.score = null;
    this.scoreRequired = null;
    this.timeStart = null;
    this.timeUntilEnd = null;
    this.timeOverSpinner = null;
    this.scoreSpinner = null;
    this.turnTimer = null;
    this.getCellHtml = function(position) { return this.table.rows[position.y].cells[position.x]; };
    this.getCellContent = function(position) { return Positionable.getByCell(this.getCellHtml(position)); };


    this.ispaused = null;
    this.isrunning = false;
    this.isPaused = function () { return this.ispaused; };
    this.isRunning = function () { return this.isrunning; };
    this.pause = function () {
        if (!this.isrunning) return;
        this.timeouts.forEach( t => t.pause() );
        this.ispaused = true; };

    this.resume = function () {
        if (!this.isrunning) return;
        this.timeouts.forEach( t => t.resume() );
        this.ispaused = false;
    };

    this.clean = function() {
        for (let id in Positionable.mapByID) Positionable.mapByID[id].remove();
    };

    this.stop = function () {
        for (let timeout of this.timeouts) timeout.cancel();
        this.timeouts = [];
        // or: Object.keys(Positionable.mapByID).forEach ...
        this.isrunning = false;
        this.ispaused = null;
        document.body.setAttribute('playing', "0");
    };

    this.gameOver = function(reason){
        console.error('game over');
        const blackscreen = document.querySelector('#blackscreen');
        blackscreen.classList.remove('won');
        blackscreen.classList.add('lost');
        const image = blackscreen.querySelector('img');
        image.src = 'images/game-end/lost-' + reason;
        const text = blackscreen.querySelector('h1');
        text.innerHTML = "Game over";
        this.stop();
    };

    this.gameWin = function(counter = 1){
        console.error('game win');
        const blackscreen = document.querySelector('#blackscreen');
        blackscreen.classList.remove('lost');
        blackscreen.classList.add('won');
        const image = blackscreen.querySelector('img');
        image.src = 'images/game-end/won-' + counter + '.jpg';
        const text = blackscreen.querySelector('h1');
        text.innerHTML = "Victory!";
        this.stop();
    };

    this.changeScore = function (amount) {
        this.scoreSpinner.setValue( this.score += amount );
        if (this.score >= this.scoreRequired) this.gameWin();
    };

    this.speedChanged = function(){
        this.gameSpeed = +this.speedInput.value;
        this.turnTimer?.changeTimer( this.gameSpeed/4 * 1000 );
    };

    let timerClosureParams = {
        timerCount: 0
    };

    const gameOverTimer = (timer) => {
        const timeleft = this.timeUntilEnd_Original - timer.executionCount;
        this.timeOverSpinner.setValue(timeleft);
        if (timeleft === 0) return this.gameOver('timer.png');
    }

    const moveTimerOnOff = () => {
        // console.log('moveTimerOnOff', timerClosureParams);
        Positionable.getAll().forEach( e => e.turnPassed() );
        if (timerClosureParams.timerCount++ % 2) {
            // prima met?? del turno, ?? possibile cambiare la direzione del serpente
            document.body.style.borderLeftColor = 'green';
        }
        else {
            // ultima met?? del turno: il prossimo movimento non ?? pi?? modificabile e bisogna solo aspettare la fine del turno.
            // gli input in questo periodo verranno attuati nel turno successivo.
            document.body.style.borderLeftColor = 'red';
            this.snake.move(this.snake.head.nextDirection);
            this.checkSpawnItems();
        }
    }
    this.checkSpawnItems = () => {
        let spawnChance = +this.spawnChanceInput.value/100 + Math.random();
        console.log ('spawnChance, ', spawnChance)
        while (spawnChance-- >= 1){
            if (Math.random() >= this.spawnChanceInput.value / 100) return; // no spawn
            let rand = 1 - Math.random(); // [0, 1) --> (0, 1]
            let sumProb = 0;
            for (let spawnable of this.spawnableArray) {
                sumProb += spawnable.input.value / 100;
                if (rand < sumProb) {
                    console.log('spawn');
                    Positionable.spawnIfPossible(spawnable.constructorReference);
                    break;
                }
            }
        }

    }

    this.start = function (table, boardSize, gameSpeedInput, timeUntilEnd, timeOverSpinner, scoreRequired, scoreSpinner, spawnChanceInput, spawnablesArray) {
        this.clean(); // clear timeouts and restart table
        this.score = 0;
        this.timeStart = new Date();
        this.table = table; // document.querySelector('#game table');
        this.boardSize = boardSize;
        this.speedInput = gameSpeedInput;
        this.spawnChanceInput = spawnChanceInput;
        this.spawnableArray = spawnablesArray;
        this.timeUntilEnd_Original = timeUntilEnd;
        this.timeOverSpinner = timeOverSpinner;
        this.timeOverSpinner.init(0, timeUntilEnd, 0, false);
        console.log('timeuntilend:', timeUntilEnd);
        this.timeOverSpinner.setValue(timeUntilEnd);
        this.scoreRequired = scoreRequired;
        this.scoreSpinner = scoreSpinner;
        this.scoreSpinner.init(this.score, scoreRequired, 0, true, {r:255, g:0, b:0}, {r:0, g:255, b:0});
        this.speedChanged();
        this.snake = new Snake(this);
        // manually spawn first fruit
        // Positionable.spawnIfPossible(Fruit);
        new Fruit( new Position(
            Math.floor(this.table.rows[0].cells.length / 2 + 1), // la board ha per forza almeno 2 righe
            Math.floor(this.table.rows.length / 2)) );
        this.score -= Fruit.score;
        console.log('game start() boardSize:', this.boardSize, this.boardSize.multiply(0.5));
        this.timeouts.push(this.turnTimer = new MyTimeout(moveTimerOnOff, this.gameSpeed/4 * 1000, true, 0));
        this.timeouts.push(new MyTimeout(gameOverTimer, 1000, true, 0));
        this.isrunning = true;
        this.ispaused = false;
        document.body.setAttribute('playing', "1");
        document.querySelector('#blackscreen').classList.remove('won', 'lost');

    };
}


function Position(x, y) {
    this.x = +x;
    this.y = +y;
    this.applyOperation = function(position, operatorX, operatorY){
        // se il parametro ?? numero (o stringa parsabile) lo trasformo in Position
        if (+position === position) { position = new Position(+position, +position); }
        operatorY = operatorY || operatorX;
        return new Position( operatorX(this.x, position.x), operatorY(this.y, position.y));
    }
    this.module = function (bounds, allowNegative = false) {
        // se il parametro ?? numero (o stringa parsabile) lo trasformo in Position
        let x = this.x, y = this.y;
        if (+bounds === bounds) { bounds = new Position(+bounds, +bounds); }
        if (!allowNegative) {
            x -= Math.floor(x / bounds.x) * x;
            y -= Math.floor(y / bounds.y) * y;
        }
        else {
            x %= bounds.x;
            y %= bounds.y;
        }
        // equivalenti
        x = x < 0 && bounds.x - 1 || x;
        y = y < 0 ? bounds.y - 1 : y;
        return new Position(x, y);
    }
    this.sum = function (position) {
        // se il parametro ?? numero (o stringa parsabile) lo trasformo in Position
        if (+position === position) { position = new Position(+position, +position); }
        return new Position(this.x + position.x, this.y + position.y);
    }
    this.multiply = function (position) {// parametro ?? numero o Position
        // se il parametro ?? numero (o stringa parsabile) lo trasformo in Position
        if (+position === position) { position = new Position(+position, +position); }
        return new Position(this.x * position.x, this.y * position.y);
    }
    this.getDirectionString = function (){
        let directions = [];
        if (this.y < 0) directions.push('top'); else
        if (this.y > 0) directions.push('bottom');
        if (this.x < 0) directions.push('left'); else
        if (this.x > 0) directions.push('right');
        return directions.join('-');
    }
}

Positionable.idGenerator = function*() {
    for(let id = 0;;) yield id++;
}(); // dichiarazione ed esecuzione, ritorna una funzione generatrice

// uso questo costruttore per generare il prototype delle classi che lo estendono (NON il __proto__)
// 1-time run per ogni classe che "estende" prima di generarne le istanze.
function Positionable () {
    // potevo anche lasciarlo vuoto e settare Positionable.prototype.remove = ...; etc
    // qui setto le propriet?? che negli oggetti finali utilizzati (es: new Fruit()) saranno ereditate tramite __proto__.__proto__

    // uso questa funzione come se fosse un costruttore "super()" per le istanze finali
    // questi dati vengono memorizzati nell'oggetto stesso e non nella catena dei __proto__
    this.init = function(position, kind) {
        this.position = position || new Position();
        const kindCounter = this.constructor.dictionary?.length ?? this.constructor.kindCounter ?? 1;
        // $ type check, anche se qui si poteva anche usare !isNaN()
        this.kind = typeof kind === 'number' ? kind : Math.floor(Math.random() * kindCounter); // mela, pera... enumeratore.
        this.expiringTurnLeft = -1; // it does not expire by default
        // se position ?? undefined lo sto creando per usarlo come prototype e non lo considero.
        Positionable.mapByID[ this.id = Positionable.idGenerator.next().value ] = this;
        const cell = this.getCellHtml();
        if (cell) cell.dataset.isFilledWith = this.id;
    }

    this.turnPassed = function() {
        // permetto volontariamente agli item che iniziano con valori < 0 di rimanere per sempre
        if (--this.expiringTurnLeft === 0 ) this.remove();
    }

    this.remove = function () {
        const container = this.html?.parentElement
        delete Positionable.mapByID[this.id];
        if (!container) return;
        delete container.dataset.isFilledWith;
        // delete su datase non funziona su safari, per compatibilit?? uso anche removeAttribute
        container.removeAttribute('data-is-filled-with');
        // while (container.firstChild) { container.remove(container.firstChild); }
        container.removeChild(this.html);
    }




}



/*
function Eatable(position) {
    this.sizeIncrease = 0;
    // chiama Positionable
    this.prototype.constructor.call(this, position); // emula call "super" costruttore
}*/
function Fruit(position, kind = null) {
    this.init(...arguments);
    this.sizeIncrease = 1;
    this.expiringTurnLeft = 15; // scade dopo X turni

    this.html = document.createElement('img');
    this.html.src = "images/positionable/fruits/" + Fruit.dictionary[this.kind] + ".png";
    this.getCellHtml().appendChild(this.html);
}

function Deadly(position, kind = null) {
    this.init(...arguments);
    this.sizeIncrease = Number.MIN_SAFE_INTEGER;
    this.expiringTurnLeft = 18; // scade dopo X turni

    this.html = document.createElement('img');
    this.html.src = "images/positionable/deadly-" + (this.kind + 1) + ".png";
    this.getCellHtml().appendChild(this.html);
}

function Trap(position, kind = null) {
    this.init(...arguments);
    this.sizeIncrease = -1;
    this.expiringTurnLeft = 30; // scade dopo X turni

    this.html = document.createElement('img');
    this.html.src = "images/positionable/trap-" + (this.kind + 1) + ".png";
    this.getCellHtml().appendChild(this.html);
}

function MovementTrap(position, kind = null) { // forza il serpente a girarsi verso una cella libera
    this.init(...arguments);
    this.sizeIncrease = 0;
    this.expiringTurnLeft = 30; // scade dopo X turni

    this.html = document.createElement('img');
    this.html.src = "images/positionable/movement-trap-" + (this.kind + 1) + ".png";
    this.getCellHtml().appendChild(this.html);
}
/*
function Poison(position) { merged with bomb into deadly
    this.prototype.constructor.call(this, position); // emula call "super" costruttore
    this.sizeIncrease = -5;
    this.sizeIncrease = 0;
    this.expiringTurnLeft = 10; // scade dopo X turni

    this.html = document.createElement('img');
    this.html.src = "images/positionable/poison-" + (this.kind + 1) + ".png";
    this.getCellHtml().appendChild(this.html);
}*/

// Deadly.prototype = Object.create(Eatable.prototype) vs new Eatable ?
function makeItExtend(FunctionSubClass1, FunctionSuperClass, superClassInstance = null) {
    // OR settare il prototype di Positionable.prototype.function = something
    FunctionSubClass1.prototype = {
        pointsWhenEaten: 0,
        __proto__: superClassInstance || new FunctionSuperClass()}; // new FunctionSuperClass();      // es: Trap "estende" Positionable eretidando attraverso il prototype.
    FunctionSubClass1.prototype.constructor = FunctionSubClass1; // e poi riassegna il costruttore.
}

function SnakeSegment(position) {
    // this.__proto__ == SnakeSegment, this.__proto__.__proto__ == Positionable
    // this.__proto__.__proto__.constructor.call(this, position); // emula call "super" costruttore
    this.init(position); // ereditato da Positionable
    // this.prototype.constructor.(position); // emula call "super" costruttore
    this.next = null;
    this.prev = null;
    this.prevDirection = null;
    this.nextDirection = null;

    this.html = document.createElement('div');

    this.isHead = function (){ return !this.next; }
    this.isBody = function (){ return this.prev && this.next; }
    this.isTail = function (){ return !this.prev; }
    this.addNext = function(segment) {
        this.next = segment;
        segment.nextDirection = this.nextDirection;
        segment.prev = this;
        this.nextDirection = this.next.getRelativePosition(this);
        this.next.prevDirection = this.getRelativePosition(this.next);

        this.updateHtml();
        this.next.updateHtml();
    }

    this.getRelativePosition = (segment) => {
        const game = Game.get();
        // check di overflow
        if (this.position.x === game.boardSize.x - 1 && segment.position.x === 0) return 'left';
        if (this.position.x === 0 && segment.position.x === game.boardSize.x - 1) return 'right';
        if (this.position.y === game.boardSize.y - 1 && segment.position.y === 0) return 'top';
        if (this.position.y === 0 && segment.position.y === game.boardSize.y - 1) return 'bottom';
        // check normali
        if (this.position.x < segment.position.x) return 'left';
        if (this.position.x > segment.position.x) return 'right';
        if (this.position.y < segment.position.y) return 'top';
        if (this.position.y > segment.position.y) return 'bottom';
        return null;
    }
    this.updateHtml = () => {
        // this.html.setAttribute('class', '');
        if (!this.prevDirection) this.prevDirection = 'left';
        if (!this.next && !this.nextDirection) {
            switch (this?.prevDirection.charAt(0)) {
                // case 'n': this.nextDirection = 'right'; this.prevDirection = 'left'; break; // at snake first spawn
                case 't': this.nextDirection = 'bottom'; break;
                case 'b': this.nextDirection = 'top'; break;
                case 'l': this.nextDirection = 'right'; break;
                case 'r': this.nextDirection = 'left'; break;
            }
        }

        this.html.classList.remove.apply(this.html.classList, this.html.classList); // empty classlist
        this.html.classList.add('snake', this.prevDirection, this.nextDirection, this.prevDirection?.charAt(0) + this.nextDirection?.charAt(0));
        this.html.classList.remove('head', 'tail');
        if (this.isHead()) this.html.classList.add('head');
        if (this.isTail()) this.html.classList.add('tail');
        this.getCellHtml().appendChild(this.html);
    }
    this.updateHtml();

    // override di Positionable.remove() $
    this.remove = function () {
        this.__proto__.__proto__.remove.call(this); // emula call "super" Positionable.remove()
        // totalmente inutile ma volevo fare un override
    }
    // this.addNext(null); // inizia senza un successore
}

/*
* var o = new Object();
o.[[Prototype]] = Foo.prototype;
Foo.call(o);
* equivale a new Foo();
* */
function Snake(game){
    this.game = game;
    const position = new Position(
        Math.floor(this.game.table.rows[0].cells.length / 2), // la board ha per forza almeno 2 righe
        Math.floor(this.game.table.rows.length / 2));
    this.head = new SnakeSegment(position);
    this.tail = this.head;
    this.head.nextDirection = 'right';
    this.tail.prevDirection = 'left';
    this.forcedMovement = null; // by traps

    this.isValidMovement = function (directionStr) {
        // se lunghezza 1, oppure se lunghezza 2, oppure se NON sta tentando una inversione ad U su se stesso.
        return !this.head.prev || /*this.head.prev === this.tail ||*/ this.head.prev.getRelativePosition(game.snake.head) !== directionStr; };

    this.reverse = function(){
        let current = this.head, tmp, arr = [],
            headDirections = {prev: this.head.prevDirection, next: this.head.nextDirection},
            tailDirections = {prev: this.tail.prevDirection, next: this.tail.nextDirection};

        console.log('pre-next, head:', game.snake.head.prevDirection + '-' + game.snake.head.nextDirection, 'tail:', game.snake.tail.prevDirection + '-' + game.snake.tail.nextDirection);

        while (current) {
            arr.push(current);
            tmp = current.prev;
            current.prev = null;
            current.next = null;
            current.prevDirection = null;
            current.nextDirection = null;
            current = tmp;
        }
        for (let i = 1; i < arr.length; i++) arr[i-1].addNext(arr[i]);
        /*
        tmp = this.head.prevDirection;
        this.head.prevDirection = tailDirections.nextDirection; // diventer?? la nuova coda ed ?? per vedere se termina con una curva
        this.tail.nextDirection = tmp; // diventer?? la nuova testa ed impedisco che avanzi mangiandosi

        tmp = this.head.nextDirection;
        this.head.nextDirection = tailDirections.prevDirection;
        this.tail.prevDirection = tmp;
        */
        tmp = this.head;
        this.head = this.tail;
        this.tail = tmp;
        console.log('pre-next, head:', game.snake.head.prevDirection + '-' + game.snake.head.nextDirection, 'tail:', game.snake.tail.prevDirection + '-' + game.snake.tail.nextDirection);

        this.head.nextDirection = tailDirections.prev;
        this.tail.prevDirection = headDirections.next;
        this.head.updateHtml();
        this.tail.updateHtml();
        this.forcedMovement = this.head.nextDirection;
    }

    this.moveForward = function (nextPosition) {
        let newHead = new SnakeSegment(nextPosition);
        this.head.addNext(newHead);
        this.head = newHead;
    }
    this.cutTail = function (amount) {
        let tail = this.tail;
        while (amount-- > 0) {
            let tmp = tail.next;
            tail.remove();
            tail = tmp;
            if (!tail) { this.game.gameOver('trap.jpg'); return; }
        }
        tail.prev = null;
        this.tail = tail;
        this.tail.updateHtml();
    }

    this.findPossibleMovements = function() {
        let directions = [], alldirections = [new Position(0, 1), new Position(0, -1), new Position(1, 0), new Position(-1, 0)];
        for (let direction of alldirections){
            /*
            // for (let directionNum = 1; directionNum < 0b11; directionNum++) {
                // modo intricato e buffo di iterare le direzioni (0, 1), (0, -1), (1, 0), (-1, 0)
                let directionStr = directionNum.toString(2); // in binario
                let direction = new Position(sign * directionStr[0], sign * directionStr[1]);
                */
                let destination = this.head.position.sum(direction).module(this.game.boardSize);
                console.log('directionStr', null, 'direction:', direction, 'destination:', destination);
                const cellOldContent = this.game.getCellContent(destination);
                const constructorName = cellOldContent?.__proto__?.constructor.name;
                // continue se la cella ti ucciderebbe, break se ?? percorribile,
                switch (constructorName) {
                    case undefined:
                    case Fruit.name:
                        break;
                    case Deadly.name:
                    case SnakeSegment.name:
                        continue;
                    case Trap.name:
                        if (this.head === this.tail) continue; else break;
                    case MovementTrap.name:
                }
                directions.push(direction);
            //}
        }
        return directions;
    }

    this.move = function (directionStr) {
        if (this.forcedMovement) directionStr = this.forcedMovement;
        this.forcedMovement = null;
        // console.log('snake.move', directionStr, this);
        const direction = new Position(0, 0);
        switch (directionStr[0]) {
            default: console.error('wrong direction:', directionStr); break;
            case 't': direction.y = -1; break;
            case 'b': direction.y = 1; break;
            case 'r': direction.x = 1; break;
            case 'l': direction.x = -1; break;
        }
        const nextPosition = this.head.position.sum(direction).module(this.game.boardSize);
        // console.log('nextpos:', nextPosition, 'head pos', this.head.position, 'direction', direction, 'board:', game.boardSize);
        const cellOldContent = this.game.getCellContent(nextPosition);
        const constructorName = cellOldContent?.__proto__?.constructor.name;
        console.log('eating:', constructorName, cellOldContent, nextPosition);
        switch (constructorName) {
            default:
                console.error('snake eating something unexpected at:', nextPosition,
                    'head pos', this.head.position, 'old content', cellOldContent,
                    'constructorName', constructorName);
                break;
            case undefined:
                this.moveForward(nextPosition);
                this.cutTail(1);
                break;

            case SnakeSegment.name:
                if (cellOldContent.isTail()) {
                    console.warn('eating tail');
                    this.moveForward(nextPosition);
                    this.cutTail(1);
                    break; }
                this.moveForward(nextPosition);
                this.game.gameOver('cannibalism.jpg');
                break;
            case Deadly.name:
                // cellOldContent.remove();
                this.moveForward(nextPosition);
                this.game.gameOver('deadly.png');
                break;
            case Fruit.name:
                cellOldContent.remove();
                this.moveForward(nextPosition);
                Positionable.spawnIfPossible(Fruit);
                break;
            case Trap.name:
                cellOldContent.remove();
                this.moveForward(nextPosition);
                this.cutTail(-cellOldContent.sizeIncrease + 1);
                break;
            case MovementTrap.name:
                cellOldContent.remove();
                this.moveForward(nextPosition);
                this.cutTail(1);
                const reverse = Math.random() < 0.5;
                if (reverse) { this.reverse(); break; }
                let possibleDirections = this.findPossibleMovements();
                let i = Math.floor(Math.random() * possibleDirections.length);
                let nextDirection = possibleDirections[i];
                console.log('possibleDirections', possibleDirections, nextDirection);
                this.head.nextDirection = this.forcedMovement = nextDirection?.getDirectionString();
                this.head.updateHtml();
                break;
        }
        this.game.changeScore(cellOldContent?.constructor.score || 0);
    }

}



/*

var Person = function (name) {
    this.name = name;
    this.type = 'human';
};

Person.prototype.info = function () {
    console.log("Name:", this.name, "Type:", this.type);
};

var Robot = function (name) {
    Person.apply(this, arguments);
    this.type = 'robot';
};

Robot.prototype = Person.prototype;  // Set prototype to Person's
Robot.prototype.constructor = Robot; // Set constructor back to Robot

person = new Person("Bob");
robot = new Robot("Boutros");

person.info();
// Name: Bob Type: human

robot.info();
// Name: Boutros Type: robot

* */
