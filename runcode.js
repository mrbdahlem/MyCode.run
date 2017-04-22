/* global FileManager, Infinity, ace, HELLO_API_KEY, apigClientFactory, FileManger */

function runCode() {
    // Create a client using the public API key
    var apigClient = apigClientFactory.newClient({
        apiKey: HELLO_API_KEY
    });
    
    // Set up a bootstrap modal to display the output of the run
    $('#outputModalTitle').text('Running...');
    $('#outputModalBody').html('<pre id="output">Please wait...</pre>'); 
    $('#exTime').html('Execution time: ___ ms');
    $('#outputModal').modal('show');
    
    // Prepare the output display as a read-only editor
    var display = ace.edit("output");
    display.setTheme("ace/theme/terminal");
    display.$blockScrolling = Infinity;
    display.setOptions({
                        maxLines: 25,
                        minLines: 1,
                        readOnly: true,
                        highlightActiveLine: false,
                        highlightGutterLine: false,
                        fontFamily: "Inconsolata",
                        fontSize: "12pt",
                        wrap: true
                    });
    
    // Get the main class's actual name..
    // drop the .java extension
    var mainName = FileManager.getMainFile().name.replace(/\.[^/.]+$/, "");
    // Get the file's package name
    var pkgReg = /package\s+([\w\.]+)\s*;/;
    var packageName = pkgReg.exec(FileManager.getMainFile().contents);
    // Add the package name to the class's name
    if (packageName !== null && packageName.length >= 2) {
        mainName = packageName[1] + "." + mainName;
    }
        
    // Add the derived classname to the compiling message
    $('#outputModalTitle').text('Compiling and running ' + mainName + '...');
    
    // Prepare the request to run the code
    // Set up the request body for a compile-run request
    var body = {
        version: 1,
        compile: {
            version: 1,
            mainClass: mainName,
            sourceFiles: []
        },
        "test-type": "run"
    };
    
    // Add the files in the global file manager to the request body.
    addAllSourceFiles(FileManager.getRootFolder(), body.compile.sourceFiles);
    
    // Add parameters for the request
    var params = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };
    
    var additionalParams = {};
    
    // Record the current time to calculate how long the request takes
    var start = new Date().getTime();
    var timer = displayElapsedTime($('#exTime'), start);
    $('#outputModal').on('hide.bs.modal', function(e) {
        clearInterval(timer);
    });
    
    // Make the compile-run request
    apigClient.helloFunctionPost(params, body, additionalParams)
        .then(function(result){
            // If the request returns properly...
            // calculate and display the execution time
            clearInterval(timer);
            var timeDiff = (new Date().getTime()) - start;
            $('#exTime').html('Execution time: ' + (timeDiff) + 'ms');
            
            // Retrieve the output from the run
            returntext = result.data.result;
            
            // Display whether the compile-run succeeded
            var success = (result.data.succeeded) ? 'Succeeded' : 'Failed';
            $('#outputModalTitle').text('Execution ' + success);
         
            // Show the response
            display.setValue(returntext, 1);
        }).catch(function(result){
            // If the request did not return properly...
            // calculate and display the execution time
            clearInterval(timer);
            var timeDiff = (new Date().getTime()) - start;
            $('#exTime').html('Execution time: ' + (timeDiff) + 'ms');
            
            // Display the response
            $('#outputModalTitle').text('Execution Failed');
            $('#outputModalBody').html('<p>Failure communicating with server</p>');
        });
}

// Add all source files to the request file list
function addAllSourceFiles(folder, list) {
    // Add all of the files from the this folder's subfolders to the request
    folder.folders.forEach(function(subfolder) {
       addAllFiles(subfolder, list); 
    });
    
    // Add all of the files from this folder to the request
    folder.files.forEach(function(file) {
        // Determine the full path for the file being added
        var path = "";
        var parent = file.parent;
        var root = FileManager.getRootFolder();
        
        while (parent !== root) {
            path = parent.getName() + "/" + path;
            parent = parent.getParent();
        }
        
        path = path + file.name;
        
        // Create and add a file object with the full pathname and contents
        // separated into individual lines
        var sourceFile = {};
        sourceFile.name = path;
        sourceFile.contents = file.contents.split(/\r?\n/);
        list.push(sourceFile);
    });
}

/*
 * Display time on the modal dialog as it elapses
 */
function displayElapsedTime (el, start) {
    return setInterval(function() {
            var timeDiff = Math.round(((new Date().getTime()) - start) / 100) * 100;
            el.html('Execution time: ' + (timeDiff) + 'ms');
        }, 100);
}