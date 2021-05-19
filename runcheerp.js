/*
 * Run the code contained in the file manager, by compiling everything and
 * executing the main class, then display the result.
 */
/* global FileManager */

function runCodeCheerp() {
    // Get the main class's actual name..
    // drop the .java extension
    var mainName = FileManager.getMainFile().name.replace(/\.[^/.]+$/, "");
    // Get the file's package name
    var pkgReg = /package\s+([\w\.]+)\s*;/;
    var packageName = pkgReg.exec(FileManager.getMainFile().contents);
    // Add the package name to the class's name
    if (packageName === null || packageName.length < 2) {
        packageName[1] = "default";
    }
    
    mainName = packageName[1] + "." + mainName;   
    
    // Prepare the request to run the code
    // Set up the request body for a compile-run request
    var body = {
        version: 1,
        compile: {
            version: 1,
            mainClass: mainName,
            sourceFiles: []
        },
        data: {
            version: 1,
            dataFiles: []
        },
        "test-type": "run"
    };
    
    var root = FileManager.getRootFolder();
    // Add the files in the global file manager to the request body.
    addAllSourceFiles(root, body.compile.sourceFiles, true);
    
    // Add data files to the request
    addAllDataFiles(root, body.data.dataFiles);
    
    let newWindow = window.open('./cheerpjConsole.html');
    newWindow.compileData = body;
}