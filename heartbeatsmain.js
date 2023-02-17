const strava_auth_link = "https://www.strava.com/oauth/token"
const spotify_auth_link = "https://accounts.spotify.com/api/token"
var lastFMUser 

class userWorkout { //class for each workout. Includes songs listened
    constructor(obj_name, start_date, elapsed_time, average_heartrate, average_speed, max_heartrate, max_speed, suffer_score, songsListened) {
        this.obj_name = obj_name
        this.start_date = start_date;
        this.elapsed_time = elapsed_time;
        this.average_heartrate = average_heartrate;
        this.average_speed = average_speed;
        this.max_heartrate = max_heartrate;
        this.max_speed = max_speed;
        this.suffer_score = suffer_score;
        this.songsListened = songsListened;
    }

}

function reAuthorize(){ //authorizes strava api tokens.
    fetch(strava_auth_link,{
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'

        },

        body: JSON.stringify({

            client_id: '61540',
            client_secret: 'c4549adebe10726af65914cade2b527d4fb60e47',
            refresh_token: 'a100cdbc13e707ca5efdba5201b03ef251fe889f',
            grant_type: 'refresh_token'
        })
    }).then(res => res.json()) //after fetch, turns result into json format
        .then(res => getActivities(res)) //then calls the getActivities function with the json result
          
}

function getUserName(){
    lastFMUser = document.getElementById("lastfm_username").value 
    console.log(lastFMUser)
}

///get spotify API oAuth
const clientId = 'eace6e831f724ca0a1f1c2690f1eaece';
const clientSecret = '9d30825174984df1b494281fb77b9bb0';

     getSpotifyToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        access_token = String(data.access_token);
        return(access_token);
    }

function getActivities(res){
    console.log(res);
    const activities_link = `https://www.strava.com/api/v3/athlete/activities?access_token=${res.access_token}` ///json access token generated from reAuthorize
    fetch(activities_link)
        .then(res => res.json())
            .then(res => makeVar(res));
}

async function makeVar(res){ //creates each workout object. async and await used to pull last.fm data
    var workoutArray = []
    var stravaOutput = res;

    for (var key of Object.keys(stravaOutput)) {
        var startDateUnix = convertStartDate(stravaOutput[key]['start_date'])
        var endDateUnix = getEndDate(startDateUnix, stravaOutput[key]['elapsed_time'])
        var songsListened = await getUserTracks(startDateUnix, endDateUnix)
        ///console.log(test)        
        var name = String("Workout " + key);
        let workoutObj = new userWorkout(
            name,
            stravaOutput[key]['start_date'],
            stravaOutput[key]['elapsed_time'],
            stravaOutput[key]['average_heartrate'],
            stravaOutput[key]['average_speed'],
            stravaOutput[key]['max_heartrate'],
            stravaOutput[key]['max_speed'],
            stravaOutput[key]['suffer_score'],
            songsListened.recenttracks.track)

        workoutArray.push(workoutObj)
        document.getElementById("Name").innerHTML = JSON.stringify(workoutObj.obj_name)
        document.getElementById("Elapsed").innerHTML = JSON.stringify(workoutObj.elapsed_time)
        document.getElementById("Max Speed").innerHTML = JSON.stringify(workoutObj.max_speed)
        document.getElementById("Max Heartrate").innerHTML = JSON.stringify(workoutObj.max_heartrate)
        console.log(workoutObj);
    }
    getBest(workoutArray);
}

function convertStartDate(start_date) {
    var startDateUnix = new Date(start_date).valueOf() / 1000;
    return(startDateUnix)
}

function getEndDate(startDateUnix, elapsed_time) {
    var endDateUnix = startDateUnix + elapsed_time;
    return(endDateUnix)
}

async function getUserTracks(startDateUnix, endDateUnix) {
    const activities_link = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastFMUser}&api_key=a3394ed77f14de87fddf4288c5480c26&format=json&from=${startDateUnix}&to=${endDateUnix}`
    const response = await fetch(activities_link)
    const data = await response.json()
    return data;
}

function status(response){
    if(response.status >= 200 & response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.statusText))
    }
}

function json(response){
    return(response.json())
}

function getBest(workoutArray){ //sorts array of workouts to find the best workouts
    var bestArray = [];
    bestMaxHeartrate = workoutArray.sort(function(a, b){return b.max_heartrate - a.max_heartrate})[0];
    bestArray.push(bestMaxHeartrate);
    bestMaxSpeed = workoutArray.sort(function(a, b){return b.max_speed - a.max_speed})[0];
    bestArray.push(bestMaxSpeed);
    bestSufferScore = workoutArray.sort(function(a, b){return b.suffer_score - a.suffer_score})[0];
    bestArray.push(bestSufferScore);
    bestAverageSpeed = workoutArray.sort(function(a, b){return b.average_speed - a.average_speed})[0];
    bestArray.push(bestAverageSpeed);
    bestAverageHeartrate = workoutArray.sort(function(a, b){return b.average_heartrate - a.average_heartrate})[0];
    bestArray.push(bestAverageHeartrate);

    for(let item of bestArray){
        console.log(item.obj_name)
        for(let track of item.songsListened) {
            artistName = String(track.artist["#text"]);
            trackName = String(track.name);
            console.log(artistName + " - " + trackName);
            getSongInformation(artistName, trackName);
            //console.log(data)
            ///console.log(trackName)
        }
    }

    /*console.log(bestMaxHeartrate.obj_name);  
    console.log(bestMaxHeartrate.max_heartrate);
    console.log(bestMaxHeartrate);`https://api.spotify.com/v1/search?q=title:'+${trackName}'%20artist:'+${artistName}'&type=track&market=US&limit=5&offset=5&access_token=${access_token}`
    console.log(bestSufferScore.obj_name);
    console.log(bestSufferScore);
    console.log("Suffer Score: " + bestSufferScore.suffer_score);
    console.log(bestSufferScore.songsListened[0].name);*/

}

async function getSongInformation(artistName, trackName){
    const itemSearch = `https://api.spotify.com/v1/search?q=title:'+${trackName}'%20artist:'+${artistName}'&type=track&market=GB&limit=5&offset=5&access_token=${access_token}`
    fetch(itemSearch)
    .then(res => res.json())
    .then(res => console.log(res))
}