async function main(){
    let pyodide = await loadPyodide();
    console.log(pyodide.runPython(`
        class MyClass:
            def __init__(self):
                self.a = 42
                self.b = "Das ist ein String"
                
        c = MyClass()
        str(c)
    `));
}
main();
