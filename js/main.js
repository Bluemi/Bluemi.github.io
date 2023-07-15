async function main(){
    let pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    // await micropip.install("https://raw.githubusercontent.com/Bluemi/Bluemi.github.io/main/wheels/test_module-0.1.0-py3-none-any.whl");
    const pygameHelper = createPygameHelper();
    pyodide.registerJsModule("pygame_helper", pygameHelper);
    await micropip.install("wheels/pygame-0.1.0-py3-none-any.whl")
    await micropip.install("wheels/test_module-0.1.0-py3-none-any.whl");
    pyodide.runPython(`
        import test_module.main
        test_module.main.main()
    `);
}

main();
