var gitHub = {};
            
/*
 * Make sure that github is logged in before calling callback
 * if there is an error, call errorCallback with an error param
 */
gitHub.ensureLogin = function(callback, errorCallback) {
    // Determine if there is a current oauth session
    var session = hello('github').getAuthResponse();
    var currentTime = (new Date()).getTime() / 1000;
    var online = session && session.access_token && session.expires > currentTime;

    if(online) {
        // If there is an active session, perform the callback
        callback();
    }
    else {
        // Otherwise, login
        var options = {};
        options.scope = ['user', 'repo', 'gist'];
        options.force = false;

        hello('github', options).login().then(function() {
            // Then call the callback
            callback()
        }, 
        function(e) {
            // If there was an error, send it to the callback 
            errorCallback(e);
        });
    }    
}

/*
 * Get all of the user's repositories
 */
gitHub.getRepos = function(done, error) {
    /*
     * Handle a repo response from GitHub
     */
    var addAllRepos = function(target, json, done, error) {
        // Add all returned repos to the list
        json.data.forEach(function(data) {
            var repo = {};
            repo.id = data.id;
            repo.owner = data.owner.login;
            repo.name = data.name;
            repo.full_name = data.full_name;
            repo.description = data.description;
            repo.url = data.url;
            repo.branches_url = data.branches_url;
            repo.git_commits_url = data.git_commits_url;
            repo.default_branch = data.default_branch;
            repo.permissions = data.permissions;
            target.push(repo);
        });

        // If there are more pages of repos,
        if (json.paging && json.paging.next) {
            // Request the next page of repos
            hello('github').api(json.paging.next).then(
                function(response){
                    console.log("retrieving next page of repos...");
                    // and handle the repos
                    addAllRepos(target, response, done, error);
                },
                function(e) {
                    // If there is an error, report it
                    error(e);
                });
        }
        else {
            // If there are no more pages of repos, send them to the caller
            done(target);
        }
    }

    // Clear out the list of repos
    gitHub.repos = [];

    // Make sure that the user is logged in
    gitHub.ensureLogin (function () {
        // Then request the user's repos
        hello('github').api('/user/repos').then(
            function(response){
                // Once the repos are received, add them to the repo list
                addAllRepos(gitHub.repos, response, done, error);
            },
            function (e) {
                // If there was an error, report it
                error(e);
            });
    },
    function(e) {
        // If there was an error logging in, report it
        error(e);
    });
};

/*
 * Load the files from a github repo into a FileManager
 */
gitHub.loadRepo = function(fileManager, repo) {
    console.log(repo.default_branch);
    console.log(repo.branches_url);
    
    var branch = repo.branches_url.replace(/\{*\}/, "/" + repo.default_branch);
    
    hello.api(branch).then(function(response) {
        console.log(response);
    },
    function(e) {
        alert('Error loading Repo branch: ' + e.error.message);
    });
};

/*
 * Callback for auth session starts
 */
function sessionStart() {
    hello('github').api('/me').then(function(json) {
        gitHub.username = json.login;
        gitHub.repos_url = json.repos_url;
    },
    function(e) {

    });
}

/*
 * Prepare for oauth login to github
 */
hello.init({github: 'b80ec7eaa799156bba33'},
           {redirect_uri: 'https://run.mycode.run/redirect.html',
            oauth_proxy: 'https://auth-server.herokuapp.com/proxy'});

hello.on('auth.login', sessionStart);