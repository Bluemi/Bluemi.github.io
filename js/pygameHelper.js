function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(color) {
    return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
}

async function createPygameHelper(pyodide, micropip) {
    // install pyodide-pygame dropin
    await micropip.install("wheels/pygame-0.1.0-py3-none-any.whl")
    let canvas = document.getElementById("mainCanvas");
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
                console.log("fill");
            }
        },
        draw: {
            line: function (canvas, color, start, dest) {
                const ctx = canvas.getContext("2d");
                ctx.beginPath();
                ctx.strokeStyle = rgbToHex(color);
                ctx.moveTo(start[0], start[1]);
                ctx.lineTo(dest[0], dest[1]);
                ctx.stroke();
                ctx.strokeStyle = '#000000';
                console.log("line");
            }
        },
        event: {

        }
    };
    pyodide.registerJsModule("pygame_helper", pygameHelper);

    // handle events
    canvas.addEventListener('click', function(_evt) {
        pyodide.runPython(`
            import pygame
            pygame.event.handle_event(pygame.event.Event.create_click())
        `)
    });
}
