async function main(){
    let pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    await pyodide.loadPackage("numpy");
    let canvas = document.getElementById("mainCanvas");
    await createPygameHelper(pyodide, micropip, canvas);
    // await micropip.install("wheels/test_module-0.1.0-py3-none-any.whl");
    await micropip.install("wheels/linear_algebra_testcase-0.1.0-py3-none-any.whl");
    pyodide.runPython(`
        from linear_algebra_testcase.main import main
        main_instance = main()
        pygame.event.handle_event(pygame.event.Event.create_mouseenter())
    `);
}

main();
