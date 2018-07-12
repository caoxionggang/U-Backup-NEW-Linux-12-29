create table users
(
  userID INT UNSIGNED AUTO_INCREMENT NOT NULL,
  username VARCHAR(60) NOT NULL,
  password VARCHAR(60) NOT NULL,
  userType INT8 UNSIGNED NOT NULL DEFAULT 0,
  lastLoginTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  loginCount INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (userID)
)DEFAULT CHARSET = utf8;

create table systems
(
  systemID INT UNSIGNED AUTO_INCREMENT NOT NULL,
  userID INT UNSIGNED NOT NULL,
  systemName VARCHAR(60) NOT NULL,
  systemDescribe VARCHAR(200) DEFAULT 'system',
  frequency VARCHAR(10),
  endtime datetime,
  PRIMARY KEY (systemID),
  foreign key(userID) references users(userID) on delete CASCADE on update CASCADE
)DEFAULT CHARSET = utf8;

create table devices
 (
   deviceID INT UNSIGNED AUTO_INCREMENT NOT NULL,
   systemID INT UNSIGNED NOT NULL,
   deviceName VARCHAR(60) NOT NULL,
   deviceDescribe VARCHAR(200) DEFAULT 'device',
   deviceType INT UNSIGNED NOT NULL,
   ip VARCHAR(20) NOT NULL,
   deviceUsername VARCHAR(60) NOT NULL,
   devicePassword VARCHAR(120) NOT NULL,
   devicePort int unsigned not null,
   frequency float,
   endtime datetime,
   PRIMARY KEY (deviceID),
   INDEX deviceTypeIndex (deviceType),
   foreign key(systemID) references systems(systemID) on delete CASCADE on update CASCADE
 )DEFAULT CHARSET = utf8;

 create table files
 (
   fileID INT UNSIGNED AUTO_INCREMENT NOT NULL,
   deviceID INT UNSIGNED NOT NULL,
   systemID INT UNSIGNED NOT NULL,
   fileType INT UNSIGNED NOT NULL,
   filenameOnPath varchar(240),
   filename VARCHAR(60) NOT NULL,
   fileDescribe VARCHAR(200) DEFAULT 'file',
   remotePath VARCHAR(180),
   localPath VARCHAR(180) NOT NULL,
   routeCommand varchar(60),
   identifyKeywords varchar(60),
   frequency float,
   endtime datetime,
   PRIMARY KEY (fileID),
   foreign key(deviceID) references devices(deviceID) on delete CASCADE on update CASCADE
 )DEFAULT CHARSET = utf8;

 create table tasks
 (
    taskID INT UNSIGNED AUTO_INCREMENT NOT NULL,
    userID INT UNSIGNED  NOT NULL,
    systemID INT UNSIGNED  NOT NULL,
    deviceID INT UNSIGNED  NOT NULL,
    taskTime DATETIME NOT NULL,
    state INT NOT NULL,
    count INT UNSIGNED NOT NULL default 0,
    deviceType INT UNSIGNED NOT NULL,
    fileID INT UNSIGNED NOT NULL,
    filename VARCHAR(60) NOT NULL,
    ip VARCHAR(20) NOT NULL,
    deviceUsername VARCHAR(60) NOT NULL,
    devicePassword VARCHAR(60) NOT NULL,
    devicePort int unsigned not null,
    remotePath VARCHAR(180),
    localPath VARCHAR(180) NOT NULL,
    routeCommand varchar(60),
    identifyKeywords varchar(60),
    newName varchar(300),
    progress varchar(300),
    shift int unsigned not null default 0,
    progressIsDone int unsigned not null default 0,
    priority int(10) unsigned default 1,
    script mediumtext,
    PRIMARY KEY (taskID)
 )DEFAULT CHARSET = utf8;


create table tasksHistory
 (
    taskHistoryID INT UNSIGNED AUTO_INCREMENT NOT NULL,
    userID INT UNSIGNED NOT NULL,
    systemID INT UNSIGNED NOT NULL,
    deviceID INT UNSIGNED NOT NULL,
    deviceType INT UNSIGNED NOT NULL,
    fileID INT UNSIGNED NOT NULL,
    filename VARCHAR(60) NOT NULL,
    newName varchar(300) not null,
    taskTime DATETIME NOT NULL,
    state INT NOT NULL,
    notice int not null DEFAULT 0,
    progress varchar(300),
    script mediumtext,
    PRIMARY KEY (taskHistoryID)
 )DEFAULT CHARSET = utf8;