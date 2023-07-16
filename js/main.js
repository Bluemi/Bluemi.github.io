async function main(){
    let pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    // await micropip.install("https://raw.githubusercontent.com/Bluemi/Bluemi.github.io/main/wheels/test_module-0.1.0-py3-none-any.whl");
    createPygameHelper(pyodide, micropip);
    await micropip.install("wheels/test_module-0.1.0-py3-none-any.whl");
    pyodide.runPython(`
        from test_module.main import main
        main_instance = main()
    `);
}

main();
