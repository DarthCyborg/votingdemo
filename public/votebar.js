let overviewData = null;
let theYear = 2000;
let thisYearDrawn = false;
let numTimesDrawn = 0;

// JavaScript to create centered SVG rectangles with labels using D3.js
function drawCenteredRectangles(currentYear) {

    console.log("drawing infobars for year:");
    console.log(currentYear);

    console.log("we have done this X times: ", numTimesDrawn);

    const checksvg = d3.select('#votebar-container');
    const rects = checksvg.selectAll('rect');
    console.log('Number of rect elements:', rects.size());

    if(rects.size() === 2){
        console.log("we already did this, exiting");
        return;
    }
    
    if(!currentYear){
        console.log("year does not exist, exiting");
        return;
    }

    // clear previous bars
    document.getElementById('yearSlider').addEventListener('input', function () {
        d3.select("#votebar-container").selectAll("*").remove();
        console.log("cleared votebar elements");
      });

    // what variables do I need?
    // candidate info
    let winner = "none";
    let demCandidate = "none";
    let repCandidate = "none";
    // electoral votes
    let totalElec = 538;
    let demElec = 0;
    let repElec = 0;
    let otherElec = 0;
    // popular votes
    let totalVotes = 0;
    let demVotes = 0;
    let repVotes = 0;
    let otherVotes = 0;

    const dataForYear = overviewData.filter(d => +d.year === yearOfInterest);
    winner = dataForYear[0].winner;
    // console.log("read winner: " + winner);
    demCandidate = dataForYear[0].dem;
    // console.log("Democrat Candidate: ", demCandidate);

    repCandidate = dataForYear[0].rep;
    // console.log("Republican Candidate: ", repCandidate);

    // electoral votes
    // totalElec = 538; // Uncomment if you need to use the total electoral votes
    demElec = Number(dataForYear[0].demelect);
    // console.log("Democratic Electoral Votes: ", demElec);

    repElec = Number(dataForYear[0].repelect);
    // console.log("Republican Electoral Votes: ", repElec);

    otherElec = Number(dataForYear[0].otherelect);
    // console.log("Other Electoral Votes: ", otherElec);

    // popular votes
    totalVotes = Number(dataForYear[0].totalvotes);
    // console.log("Total Votes: ", totalVotes);

    demVotes = Number(dataForYear[0].demvotes);
    // console.log("Democratic Popular Votes: ", demVotes);

    repVotes = Number(dataForYear[0].repvotes);
    // console.log("Republican Popular Votes: ", repVotes);

    otherVotes = Number(dataForYear[0].othervotes);
    // console.log("Other Popular Votes: ", otherVotes);

    console.log("reaffirm winner: ", winner);
    
    // update winner title
    document.getElementById('winnerTitle').textContent = `Winner: ${winner}`;

    let demElecPercent = demElec/totalElec;
    let otherElecPercent = otherElec/totalElec + demElecPercent;
    // let repElecPercent = repElec/totalElec + otherElecPercent;

    let demVotePercent = demVotes/totalVotes;
    let otherVotePercent = otherVotes/totalVotes + demVotePercent;
    

    // Set the dimensions for the SVG container
    const svgWidth = 600;
    const svgHeight = 170; // Adjusted to accommodate two rectangles and labels

    const barWidth = (svgWidth*3)/2;
    const barHeight = 25;
    
    // Append an SVG to the div with the id 'votebar-container'
    const svg = d3.select("#votebar-container").append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);
  

    // edit gradient coloration
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "vote-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    // Blue color stop at 0%
    linearGradient.append("stop")
        .attr("offset", 0)
        .attr("stop-color", "darkblue"); // Blue color for Democrats

    // Blue color stop at 50%
    linearGradient.append("stop")
        .attr("offset", demVotePercent)
        .attr("stop-color", "#2166ac"); // Blue color for Democrats

    // gray color stop at x%
    linearGradient.append("stop")
        .attr("offset", demVotePercent)
        .attr("stop-color", "lightgray"); // Gray color for Neutral
    
    linearGradient.append("stop")
        .attr("offset", otherVotePercent)
        .attr("stop-color", "lightgray"); // Gray color for Neutral

    // Red color stop at 50%
    linearGradient.append("stop")
        .attr("offset", otherVotePercent)
        .attr("stop-color", "#b2182b"); // Red color for Republicans
    // Red color stop at 100%
    linearGradient.append("stop")
        .attr("offset", 100)
        .attr("stop-color", "darkred"); // Red color for Republicans


    // gradient for electoral votes
    const linearGradient2 = defs.append("linearGradient")
        .attr("id", "elec-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    // Blue color stop at 0%
    linearGradient2.append("stop")
        .attr("offset", 0)
        .attr("stop-color", "darkblue"); // Blue color for Democrats

    // Blue color stop at dem amount
    linearGradient2.append("stop")
        .attr("offset", demElecPercent)
        .attr("stop-color", "#2166ac"); // Blue color for Democrats

    // gray color stop at x%
    linearGradient2.append("stop")
        .attr("offset", demElecPercent)
        .attr("stop-color", "lightgray"); // Gray color for Neutral
    
    linearGradient2.append("stop")
        .attr("offset", otherElecPercent)
        .attr("stop-color", "lightgray"); // Gray color for Neutral

    // Red color stop at rep%
    linearGradient2.append("stop")
        .attr("offset", otherElecPercent)
        .attr("stop-color", "#b2182b"); // Red color for Republicans
    
    // Red color stop at 100%
    linearGradient2.append("stop")
    .attr("offset", 100)
    .attr("stop-color", "darkred"); // Red color for Republicans
    
    
    // Define the first rectangle's attributes
    const firstRect = { width: barWidth, height: barHeight, color: 'url(#elec-gradient)', label: 'First Label', yPos: 20 };
    // Calculate X position to center the rectangle
    const firstRectX = (svgWidth - firstRect.width) / 2;

    // Draw the first rectangle
    svg.append("rect")
      .attr("x", firstRectX)
      .attr("y", firstRect.yPos)
      .attr("width", firstRect.width)
      .attr("height", firstRect.height)
      .style("fill", firstRect.color);

    // Add the label for the first rectangle
    svg.append("text")
      .attr("x", firstRectX + (firstRect.width / 2))
      .attr("y", firstRect.yPos + firstRect.height + 20)
      .attr("text-anchor", "middle")
      .style("font-family", "sans-serif")
      .style("font-size", "14px")
      .html("Electoral College: <tspan x='" + (firstRectX + (firstRect.width / 2)) + "' dy='1.2em'>538 Total</tspan>");

    // Add the label for the first rectangle
    svg.append("text")
      .attr("x", firstRectX + 150)
      .attr("y", firstRect.yPos + firstRect.height + 20)
      .attr("text-anchor", "start")
      .style("font-family", "sans-serif")
      .style("font-size", "12px")
      .text(demCandidate + " - " + demElec.toLocaleString());


    // Add the label for the first rectangle
    svg.append("text")
      .attr("x", firstRectX + 750)
      .attr("y", firstRect.yPos + firstRect.height + 20)
      .attr("text-anchor", "end")
      .style("font-family", "sans-serif")
      .style("font-size", "12px")
      .text(repElec.toLocaleString() + " - " + repCandidate);


    // Define the second rectangle's attributes
    const secondRect = { width: barWidth, height: barHeight, color: 'url(#vote-gradient)', label: 'Second Label', yPos: 100 };
    // Calculate X position to center the rectangle
    const secondRectX = (svgWidth - secondRect.width) / 2;

    // Draw the second rectangle
    svg.append("rect")
      .attr("x", secondRectX)
      .attr("y", secondRect.yPos)
      .attr("width", secondRect.width)
      .attr("height", secondRect.height)
      .style("fill", secondRect.color);

    // Add the label for the second rectangle
    svg.append("text")
      .attr("x", secondRectX + (secondRect.width / 2))
      .attr("y", secondRect.yPos + secondRect.height + 20)
      .attr("text-anchor", "middle")
      .style("font-family", "sans-serif")
      .style("font-size", "14px")
      .html("Popular Vote:<tspan x='" + (firstRectX + (firstRect.width / 2)) + "' dy='1.2em'>" + totalVotes.toLocaleString() + " Total</tspan>");

    // Add the label for the first rectangle
    svg.append("text")
        .attr("x", secondRectX + 150)
        .attr("y", secondRect.yPos + secondRect.height + 20)
        .attr("text-anchor", "start")
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .text(demCandidate + " - " + demVotes.toLocaleString());


    // Add the label for the first rectangle
    svg.append("text")
        .attr("x", secondRectX + 750)
        .attr("y", secondRect.yPos + secondRect.height + 20)
        .attr("text-anchor", "end")
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .text(repVotes.toLocaleString() + " - " + repCandidate);

      numTimesDrawn++;
  }

// read overview data
d3.csv("overview.csv").then(function(data) {
    console.log("reading infobar data");
    console.log(data);
    overviewData = data;
    // Call the function to draw centered rectangles with labels
    if(!thisYearDrawn){
        drawCenteredRectangles(theYear);
        thisYearDrawn = true;
    }
});

  
document.getElementById('yearSlider').addEventListener('input', function () {
    let getYear = parseInt(this.value);
    // read overview data
    d3.csv("overview.csv").then(function(data) {
        console.log("recieved slider value: ", getYear);
        if(theYear != getYear){
            theYear = getYear;
            thisYearDrawn = false;
            numTimesDrawn = 0;
        }
        console.log("reading infobar data");
        console.log(data);
        overviewData = data;
        // Trigger the update for the map visualization
        if(!thisYearDrawn){
            drawCenteredRectangles(theYear);

        }
    });
});