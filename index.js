const expressTest = require("express");
const app = expressTest();
const https = require("https");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(expressTest.static("public"));
const expressip = require('express-ip');
app.use(expressip().getIpInfoMiddleware);
app.listen(process.env.PORT || 8080, function() {
  console.log("server is started on port 8080")
});
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
})
app.post("/weather", function(req, res) {
  var city = req.body.cityname;
  console.log(city);
  var ip = req.connection.remoteAddress;
  // console.log("ip address is"+ip);
  //res.send("Weather site is in build phase");
  const ipInfo = req.ipInfo;
//  console.log(ipInfo);
//  console.log("the ip address is " + ipInfo.ip);
  const clientIp = ipInfo.ip;
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=aed912b78e4066f6a7064423e54b7da5&units=metric";
  const airUrl = "https://api.waqi.info/feed/" + city + "/?token=9cf775e01538687ce13d60480c7a2e13c93827c7";
  //const timeUrl = "https://worldtimeapi.org/api/ip/" + clientIp + "";
  https.get(airUrl, function(response) {
    console.log("Air quality reponse status is "+response.statusCode);
    response.on('data', function(data) {
      const airData = JSON.parse(data);
      console.log(airData.status);
      if(airData.status!="error")
      {
      const humidity = airData.data.iaqi.h;
      const pressure = airData.data.iaqi.p;
      const pm25 = airData.data.aqi;
      const windSpeed = airData.data.iaqi.w;
      const pm25string = JSON.stringify(pm25);
      const humiditystring = JSON.stringify(humidity);
      //console.log(pm25string);
      //console.log(humidity, pressure, pm25, windSpeed);
      res.write("<h3> Air quality index value is " + pm25 + "</h3>");
      if (pm25 >= 0 && pm25 <= 50) {
        res.write("\n");
        res.write("<h3>Air quality is good</h3>");
      } else if (pm25 > 50 && pm25 <= 100) {
        res.write("<h3>Air quality is moderate</h3>");
      } else if (pm25 > 100 && pm25 <= 150) {
        res.write("<h3>Air quality is unhealthy for sensitive groups</h3>");
      } else if (pm25 > 150 && pm25 <= 200) {
        res.write("<h3>Air quality is unhealthy</h3>");
      } else if (pm25 > 200 && pm25 <= 300) {
        res.write("<h3>Air quality is very unhealthy</h3>");
      } else {
        res.write("<h3>Air quality is hazardous</h3>");
      }
      res.write("\n");
      res.write("<h3> Humidity value is " + humidity.v + "</h3>");
    //  res.end();
}
else
{
  //res.sendFile(__dirname+"/failure.html");
  res.redirect("/");
}
    });

  });
  https.get(url, function(responseOutw) {
    //console.log(res);
    console.log("weather data response status is "+responseOutw.statusCode);
    if(responseOutw.statusCode===200)
    {
    responseOutw.on('data', function(dataOut) {
      //console.log(data);
      const weatherData = JSON.parse(dataOut);
      //console.log(weatherData);
    //  console.log(weatherData.main.temp);
      var temp = weatherData.main.temp;
      //console.log(weatherData.weather[0].description);
      var desc = weatherData.weather[0].description;
      var icon = weatherData.weather[0].icon;
      res.write("<body style=background-color:a2de96;text-align:center;></body>");
      res.write("<h1 style=background-color:#a2de96> The temperature in " + city + " is " + temp + " degree celsius </h1>");
      var imgUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
      //console.log(imgUrl);
      //res.write("<img src="+imgUrl+">");
      res.write("<h3 style=background-color:#a2de96>The description of weather is " + desc + " <img src=" + imgUrl + "></h3>");
      // res.end();
    });
  }
  else
  {
  //  res.sendFile(__dirname+"/failure.html");
  res.redirect("/");
  }
  });
  const timeUrl="https://worldtimeapi.org/api/timezone/Asia/Kolkata";
  https.get(timeUrl, function(responseOut) {
    console.log("time response status is "+responseOut.statusCode);
    if(responseOut.statusCode===200)
    {
    responseOut.on('data', function(timedata) {
      const timeOut = JSON.parse(timedata);
      const cityTime = timeOut.datetime;
      res.write("<h3> Time in " + city + " is " + cityTime + "</h3>");
      res.write("<h3>Timezone is " + timeOut.timezone + "</h3>");
    //  console.log(timeOut);
      res.end();
    });
  }
  else
  {
  //  res.sendFile(__dirname+"/failure.html");
  res.redirect("/");
  }
  });
 });
 app.post("/failure",function(trequest,tresponse)
 {
   tresponse.redirect("/");
 });
