var gitHub = {};
            
/*
 * Make sure that github is logged in before calling callback
 * if there is an error, call errorCallback with an error param
 */
gitHub.ensureLogin = function(callback, errorCallback) {
    var session = hello('github').getAuthResponse();
    var currentTime = (new Date()).getTime() / 1000;
    var online = session && session.access_token && session.expires > currentTime;

    if(online) {
        callback();
    }
    else {
        var options = {};
        options.scope = ['user', 'repo', 'gist'];
        options.force = false;

        hello('github', options).login().then(function() {
            callback()
        }, 
        function(e) {
            errorCallback(e);
        });
    }    
}

gitHub.getRepos = function(done, error) {
    var addAllRepos = function(target, json, done, error) {
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

        if (json.paging && json.paging.next) {
            hello('github').api(json.paging.next).then(
                function(response){
                    console.log("retrieving next page of repos...");
                    addAllRepos(target, response, done, error);
                },
                function(e) {
                    error(e);
                });
        }
        else {
            done(target);
        }
    }

    gitHub.repos = [];

    gitHub.ensureLogin (function () {
        hello('github').api('/user/repos').then(
            function(response){
                addAllRepos(gitHub.repos, response, done, error);
            },
            function (e) {
                error(e);
            });
    },
    function(e) {
        error(e);
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