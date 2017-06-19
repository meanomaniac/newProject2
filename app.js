var connect = require('connect'),
    fbsdk = require('facebook-sdk');

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var postsReceived = false;
var gettingDataForPosts;
var gettingData;
var newReq;
var mysql = require('mysql');
var timeNow;
var resObj;
var emailData = [];
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'applepulpfiction@gmail.com',
    pass: 'penpineapple'
  }
});

var con = mysql.createConnection({
  host: "pocu3.ceixhvsknluf.us-east-2.rds.amazonaws.com",
  post: "3306",
  user: "SYSTEM",
  password: "mysqlmysql",
  database : 'pocu3'
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
  getBatchData();
  // terminateApp();
  // getPosts();
  // whatIsTheTimeNow();
  // insertIntoDB ();
  // getPages();

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
    newReq.facebook.api('/posts/', 'GET', {ids: '146505212039213,199098633470668,179417642100354,363765800431935,21785951839,334191996715482'},
                          function (response){
                              console.log(response);
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
            { method: 'GET', relative_url: '/146505212039213/posts', name: 'UNILAD' }
            , { method: 'GET', depends_on: 'UNILAD', relative_url: '?ids={result=UNILAD:$.data.*.id}&fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link,created_time,message' }
           ,{ method: 'GET', relative_url: '/199098633470668/posts', name: 'LADbible' }
           , { method: 'GET', depends_on: 'LADbible', relative_url: '?ids={result=LADbible:$.data.*.id}&fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link,created_time,message' }
           ,{ method: 'GET', relative_url: '/179417642100354/posts', name: 'NTDTelevision' }
           , { method: 'GET', depends_on: 'NTDTelevision', relative_url: '?ids={result=NTDTelevision:$.data.*.id}&fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link,created_time,message' }
           ,{ method: 'GET', relative_url: '/363765800431935/posts', name: 'ViralThread' }
           , { method: 'GET', depends_on: 'ViralThread', relative_url: '?ids={result=ViralThread:$.data.*.id}&fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link,created_time,message' }
           ,{ method: 'GET', relative_url: '/21785951839/posts', name: '9GAG' }
           , { method: 'GET', depends_on: '9GAG', relative_url: '?ids={result=9GAG:$.data.*.id}&fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link,created_time,message' }
           ,{ method: 'GET', relative_url: '/334191996715482/posts', name: 'TheDodo' }
           , { method: 'GET', depends_on: 'TheDodo', relative_url: '?ids={result=TheDodo:$.data.*.id}&fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link,created_time,message' }

        ]
    },
      function (response){
        for (var i=1; i<12; i=i+2) {
              resObj = JSON.parse(response[i].body);
              //  console.log(response);
                for (var property in resObj) {
                    if (resObj.hasOwnProperty(property)) {
                        // console.log(resObj[property]);
                        if (resObj[property]!=undefined) {
                        //  console.log("id: " + resObj[property].id);
                        }
                        else {
                        //  console.log("id: " +"null");
                        }

                        if (resObj[property].shares!=undefined) {
                        //  console.log("shares: " + resObj[property].shares.count);
                          if (parseInt(resObj[property].shares.count) > 80000) {
                            emailData.push("shares: " + resObj[property].shares.count);
                          }
                        }
                        else {
                        //  console.log("shares: " +"null");
                        }

                        if (resObj[property].likes.summary!=undefined) {
                        //  console.log("likes: " + resObj[property].likes.summary.total_count);
                          if (parseInt(resObj[property].likes.summary.total_count) > 200000) {
                            emailData.push("likes: " + resObj[property].likes.summary.total_count);
                          }
                        }
                        else {
                        //  console.log("likes: " +"null");
                        }

                        if (resObj[property].comments.summary!=undefined) {
                        //  console.log("comments: "+resObj[property].comments.summary.total_count);
                          if (parseInt(resObj[property].comments.summary.total_count) > 50000) {
                            emailData.push("comments: "+resObj[property].comments.summary.total_count);
                          }
                        }
                        else {
                        //  console.log("comments: " +"null");
                        }

                        if (resObj[property]!=undefined) {
                        //  console.log("link: "+resObj[property].link);
                          if (emailData.length > 0) {
                            emailData.push("link: "+resObj[property].link);
                          }
                        }
                        else {
                      //    console.log("link: " +"null");
                        }
                        if (resObj[property]!=undefined) {
                        //  console.log("created time: " + resObj[property].created_time);
                          if (emailData.length > 0) {
                            emailData.push("created time: " + resObj[property].created_time);
                          }
                        }
                        else {
                        //  console.log("created time: " +"null");
                        }
                        if (resObj[property]!=undefined) {
                        //  console.log("message: " + resObj[property].message);
                          if (emailData.length > 0) {
                            emailData.push("message: " + resObj[property].message);
                          }
                        }
                        else {
                        //  console.log("message: " +"null");
                        }
                      //  console.log("next");
                      if (emailData.length > 0) {
                        sendEmail(emailData);
                        emailData =[];
                      }
                    }
                }
          }
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

function getPages() {
  if (!postsReceived) {
    newReq.facebook.api('/', 'GET', {ids: '146505212039213,199098633470668,179417642100354,363765800431935,21785951839,334191996715482',
                            fields: 'name,id,fan_count'
                          },
                          function (response){
                              console.log(response);
                          }
    ), {scope: 'publish_actions'};
  }
}
function terminateApp () {
  setInterval (function () {
    con.query("SELECT pageName FROM postMetaData WHERE link = 'testLink'", function (err, result) {
        console.log(result[0].pageName);
          if (result[0].pageName=="testPage") {
            console.log('App Terminated successfully');
            process.exit();
        }
      });
  }, 5000);
}

function sendEmail (emailData) {
  console.log(emailData);
  var mailOptions = {
    from: 'applepulpfiction@gmail.com',
    to: 'applepulpfiction@gmail.com',
    subject: 'potential vid',
    text: ' ' + emailData
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
/* function whatIsTheTimeNow () {
  setInterval (function () {var timeNow = new Date(); console.log(timeNow);}, 1000);
} */
console.log('Listening for http requests on port ' + port);
