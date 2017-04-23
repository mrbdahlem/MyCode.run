/* global FileManager, Infinity, ace, HELLO_API_KEY, apigClientFactory, FileManger */

/*
 * Run the code contained in the file manager, by compiling everything and
 * executing the main class, then display the result.
 */
function runCode() {
    // Create a client using the public API key
    var apigClient = apigClientFactory.newClient({
        apiKey: HELLO_API_KEY
    });
    
    // Set up a bootstrap modal to display the output of the run
    $('#outputModalTitle').text('Running...');
    $('#outputModalBody').html('<pre id="output">Please wait...</pre>'); 
    $('#exTime').html('Execution time: ___ ms');
    $('#testOutputSelector').hide();
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
        // Show the result of the request
        .then(function(result) {
            showSucceeded(result, display, timer, start, "Execution");
        }).catch(function(result){
            showFailed(result, display, timer, start);
    });
}

/*
 * Test the code contained in the file manager, by compiling everything and
 * executing the test cases in the classes in the "Test" folder, then display
 * the results.
 */
function testCode() {
    // Create a client using the public API key
    var apigClient = apigClientFactory.newClient({
        apiKey: HELLO_API_KEY
    });
    
    
    // Set up a bootstrap modal to display the output of the run
    $('#outputModalTitle').text('Running...');
    $('#outputModalBody').html('<pre id="output">Please wait...</pre>'); 
    $('#exTime').html('Execution time: ___ ms');
    $('#testOutputSelector').hide();
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
    
    // Prepare the request to run the code
    // Set up the request body for a compile-run request
    var body = {
        version: 1,
        compile: {
            version: 1,
            mainClass: mainName,
            sourceFiles: []
        },
        test: {
            version: 1,
            testClasses: []
        },
        "test-type": "junit"
    };
    
    var root = FileManager.getRootFolder();
    
    // Add the files in the global file manager to the request body.
    addAllSourceFiles(root, body.compile.sourceFiles);
    
    // Add the names of the test cases to the testClasses list
    addAllTestClasses(root.findFolder("Test"),
                      body.test.testClasses);
    
    // Add parameters for the request
    var params = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };
    
    var additionalParams = {};
    
    if (body.test.testClasses.length > 0) {
        // Add the derived classname to the compiling message
        $('#outputModalTitle').text('Compiling and testing ' + mainName + '...');

        // Record the current time to calculate how long the request takes
        var start = new Date().getTime();
        var timer = displayElapsedTime($('#exTime'), start);
        $('#outputModal').on('hide.bs.modal', function(e) {
            clearInterval(timer);
        });
        
        // Make the compile-run request
        apigClient.helloFunctionPost(params, body, additionalParams)
            // Show the result of the request
            .then(function(result) {
                showSucceeded(result, display, timer, start, "Tests");
                showTestCases(result, '#testOutputSelector', display, '#testCaseList');
            }).catch(function(result){
                showFailed(result, display, timer, start);
        });
    }
    else {
        // Add the derived classname to the compiling message
        $('#outputModalTitle').text('No test cases for ' + mainName + '.');

        $('#outputModalBody').html('<p>Couldn\'t run tests that don\'t exist.</p>');
        $('#exTime').text('--');
    }
}

/*
 * Show a successful execution
 */
function showSucceeded(result, display, timer, start, title) {
    // If the request returns properly...
    // calculate and display the execution time
    clearInterval(timer);
    var timeDiff = (new Date().getTime()) - start;
    $('#exTime').html('Execution time: ' + (timeDiff) + 'ms');

    // Retrieve the output from the run
    returntext = result.data.result;

    // Display whether the compile-run succeeded
    var success = (result.data.succeeded) ? 'Succeeded' : 'Failed';
    $('#outputModalTitle').text(title + " " + success);

    // Show the response
    display.setValue(returntext, 1);
}

/*
 * Show test cases on the output modal
 */
function showTestCases(result, menu, display, caseList) {
    var firstFailure = null;
    var firstItem = null;
    
    var button = menu + ' > button';
    
    if (result.data.testResults) {
        $(menu).show();
        $(caseList).empty();
        var output = document.createElement('a');
        $(output).addClass('dropdown-item');
        $(output).text('Test Output');
        $(output).click(function() {
            display.setValue(result.data.result, 1);
            $(button).text($(this).text());
            $(button).addClass('btn-primary');
            $(button).removeClass('btn-danger');
        });
        $(caseList).append($(output));
        $(button).text('Test Output');
        
        var caret = document.createElement('span');
        $(caret).addClass('caret');
        $(button).append(caret);
        firstItem = output;
        
        result.data.testResults.details.forEach(function(detail, num) {
           var item = document.createElement('a');
           $(item).addClass('dropdown-item');
           $(item).addClass((detail.passed) ? 'passed' : 'failed');
           
           if (!detail.passed && firstFailure === null) {
               firstFailure = item;
           }
           
           $(item).text("Test " + (num + 1) + ": " + detail.description);

           $(item).click(function() {               
                display.setValue(detail.body, 1);
                $(button).text($(this).text());

                var caret = document.createElement('span');
                $(caret).addClass('caret');
                $(button).append(caret);
                
                if (detail.passed) {
                    $(button).addClass('btn-primary');
                    $(button).removeClass('btn-danger');
                }
                else {
                    $(button).removeClass('btn-primary');
                    $(button).addClass('btn-danger');
                }
           });
           $(caseList).append($(item));
        });
        
        if (firstFailure) {
            $(firstFailure).click();
        }
        else {
            $(firstItem).click();
        }
    }
}

/*
 * Show a failed execution
 */
function showFailed(result, display, timer, start) {
    // If the request did not return properly...
    // calculate and display the execution time
    clearInterval(timer);
    var timeDiff = (new Date().getTime()) - start;
    $('#exTime').html('Execution time: ' + (timeDiff) + 'ms');

    // Display the response
    $('#outputModalTitle').text('Execution Failed');
    $('#outputModalBody').html('<p>Failure communicating with server</p>');
}

// Add all source files to the request file list
function addAllSourceFiles(folder, list) {
    // Add all of the files from the this folder's subfolders to the request
    folder.folders.forEach(function(subfolder) {
       addAllSourceFiles(subfolder, list); 
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

function addAllTestClasses(folder, list) {
    if (folder) {
        // Add all of the files from the this folder's subfolders to the request
        folder.folders.forEach(function(subfolder) {
           addAllTestClasses(subfolder, list); 
        });  

        // Add all of the files from this folder to the request
        folder.files.forEach(function(file) {
            // Determine the full path for the file being added
            // Get the name of the file without extension
            var className = file.name.replace(/\.[^/.]+$/, "");
            // Get the file's package name
            var pkgReg = /package\s+([\w\.]+)\s*;/;
            var packageName = pkgReg.exec(file.contents);
            // Add the package name to the class's name
            if (packageName !== null && packageName.length >= 2) {
                className = packageName[1] + "." + className;
            }

            list.push(className);
        });
    }
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