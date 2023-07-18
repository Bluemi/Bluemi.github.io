const ALLOWED_KEYCODES = [190, 188];

function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(color) {
    return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
}

function getCanvasMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
}

function isCharacterKeyPress(event) {
    return String.fromCharCode(event.keyCode).match(/(\w|\s)/g) || ALLOWED_KEYCODES.includes(event.keyCode);
}

function normalizeKeyEvent(event) {
    let normalized_event = {
        keyCode: event.keyCode,
        unicode: event.key
    }
    if (!isCharacterKeyPress(event)) {
        normalized_event.unicode = '';
    }
    if (event.keyCode >= 65 && event.keyCode < 90 && !event.shiftKey) {
        normalized_event.keyCode = event.keyCode + 97 - 65;
    }
    if (event.keyCode === 46) {
        normalized_event.keyCode = 127;
    }
    return normalized_event;
}

async function createPygameHelper(pyodide, micropip, canvas) {
    // install pyodide-pygame dropin
    await micropip.install("wheels/pygame-2.5.0-py3-none-any.whl");
    const pygameHelper = {
        display: {
            set_mode: function (screen_size) {
                // get canvas
                canvas.width = screen_size[0];
                canvas.height = screen_size[1];
                // create screen object
                return canvas
            },
            fill: function(canvas, color) {
                const ctx = canvas.getContext("2d");
                ctx.rect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = rgbToHex(color);
                ctx.fill();
            }
        },
        draw: {
            line: function (canvas, color, start, dest, width) {
                const ctx = canvas.getContext("2d");
                ctx.beginPath();
                ctx.strokeStyle = rgbToHex(color);
                ctx.lineWidth = width;
                ctx.moveTo(start[0], start[1]);
                ctx.lineTo(dest[0], dest[1]);
                ctx.stroke();
                ctx.strokeStyle = '#000000';
            },
            circle: function (canvas, color, center, radius) {
                const ctx = canvas.getContext("2d");
                ctx.beginPath();
                ctx.fillStyle = rgbToHex(color);
                ctx.arc(center[0], center[1], radius, 0, 2*Math.PI);
                ctx.fill();
                ctx.fillStyle = '#000000';
            },
            rect: function (canvas, color, rectPos, borderRadius) {
                if (!Number.isInteger(borderRadius)) {
                    borderRadius = 0;
                }
                const ctx = canvas.getContext("2d");
                ctx.beginPath();
                ctx.fillStyle = rgbToHex(color);
                if (borderRadius === 0) {
                    ctx.rect(rectPos[0], rectPos[1], rectPos[2], rectPos[3]);
                } else {
                    ctx.roundRect(rectPos[0], rectPos[1], rectPos[2], rectPos[3], borderRadius);
                }
                ctx.fill();
                ctx.fillStyle = '#000000';
            },
            font: function (canvas, color, pos, fontstyle, text) {
                const ctx = canvas.getContext("2d");
                // ctx.font = fontstyle;
                ctx.font = fontstyle;
                ctx.textBaseline = "top";
                ctx.fillStyle = rgbToHex(color);
                ctx.fillText(text, pos[0], pos[1]);
                ctx.fillStyle = '#000000';
            }
        },
    };
    pyodide.registerJsModule("pygame_helper", pygameHelper);

    // import pygame
    pyodide.runPython("import pygame");

    // handle events
    canvas.addEventListener('mousedown', function(evt) {
        let mousePos = getCanvasMousePos(canvas, evt);
        let locals = new Map();
        locals.set('mouse_position', pyodide.toPy(mousePos));
        locals.set('button', evt.button + 1); // pygame button is one higher than js button
        pyodide.runPython(
            "pygame.event.handle_event(pygame.event.Event.create_mousebuttondown(mouse_position, button))",
            {locals: locals}
        );
    });

    canvas.addEventListener('mouseup', function(evt) {
        let mousePos = getCanvasMousePos(canvas, evt);
        let locals = new Map();
        locals.set('mouse_position', pyodide.toPy(mousePos));
        locals.set('button', evt.button + 1); // pygame button is one higher than js button
        pyodide.runPython(
            "pygame.event.handle_event(pygame.event.Event.create_mousebuttonup(mouse_position, button))",
            {locals: locals}
        );
    });

    canvas.addEventListener('mouseenter', function(_evt) {
        pyodide.runPython("pygame.event.handle_event(pygame.event.Event.create_mouseenter())");
    });

    canvas.addEventListener('mousemove', function(evt) {
        let mousePos = getCanvasMousePos(canvas, evt);
        let locals = new Map();
        locals.set('mouse_position', pyodide.toPy(mousePos));
        locals.set('relX', evt.movementX);
        locals.set('relY', evt.movementY);
        pyodide.runPython(
            "pygame.event.handle_event(pygame.event.Event.create_mousemotion(mouse_position, (relX, relY)))",
            {locals: locals}
        );
    });

    canvas.addEventListener('wheel', function(evt) {
        evt.preventDefault();
        let locals = new Map();
        locals.set('wheelDelta', evt.wheelDelta / 120.0);
        pyodide.runPython(
            "pygame.event.handle_event(pygame.event.Event.create_mousewheel(wheelDelta))",
            {locals: locals}
        );
    });

    window.addEventListener('keydown', function(evt) {
        evt.preventDefault();
        let locals = new Map();
        let norm_evt = normalizeKeyEvent(evt);
        locals.set('key', norm_evt.keyCode);
        locals.set('unicode', norm_evt.unicode);
        console.log('norm evt:', norm_evt);
        pyodide.runPython(
            "pygame.event.handle_event(pygame.event.Event.create_keydown(key, unicode))",
            {locals: locals}
        );
    });

    window.addEventListener('keyup', function(evt) {
        let locals = new Map();
        let norm_evt = normalizeKeyEvent(evt);
        locals.set('key', norm_evt.keyCode);
        locals.set('unicode', norm_evt.key);
        pyodide.runPython(
            "pygame.event.handle_event(pygame.event.Event.create_keyup(key, unicode))",
            {locals: locals}
        );
    });

    canvas.addEventListener('resize', function(_evt) {
        pyodide.runPython("pygame.event.handle_event(pygame.event.Event.create_windowresized())");
    });

    canvas.addEventListener('focus', function(_evt) {
        pyodide.runPython("pygame.event.handle_event(pygame.event.Event.create_focus())");
    });
}
