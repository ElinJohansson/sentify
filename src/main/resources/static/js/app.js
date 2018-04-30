Chart.defaults.global.defaultFontFamily = "Sura";
/*Use these five color variables, comes from our palette!*/
var color = {
    mainBgColor: "#FFFFFF",
    mainColor: "#8FB8A0",
    mainContrastColor: "#87524F",
    mainColorLight: "#E0E0E0",
    mainColorDark: "#6E8C7B"
};

var colorRGB = {
    // mainBgColor: "rgba(255,255,255,0.1)",
    mainColor: "rgba(206,237,241,0.7)",
    mainContrastColor: "rgba(135,82,79,0.7)",
    mainColorLight: "rgba(224,224,224,0.7)",
    mainColorDark: "rgba(110,140,123,0.7)",
    mainColorDarker: "rgba(161,186,189,0.7)",
    mainColorDarkLighter: "rgba(135,173,152,0.7)"
};

var colorRGBDarker = {
    // mainBgColor: "rgba(255,255,255,0.1)",
    mainColor: "rgba(206,237,241)",
    mainContrastColor: "rgba(135,82,79)",
    mainColorLight: "rgba(224,224,224)",
    mainColorDark: "rgba(110,140,123)",
    mainColorDarker: "rgba(161,186,189)",
    mainColorDarkLighter: "rgba(135,173,152)"
};

var getColorBasedOnIndex = function (index) {
    var color = "";
    var counter = 0;
    var size = 0;
    for (var col in colorRGBDarker) {
        size++;
    }

    for (var col in colorRGBDarker) {
        if (index % size === counter) {
            return colorRGBDarker[col];
        }
        counter++;
    }
    return color;
};

function setFocusToTextBox() {
    $("#searchTweetInput").focus();
}

$(document).ready(function () {
    $('#searchTweetInput').on('input change', function () {
        if ($(this).val() != '') {
            $('#searchTweetButton').prop('disabled', false);
        }
        else {
            $('#searchTweetButton').prop('disabled', true);
        }
    });
});

var keywordInput = '';

$('#searchTweetInput').keypress(function (event) {

    if (event.which === 13) {
        var searchInput = $("input[name=input]").val();
        keywordInput = htmlEscape(searchInput);
        ajaxRequest(searchInput);
    }
});

//Demo buttons
$("#godofwar").on("click", function (e) {
    var searchInput = $("#godofwar").val()
    keywordInput = htmlEscape(searchInput);
    ajaxRequestForDemoPurposes(htmlEscape(searchInput));
});

$("#infinitywar").on("click", function (e) {
    var searchInput = $("#infinitywar").val()
    keywordInput = htmlEscape(searchInput);
    ajaxRequestForDemoPurposes(htmlEscape(searchInput));
});

$("#academicwork").on("click", function (e) {
    var searchInput = $("#academicwork").val()
    keywordInput = htmlEscape(searchInput);
    ajaxRequestForDemoPurposes(htmlEscape(searchInput));
});

$("#val2018").on("click", function (e) {
    var searchInput = $("#val2018").val()
    keywordInput = htmlEscape(searchInput);
    ajaxRequestForDemoPurposes(htmlEscape(searchInput));
});

//Premium: add keyword to saved keywords
$("#addKeyWordButton").on("click", function (e) {
    var searchInput = $("#addKeyWordButton").val();
    keywordInput = htmlEscape(searchInput);
    ajaxForSavingKeywords(searchInput);
});

//Keyword buttons
$(".keywordButton").on("click", function (e) {
    var searchInput = $(this).html();
    keywordInput = htmlEscape(searchInput);
    ajaxRequest(searchInput);
})
;


$("#searchTweetButton").on("click", function (e) {
    var searchInput = $("#searchTweetInput").val();
    keywordInput = htmlEscape(searchInput);
    ajaxRequest(htmlEscape(searchInput));
});


