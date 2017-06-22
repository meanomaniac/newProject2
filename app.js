var connect = require('connect'),
    fbsdk = require('facebook-sdk');

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var newReq;
var mysql = require('mysql');
var timeNow;
var resObj;
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

  // terminateApp();
   getPosts();
  // setInterval (function () {getPosts();}, 10000);
  // insertIntoDB ();
  // readDB("SELECT EXISTS(SELECT postId FROM postMetaData WHERE postId='testId5')", function (dbResult) {console.log(dbResult); });
  // writeDB("INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link) VALUES ('testPage', 'testId4', ? , 'testMsg', 'testLink')");

  })
  .listen(port);

function getPosts() {

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
        //  console.log(response);
          var pageName;
        for (var i=1; i<12; i=i+2) {
                switch(i) {
                  case 1:
                      pageName='UNILAD';
                      break;
                  case 3:
                      pageName='LADbible';
                      break;
                  case 5:
                      pageName='NTDTelevision';
                      break;
                  case 7:
                      pageName='ViralThread';
                      break;
                  case 9:
                      pageName='9GAG';
                      break;
                  case 11:
                      pageName='TheDodo';
                      break;
                  default:
                      break;
              }
              resObj = JSON.parse(response[i].body);
                for (var property in resObj) {
                  if (resObj.hasOwnProperty(property)) {
                    resID = resObj[property].id;
                    // console.log(resID);
                    // console.log(pageName);
                    if (resID!="empty" && resID!=undefined && resID!=null) {
                    //  var readQuery = "SELECT EXISTS(SELECT postId FROM activePostsMetaData WHERE postId='"+resID+"')";
                      var readQuery = "SELECT trackingStatus FROM activePostsMetaData WHERE postId='"+resID+"'";
                      readDB(readQuery, resObj[property], function (trackingStatus, resObj, pageName) {parseData(trackingStatus, resObj, pageName);}, pageName);
                    }
                  }
                }
          }
      }
    ), {scope: 'publish_actions'};

}

function parseData (trackingStatus, postObj, pageName) {
                  var parsedObj = {id:'', shares:0, likes:0, comments: 0, created_time:'', link:'', message:''};
                  var emailData = [];
                  // console.log(postObj);
                  if (postObj!=undefined) {
                  //  console.log("id: " + postObj.id);
                    parsedObj.id = postObj.id;
                  }
                  else {
                  //  console.log("id: " +"null");
                    parsedObj.id = "empty";
                  }

                  if (postObj.shares!=undefined) {
                  //  console.log("shares: " + postObj.shares.count);
                    parsedObj.shares = postObj.shares.count;
                    if (parseInt(postObj.shares.count) > 80000) {
                      emailData.push(" shares: " + postObj.shares.count);
                    }
                  }
                  else {
                  //  console.log("shares: " +"null");
                    parsedObj.shares = null;
                  }

                  if (postObj.likes.summary!=undefined) {
                  //  console.log("likes: " + postObj.likes.summary.total_count);
                    parsedObj.likes = postObj.likes.summary.total_count;
                    if (parseInt(postObj.likes.summary.total_count) > 100000) {
                      emailData.push(" likes: " + postObj.likes.summary.total_count);
                    }
                  }
                  else {
                  //  console.log("likes: " +"null");
                    parsedObj.likes = null;
                  }

                  if (postObj.comments.summary!=undefined) {
                  //  console.log("comments: "+postObj.comments.summary.total_count);
                      parsedObj.comments=postObj.comments.summary.total_count;
                    if (parseInt(postObj.comments.summary.total_count) > 50000) {
                      emailData.push(" comments: "+postObj.comments.summary.total_count);
                    }
                  }
                  else {
                  //  console.log("comments: " +"null");
                    parsedObj.comments=null;
                  }

                  if (postObj!=undefined) {
                  //  console.log("link: "+postObj.link);
                    parsedObj.link=postObj.link;
                    if (emailData.length > 0) {
                      emailData.push(" link: "+postObj.link);
                    }
                  }
                  else {
                //    console.log("link: " +"null");
                  parsedObj.link=null;
                  }
                  if (postObj!=undefined) {
                  //  console.log("created time: " + postObj.created_time);
                    parsedObj.created_time=postObj.created_time;
                    if (emailData.length > 0) {
                      emailData.push(" created time: " + postObj.created_time);
                    }
                  }
                  else {
                  //  console.log("created time: " +"null");
                    parsedObj.created_time=null;
                  }
                  if (postObj!=undefined) {
                  //  console.log("message: " + postObj.message);
                    parsedObj.message=postObj.message;
                    if (emailData.length > 0) {
                      emailData.push(" message: " + postObj.message);
                    }
                  }
                  else {
                  //  console.log("message: " +"null");
                  parsedObj.message=null;
                  }
                //  console.log("next");
                if (emailData.length > 0) {
                  // sendEmail(emailData);
                  // console.log(emailData);
                  // console.log(parsedObj);
                  // console.log(pageName);
                  emailData =[];
                }

        if (!trackingStatus) {
          var query2 = "INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link) VALUES (?, ?, ? , ?, ?)";
          var queryParameters2 = [pageName, parsedObj.id, parsedObj.created_time, parsedObj.message, parsedObj.link];
        }
        else if (trackingStatus >= 86) {
          //delete from activepostsmeta and update archivedpostsmeta
        }
        else if (trackingStatus < 86) {
          var query2 = "UPDATE activePostsMetaData SET trackingStatus = ? WHERE postId = ?";
          var queryParameters2 = [trackingStatus, parsedObj.id];
        }
        trackingStatus++;
        var query1 = "INSERT INTO uniladPostsSocialData (postId, recordTime, shares, likes, comments) VALUES (?, ?, ?, ?, ?)";
        timeNow = new Date();
        var queryParameters1 = [parsedObj.id, timeNow, parsedObj.shares, parsedObj.likes, parsedObj.comments];
      //  writeDB(query1);
      //  writeDB(query2);
}

function getPages() {
    newReq.facebook.api('/', 'GET', {ids: '146505212039213,199098633470668,179417642100354,363765800431935,21785951839,334191996715482',
                            fields: 'name,id,fan_count'
                          },
                          function (response){
                              console.log(response);
                          }
    ), {scope: 'publish_actions'};
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

function readDB(query, resObj, callback, pageName) {
  con.query(query, function (err, result) {
      //console.log(result[0][Object.keys(result[0])[0]]);
      var trackingStatus;
       if (result.length!=0) {
         trackingStatus = result[0][Object.keys(result[0])[0]];
        }
        else {
          trackingStatus = 0;
        }
    /*   if (result[0][Object.keys(result[0])[0]]) {
          console.log('Row exists');
          isNewPost = true;
        // postTrackResultAchieved = true;
          }
        else {
      //  console.log('Row doesn\'t exist');
          isNewPost = false;
        } */

        callback(trackingStatus, resObj, pageName);

    });
}

function writeDB (query, queryParameters) {
  /* to use variables set a '?' in place of them and then set the value for it in the second paramter of the con.query method -
  if more than one variable, then use multiple question marks and then replace the second paramter of the con.query method with an array
  - see https://stackoverflow.com/questions/41168942/how-to-input-a-nodejs-variable-into-an-sql-qyery for more details */
  con.query(query, queryParameters, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
}

console.log('Listening for http requests on port ' + port);
