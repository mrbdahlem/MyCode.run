function runCode() {
    // Create a client using the public API key
    var apigClient = apigClientFactory.newClient({
        apiKey: 'NfPLJMgMRZ59PS0Le1979LzuenRHCjN1KhvPup41'
    });
    
    $('#modalTitle').text('Running...');
    $('#modalBody').html('<pre id="output"></pre>'); 
    $('#outputModal').modal('show');

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
                        fontSize: "12pt"
                    });

    var className = $("#mainClass").val();
    if (className === "" || className === undefined) className = "Main";
    
    var body = {
        version: 1,
        compile: {
            version: 1,
            mainClass: className,
            sourceFiles: [
                            {
                                name: className + '.java',
                                contents: editor.getValue().split(/\r?\n/)
                            }
                        ]
        },
        "test-type": "run"
    };
    
    var params = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };
    
    var additionalParams = {};
    
    var start = new Date().getTime();
    
    apigClient.helloFunctionPost(params, body, additionalParams)
        .then(function(result){
    
            var timeDiff = (new Date().getTime()) - start;
            $('#exTime').html('Execution time: ' + (timeDiff) + 'ms');
            
            returntext = result.data.result;
            
            var success = 'Failed';
            if (result.data.succeeded) {
                success = 'Succeeded';
            }
            
            $('#modalTitle').text('Execution ' + success);
            display.setValue(returntext);
            
        }).catch(function(result){
            var timeDiff = (new Date().getTime()) - start;
            $('#exTime').html('Execution time: ' + (timeDiff) + 'ms');
            
            $('#modalTitle').text('Execution Failed');
            $('#modalBody').html('<p>Failure communicating with server</p>');
        });
}