var ajaxRequestForDemoPurposes = function (searchInput) {
    var tweetObjects = {};
    $(document.body).css({'cursor': 'wait'});
    $.ajax({
        type: "POST",
        error: function () {
            $(document.body).css({'cursor': 'default'});
            console.log("error sending the data");
        },
        data: {
            searchInput: searchInput
        },
        url: "/searchForDemoTweets", //which is mapped to its partner function on our controller class
        success: function (result) {
            console.log("successfully inserted ", result);
            if (result.tweets === null) {
                $(document.body).css({'cursor': 'default'});
                keywordInput = "No tweets were found"; //To update the dialLabel
                $("#scatterTitle").text("No tweets were found");
                $("#output").empty();
                returnsCleanScatter();
                returnsCleanBarChart();
                returnsCleanLineChart();
                gauge.update(
                    {
                        dialValue: "-%",
                    }
                );
                $("#numberOfTweets").text("?");
                $("#numberOfPosTweets").text("?");
                $("#numberOfNegTweets").text("?");
                return;
            }
            $(document.body).css({'cursor': 'default'});
            tweetObjects = result;

            $("#scatterTitle").text("Latest opinions of: " + searchInput);

            var percentage = result.averageSentiment.toFixed(2);

            $("#output").empty();
            $("#gauge").find("h1").empty();
            gauge.dialLabel = true;
            gauge.dialValue = true;
            gauge.update(
                {
                    arcFillPercent: percentage,
                    colorArcFg: getColor(percentage)
                }
            );
            $("#numberOfTweets").text(tweetObjects.tweets.length);

            var numberOfPositiveTweets = 0;
            var numberOfNegativeTweets = 0;
            for (var j = 0; j < tweetObjects.tweets.length; j++) {
                if (tweetObjects.tweets[j].sentimentScore > 0.5) {
                    numberOfPositiveTweets++;
                } else {
                    numberOfNegativeTweets++;
                }
            }

            $("#numberOfPosTweets").text(numberOfPositiveTweets);
            $("#numberOfNegTweets").text(numberOfNegativeTweets);

            $("#scatterChartContainer").empty();
            $("#scatterChartContainer").append(" <canvas id=\"scatterChart\"></canvas>");
            $("#barChartContainer").empty();
            $("#barChartContainer").append(" <canvas id=\"barChart\"></canvas>");
            $("#lineChartContainer").empty();
            $("#lineChartContainer").append(" <canvas id=\"lineChart\"></canvas>");


            if (searchInput in state.tweetsSearchedFor) {
                state.tweetsSearchedFor[searchInput].tweets = result;
            } else {
                state.tweetsSearchedFor[searchInput] = {tweets: result};
            }

            createScatterPlot(searchInput, result.tweets);
            createBarChart();
            createLineChart(searchInput, state);
        }
    });
    $("#searchTweetInput").val("");
};

var ajaxForSavingKeywords = function (searchInput) {
    $(document.body).css({'cursor': 'wait'});
    $.ajax({
        type: "POST",
        error: function () {
            $(document.body).css({'cursor': 'default'});
            console.log("error sending the data");
        },
        data: {
            searchInput: searchInput
        },
        url: "/saveKeywordToUser", //which is mapped to its partner function on our controller class
        success: function (savedKeywords) {
            console.log("successfully inserted ", savedKeywords);
            if (savedKeywords !== null) {
                $(document.body).css({'cursor': 'default'});
            }
            $(document.body).css({'cursor': 'default'});
            updateKeywordsButtons(savedKeywords);
        }
    });
};

var updateKeywordsButtons = function (savedKeywords) {
    keywordsArray = [];
    var listOfKeywords = [];
    $("#savedKeywords").empty();
    for (var i = 0; i < savedKeywords.length; i++) {
        listOfKeywords.push(savedKeywords[i]);
    }
    $("#scatterChartContainer").append(" <canvas id=\"scatterChart\"></canvas>");
    for (var j = 0; j < listOfKeywords.length; j++) {
        $("#savedKeywords").append(" <li >\n" +
            "                            <button type=\"submit\" class=\"searchButton button keywordButton\" value=\""+listOfKeywords[j]+"\">" + listOfKeywords[j] + "</button>\n" +
            "                        </li>");
        keywordsArray.push(listOfKeywords[j]);
    }
};


