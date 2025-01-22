CREATE Database SmartHome;
use SmartHome;

CREATE TABLE Packages(
	id INT AUTO_INCREMENT PRIMARY KEY,
    PackageNAME NVARCHAR(255) NOT NULL,
    PackageType NVARCHAR(255) NOT NULL,
    IncludedAppliances NVARCHAR(1000) NOT NULL,
    Price FLOAT(10, 2) NOT NULL
);


CREATE TABLE UserInfo(
	id INT AUTO_INCREMENT PRIMARY KEY,
    email nvarchar(255) NOT NULL,
    password nvarchar(255) NOT NULL,
    FName nvarchar(255) NOT NULL,
    LName nvarchar(255) NOT NULL,
    ChosenPackageID INT NOT NULL,
    
    FOREIGN KEY(ChosenPackageID) REFERENCES Packages(id)
);




CREATE TABLE ApplianceStatus(
	id INT AUTO_INCREMENT PRIMARY KEY,
    UpTime FLOAT NOT NULL,
    CurrentStatus NVARCHAR(255) NOT NULL,
	LastIssueTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastIssueError NVARCHAR(255) NOT NUll
);


CREATE TABLE OfferedAppliances(
	id INT AUTO_INCREMENT PRIMARY KEY,
    ApplianceType NVARCHAR(255) NOT NULL,
	Maker NVARCHAR(255) NOT NULL,
    WarrantyYears INT NOT NULL
);


CREATE TABLE UserAppliances(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ModelNumber INT NOT NULL,
    ApplianceID INT NOT NULL,
    UserID INT NOT NULL,
    ApplianceStatusID INT NOT NULL,
    
    FOREIGN KEY(ApplianceID) REFERENCES OfferedAppliances(id),
	FOREIGN KEY(UserID) REFERENCES UserInfo(id),
    FOREIGN KEY(ApplianceStatusID) REFERENCES ApplianceStatus(id)
);


CREATE TABLE Logs(
    id INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Action NVARCHAR(255) NOT NULL,
    ActionTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ApplianceID INT,
    
    FOREIGN KEY(UserID) REFERENCES UserInfo(id),
    FOREIGN KEY(ApplianceID) REFERENCES UserAppliances(id)
);
