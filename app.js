/* This program gathers social media data (likes, shares, comments) of videos from 6 of the top Video publishers in facebook at
specific time intervals using Facebook's Graph API (specifically using the batch command to get a lot of data within a single http
request). This is done by collecting the likes, shares, comments of the last 3 published videos of UNILAD, LADbible, NTDTelevision,
TheDodo, 9GAG and the ViralThread. The time intervals are:
1) every 30 seconds (can change - see the variable postDay1TimeInterval) in the first
30 minutes of a new video's publication, 2) then once every hour for the first day 3) 2nd day, 4) 4th day 5) 1 week 6) 2nd week
7) 3rd week 4) 4th week

The data is saved in a mySQL database that has 8 tables: one table each for the 6 pages/publishers to record shares, likes and comments
at the specified intervals, and 2 tables for tracking the metadata for each video (which inlcudes ID, Link, message and pagename).
The first metadata table (activePostsMetaData) is different from the other (archivedPostsMetaData) in that the former has an
additional column called trackingStatus which keeps a track of the specific time interval/period that a post is in so that we
can determine when the next GET for the video's social data needs to happen. When all the timeintervals (4 weeks) are done, the video
is moved into the archivedPostsMetaData table.
The common key (like primary key) in all tables (page specific and metadata) is the video's object ID

The data recording is done 2 ways - each via the flow through 4 functions listed below.
1) The 1st interval is handled below by the recordNewPosts() function and the remaining are handled by the getAllTrackedPosts() function
2) recordNewPosts function (one of FB API contaning functions) calls the checkIfNewPost() function to query the database for the trackingStatus of all the activeposts
and the getAllTrackedPosts() which is the database query function calls the updateExistingPosts function (the other FB API contaning function)
3) The savePostInfo is the common fucntion between both of the above ways - it determines what should be recorded in the database
after each API call. Besides recording the social media data of the posts everytime this function is called,
it determines one of the following 3 for each post:
  a) If this is a new post, create a new row for it in the activePostsMetaData table and set trackingStatus to 1
  b) If this is an existing post, then simply increase the trackingStatus of the post by 1 in the activePostsMetaData table
  c) if it is past 4 weeks, delete the row from the activePostsMetaData table and add it to the archivedPostsMetaData table
4) The writeDB actually writes to the Datatbase after receiving instructions from savePostInfo function

A sendEmail function sends an email whenever any video's share count, like count or comment count goes above a certain limit
The returnParsedObject just makes it easier to access each of the properties of a video after receiving the post's main object from
Facebook's graph API.
The way to terminate the app is to set the trackingStatus value of either the first or the second row in the activePostsMetaData
table to -100. This is checked every one hour by the getAllTrackedPosts, so it may take a maximum of one hour after it is set for
the app to terminate.
The getPages function simply gets some basic data of each othe 6 pages, besides storing the IDs for each of the 6 pages
The setIntervalSynchronous function allows the execution of setInterval in a synchronous way (https://gist.github.com/AndersDJohnson/4385908)
*/

var connect = require('connect'),
    fbsdk = require('facebook-sdk'),
    fs = require('fs'),
    mysql = require('mysql');

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var newReq;
var initialMonitorTimeInterval = 30000; // in milliseconds for setInterval
var postDay1TimeInterval = 3600000; // in milliseconds for setInterval
var timeTrackingCodes = new function () {
  this.hour1 = 60; // (no. of times to get initialMonitorTimeInterval to 30 minutes )
  this.day1 = this.hour1 + 24; // (no. of times to get initialMonitorTimeInterval to 30 minutes ) + 24 (for ever hour check)
  this.day2 = this.day1+1;
  this.day4 = this.day1+2;
  this.week1 = this.day1+3;
  this.week2 = this.day1+4;
  this.week3 = this.day1+5;
  this.week4 = this.day1+6;
};

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

    // setInterval (function () {recordNewPosts();}, initialMonitorTimeInterval);
    // setInterval (function () {getAllTrackedPosts(function (trackedPostsArray) {updateExistingPosts(trackedPostsArray);});}, postDay1TimeInterval);
    // getAllTrackedPosts(function (trackedPostsArray, index) { updateExistingPosts(trackedPostsArray, index);});
   setIntervalSynchronous (function () {recordNewPosts();}, initialMonitorTimeInterval);
   setIntervalSynchronous (function () {getAllTrackedPosts(function (trackedPostsArray) {updateExistingPosts(trackedPostsArray);});}, postDay1TimeInterval);
  })
  .listen(port);