var ajaxRequest = function (searchInput) {
    var tweetObjects = {};
    $(document.body).css({'cursor': 'wait'});
    $.ajax({
        type: "POST",
        error: function () {
            $(document.body).css({'cursor': 'default'});
            console.log("error sending the data");
        },
        data: {
            searchInput: searchInput
        },
        url: "/searchForTweets", //which is mapped to its partner function on our controller class
        success: function (result) {
            console.log("successfully inserted ", result);
            if (result.tweets === null) {
                $(document.body).css({'cursor': 'default'});
                keywordInput = "No tweets were found"; //To update the dialLabel
                $("#scatterTitle").text("No tweets were found");
                $("#output").empty();
                returnsCleanScatter();
                returnsCleanBarChart();
                returnsCleanLineChart();
                gauge.update(
                    {
                        dialValue: "-%",
                    }
                );
                $("#numberOfTweets").text("?");
                $("#numberOfPosTweets").text("?");
                $("#numberOfNegTweets").text("?");
                updateAddKeywordButton("");
                return;
            }
            $(document.body).css({'cursor': 'default'});
            tweetObjects = result;

            $("#scatterTitle").text("Latest opinions of: " + searchInput);

            var percentage = result.averageSentiment.toFixed(2);

            $("#output").empty();
            $("#gauge").find("h1").empty();
            gauge.dialLabel = true;
            gauge.dialValue = true;
            gauge.update(
                {
                    arcFillPercent: percentage,
                    colorArcFg: getColor(percentage)
                }
            );
            $("#numberOfTweets").text(tweetObjects.tweets.length);

            var numberOfPositiveTweets = 0;
            var numberOfNegativeTweets = 0;
            for (var j = 0; j < tweetObjects.tweets.length; j++) {
                if (tweetObjects.tweets[j].sentimentScore > 0.5) {
                    numberOfPositiveTweets++;
                } else {
                    numberOfNegativeTweets++;
                }
            }

            $("#numberOfPosTweets").text(numberOfPositiveTweets);
            $("#numberOfNegTweets").text(numberOfNegativeTweets);

            $("#scatterChartContainer").empty();
            $("#scatterChartContainer").append(" <canvas id=\"scatterChart\"></canvas>");
            $("#barChartContainer").empty();
            $("#barChartContainer").append(" <canvas id=\"barChart\"></canvas>");
            $("#lineChartContainer").empty();
            $("#lineChartContainer").append(" <canvas id=\"lineChart\"></canvas>");


            if (searchInput in state.tweetsSearchedFor) {
                state.tweetsSearchedFor[searchInput].tweets = result;
            } else {
                state.tweetsSearchedFor[searchInput] = {tweets: result};
            }

            updateAddKeywordButton(searchInput);

            createScatterPlot(searchInput, result.tweets);
            createBarChart();
            createLineChart(searchInput, state);
        }
    });
    $("#searchTweetInput").val("");
};

var updateAddKeywordButton = function (keyword) {
    $("#addKeyWordButton").val(keyword);
};

// //Creates a new gauge and appends it to the #demo-tag
var gauge = new FlexGauge({
    appendTo: '#gauge',

    //Sizes of the canvas element
    elementWidth: 600,
    elementHeight: 500,
    elementId: 'gaugeCanvas',

    arcSize: 200,
    arcFillStart: 90,
    arcAngleStart: 1,
    arcAngleEnd: 2,

    arcStrokeFg: 80,
    arcStrokeBg: 80,

    colorArcFg: function () {
        //value from 0 to 1
        value = 0.5;

        var hue = ((1 - (Math.abs(value - 1))) * 120).toString(10);
        return ["hsl(", hue, ",65%,65%)"].join("");
    },

    dialValue: "-%",
    dialLabel: true
});

var getColor = function (value) {
    //value from 0 to 1
    var hue = ((1 - (Math.abs(value - 1))) * 120).toString(10);
    return ["hsl(", hue, ",65%,65%)"].join("");

};

//Beginning of state object
var state = {
    tweetsSearchedFor: {} //contains the result of all tweets searched for in this session
};

var keywordsArray = [];


