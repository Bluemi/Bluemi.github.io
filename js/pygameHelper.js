function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(color) {
    return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
}

function createPygameHelper() {
    return {
        display: {
            set_mode: function (screen_size) {
                // get canvas
                let canvas = document.getElementById("mainCanvas");
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
        }
    };
}