function recordNewPosts() {

  newReq.facebook.api('', 'POST', {
        batch: [
            { method: 'GET', relative_url: '/146505212039213/posts?fields=id', name: 'UNILAD' }
            , { method: 'GET', depends_on: 'UNILAD', relative_url: '?ids={result=UNILAD:$.data.*.id}&fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link,created_time,message' }
           ,{ method: 'GET', relative_url: '/199098633470668/posts?fields=id', name: 'LADbible' }
           , { method: 'GET', depends_on: 'LADbible', relative_url: '?ids={result=LADbible:$.data.*.id}&fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link,created_time,message' }
           ,{ method: 'GET', relative_url: '/179417642100354/posts?fields=id', name: 'NTDTelevision' }
           , { method: 'GET', depends_on: 'NTDTelevision', relative_url: '?ids={result=NTDTelevision:$.data.*.id}&fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link,created_time,message' }
           ,{ method: 'GET', relative_url: '/363765800431935/posts?fields=id', name: 'ViralThread' }
           , { method: 'GET', depends_on: 'ViralThread', relative_url: '?ids={result=ViralThread:$.data.*.id}&fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link,created_time,message' }
           ,{ method: 'GET', relative_url: '/21785951839/posts?fields=id', name: 'NineGAG' }
           , { method: 'GET', depends_on: 'NineGAG', relative_url: '?ids={result=NineGAG:$.data.*.id}&fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link,created_time,message' }
           ,{ method: 'GET', relative_url: '/334191996715482/posts?fields=id', name: 'TheDodo' }
           , { method: 'GET', depends_on: 'TheDodo', relative_url: '?ids={result=TheDodo:$.data.*.id}&fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link,created_time,message' }

        ]
    },
      function (response){
        //  console.log(response);
        var timeNow = new Date();
        console.log(timeNow);
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
                      pageName='NineGAG';
                      break;
                  case 11:
                      pageName='TheDodo';
                      break;
                  default:
                      break;
              }
              var resObj = JSON.parse(response[i].body);
              // console.log(resObj);
              var postsCount = 0;
                for (var property in resObj) {
                  if (resObj.hasOwnProperty(property) && postsCount <3) {
                    var resID = resObj[property].id;
                    var postObj = resObj[property];
                     // console.log(resID + pageName);
                     postsCount++;
                    // if (resID!="empty" && resID!=undefined && resID!=null)
                      var readQuery = "SELECT trackingStatus FROM activePostsMetaData WHERE postId='"+resID+"'";
                    // console.log(readQuery);
                      checkIfNewPost(readQuery, postObj, function (trackingStatus, postObj, pageName) {savePostInfo(trackingStatus, postObj, pageName);}, pageName);
                  }
                }
          }
      }
    ), {scope: 'publish_actions'};

}

function savePostInfo (trackingStatus, postObj, pageName) {
    var parsedObj = returnParsedObject (postObj);
        if (!trackingStatus) {
          var query2 = "INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES (?, ?, ? , ?, ?, 1)";
          var queryParameters2 = [pageName, parsedObj.id, parsedObj.created_time, parsedObj.message, parsedObj.link];
        }
        else if (trackingStatus >= timeTrackingCodes.week4) {
          var query2 = "DELETE FROM activePostsMetaData WHERE postId = ?";
          var queryParameters2 = [parsedObj.id];
          writeDB(query2, queryParameters2);

          var query3 = "INSERT INTO archivedPostsMetaData (pageName, postId, createdTime, message, link) VALUES (?, ?, ? , ?, ?)";
          var queryParameters3 = [pageName, parsedObj.id, parsedObj.created_time, parsedObj.message, parsedObj.link];
          writeDB(query3, queryParameters3);
          return;
        }
        else if (trackingStatus < timeTrackingCodes.week4) {
          var query2 = "UPDATE activePostsMetaData SET trackingStatus = ? WHERE postId = ?";
          var queryParameters2 = [trackingStatus+1, parsedObj.id];
        }
        var query1 = "INSERT INTO ?? (postId, recordTime, shares, likes, comments) VALUES (?, ?, ?, ?, ?)";
        var timeNow = new Date();
        var queryParameters1 = [pageName, parsedObj.id, timeNow, parsedObj.shares, parsedObj.likes, parsedObj.comments];
        writeDB(query1, queryParameters1);
        writeDB(query2, queryParameters2);
}

