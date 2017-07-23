use pocu3;

delete from UNILAD;
delete from LADbible;
delete from NTDTelevision;
delete from NineGAG;
delete from TheDodo;
delete from ViralThread;
delete from activePostsMetaData;

delete from  archivedPostsMetaData3;
delete from  LADbible3;
delete from NTDTelevision3;
delete from NineGAG3;
delete from TheDodo3;
delete from UNILAD3;
delete from ViralThread3;
delete from activePostsMetaData3;

drop table  archivedPostsMetaDataOld1;
drop table  LADbibleOld1;
drop table NTDTelevisionOld1;
drop table NineGAGOld1;
drop table TheDodoOld1;
drop table UNILADOld1;
drop table ViralThreadOld1;
drop table activePostsMetaDataOld1;

drop table archivedPostsMetaData3;
drop table LADbible3;
drop table NTDTelevision3;
drop table NineGAG3;
drop table TheDodo3;
drop table UNILAD3;
drop table ViralThread3;
drop table activePostsMetaData3;

delete from activePostsMetaData where postId='testId4';
describe activePostsMetaData;
describe archivedPostsMetaData;
describe UNILAD; 
UPDATE activePostsMetaData SET postId = '146505212039213_2821425634547144' WHERE postId = 'postID1'; 
SELECT trackingStatus FROM activePostsMetaData WHERE postId = 'testId6';
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link) VALUES ('UNILAD', '334191996715482_1164221083712565', '2017-06-22 09:23:44' , 'hi', 'https://testurl.com');
DELETE FROM activePostsMetaData WHERE postId = '334191996715482_1164221083712565';
drop table uniladPostsSocialData;
CREATE TABLE UNILAD (
	postId VARCHAR(35) NULL,
	recordTime DATETIME NULL,
	shares MEDIUMINT NULL,
	likes MEDIUMINT NULL,
	comments MEDIUMINT NULL
);
CREATE TABLE LADbible (
	postId VARCHAR(35) NULL,
	recordTime DATETIME NULL,
	shares MEDIUMINT NULL,
	likes MEDIUMINT NULL,
	comments MEDIUMINT NULL
);
CREATE TABLE NTDTelevision (
	postId VARCHAR(35) NULL,
	recordTime DATETIME NULL,
	shares MEDIUMINT NULL,
	likes MEDIUMINT NULL,
	comments MEDIUMINT NULL
);
CREATE TABLE NineGAG (
	postId VARCHAR(35) NULL,
	recordTime DATETIME NULL,
	shares MEDIUMINT NULL,
	likes MEDIUMINT NULL,
	comments MEDIUMINT NULL
);
CREATE TABLE TheDodo (
	postId VARCHAR(35) NULL,
	recordTime DATETIME NULL,
	shares MEDIUMINT NULL,
	likes MEDIUMINT NULL,
	comments MEDIUMINT NULL
);
CREATE TABLE ViralThread (
	postId VARCHAR(35) NULL,
	recordTime DATETIME NULL,
	shares MEDIUMINT NULL,
	likes MEDIUMINT NULL,
	comments MEDIUMINT NULL
);

CREATE TABLE activePostsMetaData LIKE activePostsMetaDataOld1; 
CREATE TABLE LADbible3 LIKE LADbible; 
CREATE TABLE NTDTelevision3 LIKE NTDTelevision; 
CREATE TABLE UNILAD3 LIKE UNILAD; 
CREATE TABLE NineGAG3 LIKE NineGAG; 
CREATE TABLE TheDodo3 LIKE TheDodo; 
CREATE TABLE ViralThread3 LIKE ViralThread; 
CREATE TABLE archivedPostsMetaData LIKE archivedPostsMetaDataOld1; 

describe activePostsMetaDataOld1; 

INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('testPage1', 'postID1', '2017-06-22 09:23:44' , 'hi1', 'https://testurl1.com', 55);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('testPage2', 'postID2', '2017-06-22 10:23:44' , 'hi2', 'https://testurl2.com', 87);
INSERT INTO UNILAD (postId, recordTime, shares, likes, comments) VALUES ('postID1', '2017-06-22 09:23:44' , 10, 11, 12);
SELECT trackingStatus FROM activePostsMetaData WHERE postId='postID1';
INSERT INTO UNILAD (postId, recordTime, shares, likes, comments) VALUES ('postID1', '2017-06-22 09:23:44' , 10, 11, 12);
SELECT postId, createdTime, trackingStatus FROM activePostsMetaData;
UPDATE activePostsMetaData SET createdTime = '2017-06-21 10:23:44' WHERE postId = '146505212039213_2821392611217113'; 
UPDATE activePostsMetaData SET pageName = 'UNILAD' WHERE message = 'hi1'; 
UPDATE activePostsMetaData SET createdTime = '2017-06-21 10:23:44';
show tables;
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2818353644854343', '2017-06-22 09:23:44' , 'stay', 'https://testurl3.com', 43);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2821249621231412', '2017-06-23 09:23:44' , 'stay', 'https://testurl2.com', 60);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2821098141246560', '2017-06-22 09:23:44' , 'stay', 'https://testurl3.com', 61);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2820817281274646', '2017-06-22 09:23:44' , 'stay', 'https://testurl3.com', 84);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2820861541270220', '2017-06-22 09:23:44' , 'stay', 'https://testurl3.com', 85);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2820195294670178', '2017-06-24 09:23:44' , '81', 'https://testurl2.com', 81);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2819928494696858', '2017-06-22 09:23:44' , '82', 'https://testurl3.com', 81);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2820817281274646', '2017-06-23 09:23:44' , '82', 'https://testurl4.com', 82);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2818353644854343', '2017-06-22 09:23:44' , '83', 'https://testurl5.com', 82);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2820861541270220', '2017-06-23 09:23:44' , '83', 'https://testurl6.com', 83);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2818418604847847', '2017-06-20 09:23:44' , '84', 'https://testurl7.com', 83);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2820903251266049', '2017-06-23 09:23:44' , '84', 'https://testurl8.com', 84);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2818406698182371', '2017-06-17 09:23:44' , '85', 'https://testurl9.com', 84);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2820947694594938', '2017-06-23 09:23:44' , '85', 'https://testur20.com', 85);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2820966644593043', '2017-06-10 09:23:44' , '86', 'https://testurl21.com', 85);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2821001161256258', '2017-06-23 09:23:44' , '86', 'https://testurl22.com', 86);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2820823554607352', '2017-06-03 09:23:44' , '87', 'https://testurl23.com', 86);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2821081434581564', '2017-06-23 09:23:44' , '87', 'https://testurl24.com', 87);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', '146505212039213_2821065914583116', '2017-05-27 09:23:44' , 'archive', 'https://testurl25.com', 87);
INSERT INTO activePostsMetaData (pageName, postId, createdTime, message, link, trackingStatus) VALUES ('UNILAD', 'delete', '2017-05-26 09:23:44' , 'hi14', 'https://testurl25.com', 4);
UPDATE activePostsMetaData SET trackingStatus = 2 WHERE postId = '146505212039213_2821392611217113';
UPDATE activePostsMetaData SET trackingStatus = 44 WHERE postId = '146505212039213_2821249621231412';
select * from activePostsMetaData;
select trackingStatus from activePostsMetaData;
select * from archivedPostsMetaData;
select * from UNILAD;
select * from LADbible;
select * from NTDTelevision;
select * from NineGAG;
select * from TheDodo;
select * from ViralThread;

RENAME TABLE activePostsMetaData to activePostsMetaDataOld1;
RENAME TABLE UNILAD to UNILADOld1;
RENAME TABLE LADbible to LADbibleOld1;
RENAME TABLE NTDTelevision to NTDTelevisionOld1;
RENAME TABLE NineGAG to NineGAGOld1;
RENAME TABLE TheDodo to TheDodoOld1;
RENAME TABLE ViralThread to ViralThreadOld1;
RENAME TABLE archivedPostsMetaData to archivedPostsMetaDataOld1;
UPDATE activePostsMetaData SET trackingStatus=-100 WHERE postId='146505212039213_2823439374345770';


select * from UNILAD where postId = '146505212039213_2823854954304212';
select trackingStatus,pageName from activePostsMetaData where pageName !='NTDTelevision';
select trackingStatus from activePostsMetaData where (trackingStatus < 35 and trackingStatus >10);
select count(*) from UNILAD;
select count(*) from UNILAD WHERE postId = '146505212039213_2824626754227032';
select count(*) from LADbible;
select count(*) from NTDTelevision;
select count(*) from NineGAG;
select count(*) from TheDodo;
select count(*) from ViralThread;
select count(*) from ViralThread;
select count(*) from activePostsMetaData;
select count(*) from UNILAD where postId='146505212039213_2823439374345770';
select * from UNILADOld1;

select * from activePostsMetaData3;
select * from UNILAD3;
select * from LADbible3;
select * from NTDTelevision3;
select * from NineGAG3;
select * from TheDodo3;
select * from ViralThread3;
select * from archivedPostsMetaData3;

select * from activePostsMetaData;
select trackingStatus from activePostsMetaData;
select * from archivedPostsMetaData;
select * from UNILAD;
select * from LADbible;
select * from NTDTelevision where recordTime > '2017-07-16';
select * from UNILAD where recordTime > '2017-06-29';
select * from NineGAG where recordTime > '2017-06-29';
select * from TheDodo where recordTime > '2017-06-29';
select * from ViralThread where recordTime > '2017-06-29';
select * from LADbible where recordTime > '2017-06-29';
select * from NineGAG;
select * from TheDodo;
select * from ViralThread;
select max(shares) from UNILAD;
select max(shares) from LADbible;
select max(shares) from NTDTelevision;
select max(shares) from NineGAG;
select max(shares) from TheDodo;
select max(shares) from ViralThread;
select max(trackingStatus) from activePostsMetaData;

select distinct(postId) from UNILAD where shares > 80000;
select * from activePostsMetaData where postId = '146505212039213_2827582783931429';
select table_schema, sum((data_length+index_length)/1024/1024) AS MB from information_schema.tables group by 1;

show tables;
use pocu3;
