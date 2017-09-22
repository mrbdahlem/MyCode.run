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
        
        let doc = ifr.contentDocument? ifr.contentDocument: ifr.contentWindow.document;

        
        doc.write(response.replace('<!--#SCRIPTS#-->', 
            '<script>' + FileManager.getAllJSFileContents() + '</script>'));
        
    });
}

/*
 * Run the code contained in the file manager, by merging the script and style
 * sheets into the index.html file, then displaying the result.
 */
function testCode() {

}