function getPages() {
    newReq.facebook.api('/', 'GET', {ids: '146505212039213,199098633470668,179417642100354,363765800431935,21785951839,334191996715482',
                            fields: 'name,id,fan_count'
                          },
                          function (response){
                              // console.log(response);
                          }
    ), {scope: 'publish_actions'};
}

function sendEmail (postObj) {
  var parsedObj = returnParsedObject (postObj);
  var emailData = [];

    if ((parseInt(parsedObj.shares) > 80000) || (parseInt(parsedObj.likes) > 100000) || (parseInt(parsedObj.comments) > 80000) )
    {
      emailData.push(" shares: " + parsedObj.shares, " likes: " + parsedObj.likes,
      " comments: "+parsedObj.comments, " created time: " + parsedObj.created_time, " message: " + parsedObj.message,
      " link: "+parsedObj.link);

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
        // console.log('Email sent: ' + info.response);
      }
    });
  }
}

function checkIfNewPost(query, postObj, callback, pageName) {
  con.query(query, function (err, result) {
      //console.log(result[0][Object.keys(result[0])[0]]);
      var trackingStatus;
       if (result.length!=0) {
         trackingStatus = result[0][Object.keys(result[0])[0]];
        }
        else {
          trackingStatus = 0;
        }
        if (trackingStatus<timeTrackingCodes.hour1) {
          callback(trackingStatus, postObj, pageName);
        }
    });
}

function getAllTrackedPosts(callback) {
  con.query('SELECT postId, createdTime, trackingStatus, pageName FROM activePostsMetaData', function (err, result) {
    //  console.log(result[0][Object.keys(result[0])[0]]);
      if ((result[0][Object.keys(result[0])[2]] == -100) || (result[1][Object.keys(result[0])[2]] == -100)) {
        console.log('App Terminated successfully');
        process.exit();
      }
      for (var i=0; i<result.length; i++) {
        callback(result, i);
      }
    });
}

