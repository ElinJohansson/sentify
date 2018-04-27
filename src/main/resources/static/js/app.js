/*Use these five color variables, comes from our palette!*/
var color = {
    mainBgColor: "#FFFFFF",
    mainColor: "#8FB8A0",
    mainContrastColor: "#87524F",
    mainColorLight: "#E0E0E0",
    mainColorDark: "#6E8C7B"
};

function setFocusToTextBox(){
    $("#searchTweetInput").focus();
}

var keywordInput = '';

$('#searchTweetInput').keypress(function (event) {

    if (event.which == 13) {
        var searchInput = $("input[name=input]").val();
        keywordInput = htmlEscape(searchInput);
        ajaxRequest(searchInput);
    }
});




$("#searchButton").on("click", function (e) {
    var searchInput = $("#searchTweetInput").val();
    keywordInput = htmlEscape(searchInput);
    ajaxRequest(htmlEscape(searchInput));
});

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
            if (result.tweets === null) {
                $(document.body).css({'cursor': 'default'});
                keywordInput = "No tweets were found"; //To update the dialLabel
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


            var percentage = result.averageSentiment.toFixed(2);
   
            $("#output").empty();
            $("#gauge").find("h1").empty();
            gauge.dialLabel = true;
            gauge.dialValue = true;
            console.log("successfully inserted ", result);
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
            $("#scatterChartContainer").append(" <canvas id=\"myChart\"></canvas>");
            createScatterPlot(searchInput, result.tweets);
        }
    });
    $("#searchTweetInput").val("");
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

//Scatterplot scripts below
var createScatterPlot = function (searchQuery, tweets) {
    var dataPoints = [];
    var numberOfTweets = tweets.length;
    if (numberOfTweets > 100) {
        tweets.splice(0, 100);
    }

    for (var i = 1; i <= numberOfTweets; i++) {
        dataPoints.push({
            y: (tweets[i - 1].sentimentScore),
            x: i,
            createdAt: new Date(tweets[i - 1].createdAt).toLocaleString(),
            tweetText: tweets[i - 1].tweetText,
            sentimentScore: tweets[i - 1].sentimentScore.toFixed(2)
        });
    }

    var pointBackgroundColors = [];
    var ctx = document.getElementById('myChart').getContext('2d');
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
                        display: false
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
                        color: [color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainContrastColor, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight],
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
                    scaleLabel: {
                        display: true,
                        fontSize: 20
                    }
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
                    left: 0,
                    right: 50,
                    top: 0,
                    bottom: 0
                }
            }
        }
    });

    for (i = 0; i < scatterChart.data.datasets[0].data.length; i++) {
        if (scatterChart.data.datasets[0].data[i].y > 0.5) {
            pointBackgroundColors.push("#90cd8a");
        } else {
            pointBackgroundColors.push("#f58368");
        }
    }
    scatterChart.update();
};

var returnsCleanScatter = function () {
    var ctx = document.getElementById('myChart').getContext('2d');
    var emptyScatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: "You searched for: ",
                fill: false, //how to fill the area under the line
                showLine: false,
                backgroundColor: color.mainBgColor,
                borderColor: color.mainColorDark,
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
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Tweets",
                        fontSize: 20
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: [color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainContrastColor, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight, color.mainColorLight],
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
                    scaleLabel: {
                        display: true,
                        fontSize: 20
                    }
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
                    left: 0,
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

returnsCleanScatter();


