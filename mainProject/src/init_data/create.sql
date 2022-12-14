-- CREATION FOR THE Users TABLE
DROP TABLE IF EXISTS Users CASCADE;
CREATE TABLE Users(
    Username VARCHAR(100) PRIMARY KEY,
    Password VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Country VARCHAR(100) NOT NULL,
    CurrencyBalance FLOAT NOT NULL,
    TotalWins INT NOT NULL,
    TotalLosses INT NOT NULL,
    ImageUrl VARCHAR(512)
);

-- CREATION FOR THE Matches TABLE
DROP TABLE IF EXISTS Matches CASCADE;
CREATE TABLE Matches(
    MatchID SERIAL PRIMARY KEY NOT NULL,
    MatchCaption VARCHAR(280),
    Victor VARCHAR(100),
    Wager FLOAT
);


--RELATION TABLE:
DROP TABLE IF EXISTS Users_To_Matches;
CREATE TABLE Users_To_Matches(
    Username VARCHAR(100) NOT NULL REFERENCES Users (Username),
    MatchID INT NOT NULL REFERENCES Matches (MatchID)
);

