var connect = require('connect'),
    fbsdk = require('facebook-sdk');

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var postsReceived = false;
var gettingDataForPosts;
var gettingData;
var newReq;
var mysql = require('mysql');
var timeNow;

var con = mysql.createConnection({
  host: "pocu1.ceixhvsknluf.us-east-2.rds.amazonaws.com",
  user: "SYSTEM",
  password: "mysqlmysql",
  database : 'pocu1'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to Database!"); 
});

connect()
  .use(connect.favicon())
  .use(connect.cookieParser())
  .use(connect.bodyParser())
  .use(fbsdk.facebook({
    appId  : '1403540253067097',
    secret : 'df129fbb8b71be142628ece7fbfb1df0'
  }))

  .use(function(req, res, next) {

    newReq = req;

    if (req.facebook.getSession()) {

      // get my graph api information
      req.facebook.api('/me', function(me) {
        console.log(me);

        if (me.error) {
          res.end('An api error occured, so probably you logged out. Refresh to try it again...');
        } else {
          res.end('<a href="' + req.facebook.getLogoutUrl() + '">Logout</a>');
        }
      });

    } else {
      res.end('<a href="' + req.facebook.getLoginUrl() + '">Login</a>');
    }
  //getPeriodicPostsData ();
  // getBatchData();
  getPosts();
  // whatIsTheTimeNow();
  insertIntoDB ();

  })
  .listen(port);

function getPeriodicPostsData() {
      postsReceived = false;
      // gettingPosts = setInterval (getPosts, 500);
      getPosts();
      gettingDataForPosts = setInterval (function () {getPostData()}, 500);
      gettingData = setTimeout (function () {getPeriodicPostsData()}, 5000);
  }
function stopPeriodicPostsData() {
    clearTimeout (gettingData);
    console.log('get Stopped');
}
function getPosts() {
  if (!postsReceived) {
    newReq.facebook.api('/posts/', 'GET', {ids: '146505212039213,199098633470668,179417642100354,363765800431935,21785951839'},
                          function (response){
                              //console.log(response);
                              console.log("id: " + response["146505212039213"].data[0].id +
                              ", created time: " + response["146505212039213"].data[0].created_time +
                              ", message: " + response["146505212039213"].data[0].message);
                              // document.getElementById('getfbp').innerHTML=response;
                          }
    ), {scope: 'publish_actions'};
    postsReceived = true;
  //  clearInterval (gettingPosts);
  }
}
function getPostData() {
  if (postsReceived) {
    setTimeout ( function () {newReq.facebook.api('/', 'GET', {ids: '146505212039213_2778304435525931,146505212039213_2785434258146282',
                        fields: 'id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link'},
                          function (response){
                              //console.log(response);
                              // console.log(response["146505212039213_2778304435525931"]);
                              console.log("id: " + response["146505212039213_2778304435525931"].id +
                              ", Shares: " + response["146505212039213_2778304435525931"].shares.count +
                              ", Likes: " + response["146505212039213_2778304435525931"].likes.summary.total_count +
                              ", comments: " + response["146505212039213_2778304435525931"].comments.summary.total_count +
                              ", link: " + response["146505212039213_2778304435525931"].link);
                            //  document.getElementById('getfbp').innerHTML=response;
                          }
    ), {scope: 'publish_actions'};}, 1000);
   postsReceived = false;
   clearInterval (gettingDataForPosts);
  }
}

function getBatchData() {
  newReq.facebook.api('', 'POST', {
        batch: [
            { method: 'GET', relative_url: '/146505212039213/posts', name: 'unilad' }
            , { method: 'GET', depends_on: 'unilad', relative_url: '?ids={result=unilad:$.data.*.id}&fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link' }
           /* ,  { method: 'GET', relative_url: '{result=first:$.data.0.id}'} */
        ]
    },
      function (response){
          console.log(response);
      }
    ), {scope: 'publish_actions'};
}

function insertIntoDB () {
  timeNow = new Date();
  /* to use variables set a '?' in place of them and then set the value for it in the second paramter of the con.query method -
  if more than one variable, then use multiple question marks and then replace the second paramter of the con.query method with an array
  - see https://stackoverflow.com/questions/41168942/how-to-input-a-nodejs-variable-into-an-sql-qyery for more details */
  var sql = "INSERT INTO postMetaData (pageName, postId, createdTime, message, link) VALUES ('testPage', 'testId4', ? , 'testMsg', 'testLink')";
  con.query(sql, timeNow, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
}

/* function whatIsTheTimeNow () {
  setInterval (function () {var timeNow = new Date(); console.log(timeNow);}, 1000);
} */
console.log('Listening for http requests on port ' + port);
