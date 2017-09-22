/* global FileManager, Infinity, ace */

/*
 * Run the html/javascript code contained in the file manager.
 * 
 * If there is an index.html file, merge the script files and style sheets into
 * the index.html file, then displaying the resulting html.
 * 
 * If the files interface is off, generate an index.html file, add the script to
 * it, and display the resulting html.
 * 
 */
function runCode() {
    $.get('runJS.html', function( response) {
        let ifr = document.getElementById("outputFrame");
        let src = response.replace('<!--#SCRIPTS#-->', 
            '<script>' + FileManager.getAllJSFileContents() + '</script>');
        src = src.replace('<!--#STARTFUNCTION#-->', FileManager.getStartFunction());
        
        ifr.srcdoc=src;
        
        /*
        let doc = ifr.contentDocument? ifr.contentDocument: ifr.contentWindow.document;
        
        doc.write(src);
        */
    });
}

/*
 * Run the code contained in the file manager, by merging the script and style
 * sheets into the index.html file, then displaying the result.
 */
function testCode() {
    $.get('runJS.html', function( response) {
        let ifr = document.getElementById("outputFrame");
        
        let folder = FileManager.getTestFolder();
        
        if (folder !== null) {
            let tests = FileManager.getAllJSFileContents(folder);

            let src = response.replace('<!--#SCRIPTS#-->', 
                '<script>' + FileManager.getAllJSFileContents() + tests 
                + '</script>');
        
            ifr.srcdoc=src;
        }
        else {
            ifr.srcdoc='No Test folder or Test cases found.';
        }
        /*
        let doc = ifr.contentDocument? ifr.contentDocument: ifr.contentWindow.document;
        
        doc.write(src);
        */
    });
}
