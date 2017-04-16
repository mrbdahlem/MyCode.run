function runCode() {
    // Create a client using the public API key
    var apigClient = apigClientFactory.newClient({
        apiKey: 'NfPLJMgMRZ59PS0Le1979LzuenRHCjN1KhvPup41'
    });

    var body = {
        //This is where you define the body of the request
    };

    apigClient.HelloFunctionPost(params, body, additionalParams)
        .then(function(result){
           alert(result);
        }).catch( function(result){
           alert(result);
            //This is where you would put an error callback
        });
}