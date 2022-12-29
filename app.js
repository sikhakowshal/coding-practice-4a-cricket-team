const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initiateDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running on http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error : ${err.message}`);
  }
};
initiateDbAndServer();

//API TO GET LIST OF ALL PLAYERS
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT *
        FROM cricket_team;
    `;
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API TO CREATE A PLAYER
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const createPlayerQuery = `
        INSERT INTO cricket_team(player_name, jersey_number, role)
        VALUES (
            '${playerName}',
             ${jerseyNumber},
            '${role}');
    `;
  const dbResponse = await db.run(createPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//API TO GET PLAYER BASED ON PLAYER_ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT *
        FROM cricket_team
        WHERE player_id = ${playerId};
    `;
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  const playerObject = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(playerObject));
});

//API TO UPDATE PLAYER DETAILS
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
        UPDATE cricket_team
        SET 
          player_name = '${playerName}',
          jersey_number = ${jerseyNumber},
          role = '${role}'
        WHERE player_id = ${playerId};
    `;
  const dbResponse = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API TO DELETE A PLAYER
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE FROM cricket_team
        WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
