const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DBError: ${e}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertMovie = (object) => {
  return { movieName: object.movie_name };
};
app.get("/movies/", async (request, response) => {
  const movieNameQuery = `SELECT movie_name
    FROM movie`;
  const allMovieNames = await db.all(movieNameQuery);
  response.send(allMovieNames.map((each) => convertMovie(each)));
});

const convertMovieone = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieNameQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId}`;
  const movieDetails = await db.get(movieNameQuery);
  console.log(movieDetails);
  response.send(convertMovieone(movieDetails));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postSqlQuery = `
  INSERT INTO movie(director_id, movie_name, lead_actor)
  VALUES('${directorId}' , '${movieName}', '${leadActor}')`;
  const movieId = await db.run(postSqlQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateSqlQuery = `
    UPDATE movie
    SET director_id = '${directorId}' , movie_name= '${movieName}', lead_actor= '${leadActor}'
    WHERE movie_id = ${movieId}`;
  await db.run(updateSqlQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE 
    FROM movie
    WHERE movie_id = ${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

const convertDir = (object) => {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const { directorId } = request.params;
  const allDirector = `
    SELECT * 
    FROM director`;
  const allDirectorsList = await db.all(allDirector);
  response.send(allDirectorsList.map((each) => convertDir(each)));
});

const convertMovieName = (object) => {
  return {
    movieName: object.movie_name,
  };
};
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const allDirector = `
    SELECT movie_name 
    FROM movie
    WHERE director_id = ${directorId} `;
  const allDirectorsList = await db.all(allDirector);
  response.send(allDirectorsList.map((each) => convertMovieName(each)));
});
module.exports = app;