//Scatterplot scripts below
var createScatterPlot = function (searchQuery, tweets) {
    var dataPoints = [];
    var arrayOfTweets = tweets;
    var tweetsToBeAnalyzed = [];

    //om listan är längre än 100, gör bara 100 första
    if (arrayOfTweets.length > 100) {
        for (var k = 0; k < 100; k++) {
            tweetsToBeAnalyzed.push(arrayOfTweets[k]);
        }
    } else {
        tweetsToBeAnalyzed = arrayOfTweets;
    }

    for (var i = 1; i <= tweetsToBeAnalyzed.length; i++) {
        dataPoints.push({
            y: (tweetsToBeAnalyzed[i - 1].sentimentScore),
            x: i,
            createdAt: new Date(tweetsToBeAnalyzed[i - 1].createdAt).toLocaleString(),
            tweetText: tweetsToBeAnalyzed[i - 1].tweetText,
            sentimentScore: tweetsToBeAnalyzed[i - 1].sentimentScore.toFixed(2)
        });
    }

    var pointBackgroundColors = [];
    var ctx = document.getElementById('scatterChart').getContext('2d');
    var scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                fill: false, //how to fill the area under the line
                showLine: false,
                pointStyle: "circle",
                pointBackgroundColor: pointBackgroundColors,
                pointBorderColor: color.mainColorDark,
                pointHoverBackgroundColor: color.mainColorLight,
                backgroundColor: color.mainBgColor,
                borderColor: color.mainColorDark,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointHitRadius: 6,
                data: dataPoints
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    ticks: {
                        display: false,
                        min: 0,
                        max: 100,
                        stepSize: 10
                    },
                    gridLines: {
                        color: color.mainColorLight
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Tweets",
                        fontSize: 20
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: [color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight],
                        lineWidth: [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1]
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            if (index === 10) {
                                return 'Negative';
                            }
                            if (index === 5) {
                                return 'Neutral';
                            }
                            if (index === 0) {
                                return 'Positive';
                            }
                            return "";
                        },
                        min: 0,
                        max: 1,
                        stepSize: 0.1
                    },
                }]
            },
            tooltips: {
                enabled: true,
                caretSize: 0,
                mode: "nearest",
                backgroundColor: color.mainColor,
                bodyFontFamily: "sans-serif",
                bodyFontSize: 12,
                bodyFontColor: "#000000",
                displayColors: false, //whether to display colored boxes in tooltip
                callbacks: {
                    label: firstLabel.bind(this),
                    afterLabel: otherLabels.bind(this),
                    footer: function (tooltipItem, data) {
                        return "SentScore: " + data["datasets"][0]["data"][tooltipItem[0]["index"]].sentimentScore;
                    },
                    afterFooter: function (tooltipItem, data) {
                        return "Posted: " + data["datasets"][0]["data"][tooltipItem[0]["index"]].createdAt;
                    }

                }
            },
            title: {
                display: false
            },
            legend: {
                display: false
            },
            layout: {
                padding: {
                    left: 50,
                    right: 50,
                    top: 0,
                    bottom: 0
                }
            }
        }
    });

    for (i = 0; i < scatterChart.data.datasets[0].data.length; i++) {
        if (scatterChart.data.datasets[0].data[i].y > 0.5) {
            pointBackgroundColors.push("rgba(110,140,123,0.8)");
        } else {
            pointBackgroundColors.push("rgba(135,82,79,0.8)");
        }
    }
    scatterChart.update();
};

var returnsCleanScatter = function () {
    var ctx = document.getElementById('scatterChart').getContext('2d');
    var emptyScatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                fill: false, //how to fill the area under the line
                showLine: false,
                backgroundColor: color.mainBgColor,
                borderColor: color.mainColorDark
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    gridLines: {
                        color: color.mainColorLight
                    },
                    ticks: {
                        display: false,
                        min: 0,
                        max: 100,
                        stepSize: 10,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Tweets",
                        fontSize: 20
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: [color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight],
                        lineWidth: [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1],
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            if (index === 10) {
                                return 'Negative';
                            }
                            if (index === 5) {
                                return 'Neutral';
                            }
                            if (index === 0) {
                                return 'Positive';
                            }
                            return "";
                        },
                        min: 0,
                        max: 1,
                        stepSize: 0.1,
                    },
                }]
            },
            title: {
                display: false
            },
            legend: {
                display: false
            },
            layout: {
                padding: {
                    left: 20,
                    right: 50,
                    top: 0,
                    bottom: 0
                }
            }
        }
    });
};

var maxTooltipLength = 50; //possibly refactor this global variable

var wordsToArray = function (words) {
    var lines = [];
    var str = '';
    words.forEach(function (word) {
        if ((str.length + word.length + 1) <= maxTooltipLength) {
            str += word + ' ';
        } else {
            lines.push(str);
            str = word + ' ';
        }
    });
    lines.push(str);
    return lines;
};