// in the following updateExistingPosts function 0 - postId, 1-createdTime, 2-trackingStatus, 3-pageName
function updateExistingPosts(trackedPostsArray, i) {
  // console.log(i);
    newReq.facebook.api('', 'POST', {
          batch: [
              { method: 'GET', relative_url: trackedPostsArray[i][Object.keys(trackedPostsArray[0])[0]]+'?fields=id,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),link,created_time,message' }
          ]
      },
        function (response){
          //  console.log(response);
          //console.log(updatePostNow);
          // console.log(postAgeInDays);
          var postId = trackedPostsArray[i][Object.keys(trackedPostsArray[0])[0]];
          var createdTime = trackedPostsArray[i][Object.keys(trackedPostsArray[0])[1]];
          var trackingStatus = trackedPostsArray[i][Object.keys(trackedPostsArray[0])[2]];
          var pageName = trackedPostsArray[i][Object.keys(trackedPostsArray[0])[3]];
          var timeNow = new Date();
          var time1 = new Date(createdTime);
          var time2 = new Date(timeNow);
          var postAgeInDays = Math.floor((time2 - time1)/(1000*60*60*24));
          var updatePostNow = false;
          // console.log(Math.floor((time2 - time1)/(1000*60*60*24)));
          if ((trackingStatus >=timeTrackingCodes.hour1) && (trackingStatus<timeTrackingCodes.day1)) {
            updatePostNow = true;
          }
        switch(trackingStatus) {
            case timeTrackingCodes.day2:
              if (postAgeInDays>1) {
                 updatePostNow = true;
              }
                break;
            case timeTrackingCodes.day4:
              if (postAgeInDays>3) {
                 updatePostNow = true;
              }
                break;
            case timeTrackingCodes.week1:
              if (postAgeInDays>6) {
                 updatePostNow = true;
              }
                break;
            case timeTrackingCodes.week2:
              if (postAgeInDays>13) {
                 updatePostNow = true;
              }
                break;
            case timeTrackingCodes.week3:
              if (postAgeInDays>20) {
                 updatePostNow = true;
              }
                break;
            case timeTrackingCodes.week4:
              if (postAgeInDays>27) {
                 updatePostNow = true;
              }
                break;
            default:
                break;
          }

        //  console.log(createdTime+" "+postId+" "+trackingStatus);

            if (updatePostNow) {
                var postObj = JSON.parse(response[0].body);
                  // console.log(postObj);
                  /*  fs.appendFile("/Users/akhilkamma/Desktop/DEV/newProject2/testOutput-delete7.txt", JSON.stringify(postObj)+"\n", function(err) {
                       if(err) { return console.log(err); }
                       // console.log("The file was saved!");
                   }); */
                  // console.log("\n"+postId+" "+createdTime+" "+trackingStatus+" "+pageName+" "+updatePostNow);
                savePostInfo(trackingStatus, postObj, pageName);
                 sendEmail (postObj);
            }
        }
      ), {scope: 'publish_actions'};
}

function writeDB (query, queryParameters) {
  /* to use variables set a '?' in place of them and then set the value for it in the second paramter of the con.query method -
  if more than one variable, then use multiple question marks and then replace the second paramter of the con.query method with an array
  - see https://stackoverflow.com/questions/41168942/how-to-input-a-nodejs-variable-into-an-sql-qyery for more details */
  /*use ?? for variable identifiers and not string values themselves - https://stackoverflow.com/questions/30829878/variable-as-table-name-in-node-js-mysql */
  con.query(query, queryParameters, function (err, result) {
    if (err) throw err;
    // console.log("1 record inserted");
  });
}

function returnParsedObject (postObj) {
  var parsedObj = {id:'', shares:0, likes:0, comments: 0, created_time:'', link:'', message:''};
  if (postObj!=undefined) {
    parsedObj.id = postObj.id;
  }
  else {
    parsedObj.id = "empty";
  }

  if (postObj.shares!=undefined) {
    parsedObj.shares = postObj.shares.count;
  }
  else {
    parsedObj.shares = null;
  }

  if (postObj.likes.summary!=undefined) {
    parsedObj.likes = postObj.likes.summary.total_count;
  }
  else {
    parsedObj.likes = null;
  }

  if (postObj.comments.summary!=undefined) {
      parsedObj.comments=postObj.comments.summary.total_count;
  }
  else {
    parsedObj.comments=null;
  }

  if (postObj!=undefined) {
    parsedObj.link=postObj.link;
  }
  else {
  parsedObj.link=null;
  }
  if (postObj!=undefined) {
    parsedObj.created_time=postObj.created_time;
  }
  else {
    parsedObj.created_time=null;
  }
  if (postObj!=undefined) {
    parsedObj.message=postObj.message;
  }
  else {
  parsedObj.message=null;
  }
  return parsedObj;
}

var setIntervalSynchronous = function (func, delay) {
  var intervalFunction, timeoutId, clear;
  // Call to clear the interval.
  clear = function () {
    clearTimeout(timeoutId);
  };
  intervalFunction = function () {
    func();
    timeoutId = setTimeout(intervalFunction, delay);
  }
  // Delay start.
  timeoutId = setTimeout(intervalFunction, delay);
  // You should capture the returned function for clearing.
  return clear;
};
console.log('using build from 6/25/17 7:51 PM');
console.log('Listening for http requests on port ' + port);
