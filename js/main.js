function showProgress(canvas, text, progress) {
    // fill black
    const ctx = canvas.getContext("2d");
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fill();

    ctx.font = "20px Georgia";
    ctx.textAlign = "center";
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(text, canvas.width/2, canvas.height/2);
    ctx.fillStyle = '#000000';

    const left_space = 400;
    ctx.beginPath();
    ctx.rect(left_space, 500, canvas.width - left_space*2, 40);
    ctx.fillStyle = '#222222';
    ctx.fill();

    ctx.beginPath();
    let width = (canvas.width - left_space*2) * progress;
    let padding = 5;
    ctx.rect(left_space+padding, 500+padding, width - 2*padding, 40 - 2*padding);
    ctx.fillStyle = '#555555';
    ctx.fill();
}

async function main(){
    let mainCanvas = document.getElementById("mainCanvas");
    mainCanvas.width = 1280;
    mainCanvas.height = 720;
    showProgress(mainCanvas, "Loading Pyodide", 0.05);
    let pyodide = await loadPyodide();
    showProgress(mainCanvas, "Loading Micropip", 0.3);
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    showProgress(mainCanvas, "Loading Numpy", 0.5);
    await pyodide.loadPackage("numpy");
    showProgress(mainCanvas, "Loading Pygame Helper", 0.7);
    await createPygameHelper(pyodide, micropip, mainCanvas);
    showProgress(mainCanvas, "Installing Linear Algebra Testcase", 0.95);
    await micropip.install("wheels/linear_algebra_testcase-0.1.0-py3-none-any.whl");
    pyodide.runPython(`
        from linear_algebra_testcase.main import main
        main_instance = main()
        pygame.event.handle_event(pygame.event.Event.create_mouseenter())
    `);
}

main();