var breakLabels = function (tooltipItem, data) {
    var label = data["datasets"][0]["data"][tooltipItem["index"]].tweetText;
    if (label.length <= maxTooltipLength) {
        return [label]
    }
    var words = label.split(' ');
    return wordsToArray(words);
};

var firstLabel = function (tooltipItem, data) {
    return breakLabels(tooltipItem, data)[0];
};

var otherLabels = function (tooltipItem, data) {
    return breakLabels(tooltipItem, data).slice(1);
};

function htmlEscape(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

//Bar chart scripts below
var createBarChart = function () {
    var testBarData = [0.8, 0.3, 0.51, 0.7, 0.2];

    var convertToBarDataFormat = function (data) {
        var dataArray = [];
        for (var i = 0; i < data.length; i++) {
            dataArray.push(data[i] - 0.5);
        }
        return dataArray;
    };
    var barLabels = ["#pancake", "cat", "#godofwar", "#trump", "#cake"];
    var ctx = document.getElementById('barChart').getContext('2d');
    var barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: barLabels,
            datasets: [
                {
                    backgroundColor: [colorRGB.mainColorDarker, colorRGB.mainColorDark, colorRGB.mainColorLight, colorRGB.mainContrastColor, colorRGB.mainColorDarkLighter],
                    data: convertToBarDataFormat(testBarData),
                    borderColor: color.mainColorDark,
                }
            ]
        },
        options: {
            legend: {display: false},
            title: {
                display: false
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        color: color.mainColorLight
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: [color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight],
                        lineWidth: [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1]
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            if (index === 10) {
                                return 'Negative';
                            }
                            if (index === 5) {
                                return 'Neutral';
                            }
                            if (index === 0) {
                                return 'Positive';
                            }
                            return "";
                        },
                        min: -0.5,
                        max: 0.5,
                        stepSize: 0.1
                    }
                }]
            },
            layout: {
                padding: {
                    left: 50,
                    right: 50,
                    top: 0,
                    bottom: 0
                }
            }

        }
    });
    barChart.update();
};

var returnsCleanBarChart = function () {
    var ctx = document.getElementById('barChart').getContext('2d');
    var barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["#example", "", "", "", ""],
            datasets: [
                {
                    backgroundColor: colorRGB.mainColorDarker,
                    data: [0.25],
                    borderColor: color.mainColorDark
                }
            ]
        },
        options: {
            legend: {display: false},
            title: {
                display: false
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        color: color.mainColorLight
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: [color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight],
                        lineWidth: [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1],
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            if (index === 10) {
                                return 'Negative';
                            }
                            if (index === 5) {
                                return 'Neutral';
                            }
                            if (index === 0) {
                                return 'Positive';
                            }
                            return "";
                        },
                        min: -0.5,
                        max: 0.5,
                        stepSize: 0.1
                    }
                }]
            },
            layout: {
                padding: {
                    left: 20,
                    right: 50,
                    top: 0,
                    bottom: 0
                }
            }

        }
    });
};

//Line chart scripts below
var createLineChart = function (searchInput) {

    var dataPoints = addDataPointsToLineChart();

    var dataSets = generateDatasetsFromLineChartDataPoints(dataPoints, searchInput);


    var ctx = document.getElementById('lineChart').getContext('2d');
    var lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: dataSets
        },
        options: {
            tooltips: {
                enabled: true,
                caretSize: 0,
                mode: "nearest",
                backgroundColor: color.mainColor,
                bodyFontFamily: "sans-serif",
                bodyFontSize: 12,
                bodyFontColor: "#000000",
                displayColors: false, //whether to display colored boxes in tooltip
                callbacks: {
                    title: function (tooltipItem, data) {
                        return data["datasets"][tooltipItem[0]["datasetIndex"]]["data"][tooltipItem[0]["index"]]["x"].format("ddd MMM D YYYY");
                    },
                    label: function (tooltipItem, data) {
                        return "SentScore: " + data["datasets"][tooltipItem["datasetIndex"]]["data"][tooltipItem["index"]]["y"];
                    },
                    afterFooter: function (tooltipItem, data) {
                        return data["datasets"][tooltipItem[0]["datasetIndex"]]["data"][tooltipItem[0]["index"]]["numberOfTweets"] + " tweet(s) analyzed this day";
                    }
                }
            },
            legend: {display: true},
            title: {
                display: false
            },
            scales: {
                xAxes: [{
                    type: "time",
                    time: {
                        displayFormats: {},
                        unit: "day"
                    },
                    gridLines: {
                        color: color.mainColorLight
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: [color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight],
                        lineWidth: [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1],
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            if (index === 10) {
                                return 'Negative';
                            }
                            if (index === 5) {
                                return 'Neutral';
                            }
                            if (index === 0) {
                                return 'Positive';
                            }
                            return "";
                        },
                        min: 0,
                        max: 1,
                        stepSize: 0.1
                    }
                }]
            },
            layout: {
                padding: {
                    left: 20,
                    right: 50,
                    top: 0,
                    bottom: 0
                }
            }

        }
    });
    lineChart.update();
};

//For every result in state object create an array of datapoints
var addDataPointsToLineChart = function () {
    var dataPointsArray = [];
    var maxNumberOfDates = 10;

    //Array with objects containing searchinput and tweets
    var allTweetsSearchedFor = generateArrayFromHashmap(state.tweetsSearchedFor);


    for (var i = 0; i < allTweetsSearchedFor.length; i++) {
        var datesToBeAnalyzed = allTweetsSearchedFor[i]["tweets"]["tweets"]["avgSentimentGroupedByDate"];

        var dataPoints = [];
        if (datesToBeAnalyzed.length < maxNumberOfDates) {
            for (var j = 0; j < datesToBeAnalyzed.length; j++) {
                dataPoints.push({
                    x: moment(datesToBeAnalyzed[j].date, "YYYY-MM-DD"),
                    y: datesToBeAnalyzed[j].avgSentScore.toFixed(2),
                    numberOfTweets: datesToBeAnalyzed[j].numberOfTweetsThisDay
                });
            }
        } else {
            for (var k = 0; k < maxNumberOfDates; k++) {
                dataPoints.push({
                    x: moment(datesToBeAnalyzed[j].date, "YYYY-MM-DD"),
                    y: datesToBeAnalyzed[j].avgSentScore.toFixed(2),
                    numberOfTweets: datesToBeAnalyzed[j].numberOfTweetsThisDay
                });
            }
        }

        dataPointsArray.push({
            dataPoints: dataPoints,
            searchQuery: allTweetsSearchedFor[i]["searchInput"]
        });
    }
    return dataPointsArray;
};

var generateArrayFromHashmap = function (tweetmap) {
    var newArray = [];
    for (var key in tweetmap) {
        newArray.push({
            searchInput: key,
            tweets: tweetmap[key]
        });
    }
    return newArray;
};

var generateDatasetsFromLineChartDataPoints = function (dataPointsArray) {

    var dataset = [];
    //Generates a dataset from every datapoints-array
    for (var i = 0; i < dataPointsArray.length; i++) {
        dataset.push({
            label: [dataPointsArray[i]["searchQuery"]],
            data: dataPointsArray[i]["dataPoints"],
            lineTension: 0,
            fill: false,
            backgroundColor: getColorBasedOnIndex(i),
            borderColor: getColorBasedOnIndex(i),
            pointBackgroundColor: getColorBasedOnIndex(i),
            pointBorderColor: getColorBasedOnIndex(i)
        });
    }


    return dataset;
};


var returnsCleanLineChart = function () {
    var ctx = document.getElementById('lineChart').getContext('2d');
    var lineChart = new Chart(ctx, {
        type: 'line',
        data: {},
        options: {
            legend: {display: true},
            title: {
                display: false
            },
            scales: {
                xAxes: [{
                    type: "time",
                    distribution: "linear",
                    time: {
                        displayFormats: {},
                        unit: "day"
                    },
                    gridLines: {
                        color: color.mainColorLight
                    },
                    ticks: {
                        min: 0,
                        max: 100,
                        stepSize: 10
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: [color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight],
                        lineWidth: [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1]
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            if (index === 10) {
                                return 'Negative';
                            }
                            if (index === 5) {
                                return 'Neutral';
                            }
                            if (index === 0) {
                                return 'Positive';
                            }
                            return "";
                        },
                        min: 0,
                        max: 1,
                        stepSize: 0.1
                    }
                }]
            },
            layout: {
                padding: {
                    left: 20,
                    right: 50,
                    top: 0,
                    bottom: 0
                }
            }

        }
    });
};

returnsCleanScatter();
returnsCleanBarChart();
returnsCleanLineChart();


