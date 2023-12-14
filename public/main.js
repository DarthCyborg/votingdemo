const height = 600;
const width = 960;
let yearOfInterest = 2000; // Set the year you're interested in
let showCounties = true;
let countiesRendered = false;
const MAX_YEAR = 2020;
const START_YEAR = 2000;

let usData = null;

// load data for US Map
async function loadUSData() {
    try {
        const getUsData = await d3.json('https://d3js.org/us-10m.v2.json');
        console.log(getUsData);
        usData = getUsData;
        // displayData(usData);
        main(usData);
    } catch (error) {
        console.error('Error loading data', error);
    }
}

function main(usData) {
    // filter out counties and states data
    const countiesData = topojson.feature(usData, usData.objects.counties).features;
    const stateData = topojson.feature(usData, usData.objects.states).features;

    // console.log(stateData);
    // console.log(countiesData);

    // create US Map
    const chart = drawMap(stateData, countiesData);

    // append map
    document.getElementById('main').appendChild(chart);

}

function drawMap(stateData, countiesData) {
    const statesFeatureCollection = {
        type: 'FeatureCollection',
        features: stateData,
    };

    const projection = d3.geoIdentity().fitSize([width, height], statesFeatureCollection);

    // create svg
    const svg = d3.create("svg")
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('max-width', '100%')
        .style('height', 'auto');

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [width, height]])
        .on('zoom', zoomed);
    
    svg.call(zoom);
    const g = svg.append('g');

    // clear the visualization before loading it, in case it was called before
    // svg.selectAll("*").remove();

    // Call the functions to draw states and counties
    if (!countiesRendered) {
        drawStates(g, stateData);
        console.log("done rendering states");
    }
    if (showCounties) {
        drawCounties(g, countiesData, projection, stateData);
        //countiesRendered = true;
    }

    return svg.node();

    function zoomed(event) {
        g.attr('transform', event.transform);
    }
}

function drawStates(svg, stateData) {

    // Load the dataset using d3.csv
    d3.csv('1976-2020-president.csv').then(data => {
        // console.log("printing state election data:");
        // console.log(data);

        // Filter data for the given year
        const dataForYear = data.filter(d => +d.year === yearOfInterest);

        const dataForDems = dataForYear.filter(d => d.party_simplified === "DEMOCRAT");
        const dataForReps = dataForYear.filter(d => d.party_simplified === "REPUBLICAN");

        // Create a mapping from state to total votes
        const votesByState = new Map(dataForYear.map(d => [d.state, +d.totalvotes]));
        const demsByState = new Map(dataForDems.map(d => [d.state, +d.candidatevotes]));
        const repsByState = new Map(dataForReps.map(d => [d.state, +d.candidatevotes]));

        // console.log("printing votes by state:");
        // console.log(votesByState);
        // console.log("printing dem votes by state:");
        // console.log(demsByState);
        // console.log("printing rep votes by state:");
        // console.log(repsByState);

        const voteDifferencesByState = new Map();

        votesByState.forEach((totalVotes, state) => {
            const demVotes = demsByState.get(state) || 0; // Fallback to 0 if no entry is found
            const repVotes = repsByState.get(state) || 0; // Fallback to 0 if no entry is found

            // Calculate the difference in votes, then divide by total votes
            // The result is the proportion of the vote difference
            if (totalVotes > 0) { // Avoid division by zero
                const voteDifference = (demVotes - repVotes) / totalVotes;
                voteDifferencesByState.set(state, voteDifference);
            } else {
                voteDifferencesByState.set(state, 0); // If no votes, set difference to 0
            }
        });

        // console.log("printing coefficients: 1.0 = pure democrat, -1.0 = pure republican");
        // console.log(voteDifferencesByState);

        // Find the range of votes to determine the color scale domain
        // Convert map values to an array
        const differencesArray = Array.from(voteDifferencesByState.values());
        // Use d3.extent to find the minimum and maximum values
        const differencesExtent = d3.extent(differencesArray);
        // console.log("printing state difference vote extent:");
        // console.log(differencesExtent);


        // Create a color scale based on those differences
        const diffColorScale = d3.scaleSequential(d3.interpolateRdBu)
            .domain([-1.0, 1.0]); // Invert domain for RdBu scale

        // Find the range of votes to determine the color scale domain
        const voteExtent = d3.extent(dataForYear, d => +d.totalvotes);
        // console.log("printing vote extent:");
        // console.log(voteExtent);

        // Create a color scale - red/purple/blue
        /*
        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain(voteExtent)
            .interpolator(d3.interpolate("red", "blue"));
        */

        // ... now you can use votesByState and colorScale to color your map
        const statesFeatureCollection = {
            type: 'FeatureCollection',
            features: stateData,
        };

        const projection = d3.geoIdentity().fitSize([width, height], statesFeatureCollection);
        const path = d3.geoPath().projection(projection);
        // draw states with color based on votes
        svg.append('g')
            .attr('class', 'states')
            .selectAll('path')
            .data(stateData)
            .join('path')
            .attr('class', 'state')
            .attr('d', path)
            .style('fill', d => {
                // const votes = votesByState.get(d.properties.name.toUpperCase()); // Get total votes for the state
                const coeff = voteDifferencesByState.get(d.properties.name.toUpperCase());
                // console.log(d.properties.name);
                return coeff ? diffColorScale(coeff) : 'gray'; // Default color if no data
            })
            .style('stroke', 'black');

        mouseOverStateInfo(svg, votesByState, demsByState, repsByState);

    }).catch(error => {
        console.error("Error loading the dataset: ", error);
    });

}

function drawTransparentStates(svg, stateData) {
    // ... now you can use votesByState and colorScale to color your map
    const statesFeatureCollection = {
        type: 'FeatureCollection',
        features: stateData,
    };

    const projection = d3.geoIdentity().fitSize([width, height], statesFeatureCollection);
    const path = d3.geoPath().projection(projection);
    // draw states with color based on votes
    svg.append('g')
        .attr('class', 'states')
        .selectAll('path')
        .data(stateData)
        .join('path')
        .attr('class', 'state')
        .attr('d', path)
        .style('fill', 'none')
        .style('stroke', 'gray');

}

function drawCounties(svg, countiesData, projection, stateData) {

    // Load the county-level dataset using d3.csv
    let countyFile = 'countypres_2000-2020.csv';

    d3.csv(countyFile).then(data => {
        console.log("beginning county rendering")
        console.time('drawCounties'); // Start the timer with a label

        // console.log("did we extract the data");
        // console.log(data);

        // console.log("what's our year of interest");
        // console.log(yearOfInterest);

        // Filter data for the given year
        const dataForYear = data.filter(d => +d.year === yearOfInterest);

        // Separate the data by party
        const dataForDems = dataForYear.filter(d => d.party === "DEMOCRAT");
        const dataForReps = dataForYear.filter(d => d.party === "REPUBLICAN");

        // four classes of votes:
        // ABSENTEE
        // EARLY VOTE
        // ELECTION DAY
        // PROVISIONAL
        // bug: website was only loading provisional for some reason
        // georgia
        // ADVANCED VOTING
        // PROV
        // North Carolina:
        // ABSENTEE BY MAIL
        // ONE STOP
        // SOUTH CAROLINA
        // IN-PERSON ABSENTEE
        // fix: whatever this is
        const demABSENTEE = new Map(dataForDems.filter(d => (d.mode === "ABSENTEE"
            || d.mode === "ABSENTEE BY MAIL")).map(d => [d.county_fips, +d.candidatevotes]));
        const demEARLY = new Map(dataForDems.filter(d => (d.mode === "EARLY VOTE" || d.mode === "ADVANCED VOTING"
            || d.mode === "ONE STOP")).map(d => [d.county_fips, +d.candidatevotes]));
        const demELECTION = new Map(dataForDems.filter(d => d.mode === "ELECTION DAY").map(d => [d.county_fips, +d.candidatevotes]));
        const demPROVISIONAL = new Map(dataForDems.filter(d => (d.mode === "PROVISIONAL" || d.mode === "PROV")).map(d => [d.county_fips, +d.candidatevotes]));
        const demTOTAL = new Map(dataForDems.filter(d => d.mode === "TOTAL").map(d => [d.county_fips, +d.candidatevotes]));
        const demINABSENTEE = new Map(dataForDems.filter(d => d.mode === "IN-PERSON ABSENTEE").map(d => [d.county_fips, +d.candidatevotes]));

        // console.log("printing dem absentee:");
        // console.log(demABSENTEE);

        const repABSENTEE = new Map(dataForReps.filter(d => (d.mode === "ABSENTEE"
            || d.mode === "ABSENTEE BY MAIL")).map(d => [d.county_fips, +d.candidatevotes]));
        const repEARLY = new Map(dataForReps.filter(d => (d.mode === "EARLY VOTE" || d.mode === "ADVANCED VOTING"
            || d.mode === "ONE STOP")).map(d => [d.county_fips, +d.candidatevotes]));
        const repELECTION = new Map(dataForReps.filter(d => d.mode === "ELECTION DAY").map(d => [d.county_fips, +d.candidatevotes]));
        const repPROVISIONAL = new Map(dataForReps.filter(d => (d.mode === "PROVISIONAL" || d.mode === "PROV")).map(d => [d.county_fips, +d.candidatevotes]));
        const repTOTAL = new Map(dataForReps.filter(d => d.mode === "TOTAL").map(d => [d.county_fips, +d.candidatevotes]));
        const repINABSENTEE = new Map(dataForReps.filter(d => d.mode === "IN-PERSON ABSENTEE").map(d => [d.county_fips, +d.candidatevotes]));

        const demsByCounty = new Map();
        const repsByCounty = new Map();

        dataForYear.forEach(d => {

            const demAbs = demABSENTEE.get(d.county_fips) || 0;
            const demEar = demEARLY.get(d.county_fips) || 0;
            const demEle = demELECTION.get(d.county_fips) || 0;
            const demPro = demPROVISIONAL.get(d.county_fips) || 0;
            const demInA = demINABSENTEE.get(d.county_fips) || 0;
            const demTot = demTOTAL.get(d.county_fips) || 0;

            const repAbs = repABSENTEE.get(d.county_fips) || 0;
            const repEar = repEARLY.get(d.county_fips) || 0;
            const repEle = repELECTION.get(d.county_fips) || 0;
            const repPro = repPROVISIONAL.get(d.county_fips) || 0;
            const repInA = repINABSENTEE.get(d.county_fips) || 0;
            const repTot = repTOTAL.get(d.county_fips) || 0;

            const demTotals = demAbs + demEar + demEle + demPro + demInA + demTot;
            const repTotals = repAbs + repEar + repEle + repPro + repInA + repTot;

            demsByCounty.set(d.county_fips, demTotals);
            repsByCounty.set(d.county_fips, repTotals);
            /*
            if (d.county_fips === '02001') {
                console.log("district 1 AK testing");
                console.log("demvotes");
                console.log(demTotals);

                // console.log("demearly");
                // console.log(demEARLY.get(d.county_fips));

                console.log("repvotes");
                console.log(repTotals);
                console.log("totalvotes");
                console.log(d.totalvotes);
            }
            */
        });

        // Create a mapping from county FIPS to votes for Dems and Reps, treating FIPS as strings
        // const demsByCounty = new Map(dataForDems.map(d => [d.county_fips, +d.candidatevotes]));
        // const repsByCounty = new Map(dataForReps.map(d => [d.county_fips, +d.candidatevotes]));

        /*
        console.log("printing votes by county:");
        console.log(dataForYear);
        console.log("printing dem votes by county:");
        console.log(demsByCounty);
        console.log("printing rep votes by county:");
        console.log(repsByCounty);
        */

        // Calculate the difference in votes for each county
        const voteDifferencesByCounty = new Map();
        const totalVotesByCounty = new Map();
        dataForYear.forEach(d => {
            const demVotes = demsByCounty.get(d.county_fips) || 0; // Fallback to 0 if no entry is found
            const repVotes = repsByCounty.get(d.county_fips) || 0; // Fallback to 0 if no entry is found
            const totalVotes = +d.totalvotes;

            totalVotesByCounty.set(d.county_fips, totalVotes);

            if (totalVotes > 0) {
                const voteDifference = (demVotes - repVotes) / totalVotes;
                /*
                if(d.county_fips === '05115'){
                    console.log("demvotes");
                    console.log(demVotes);
                    console.log("repvotes");
                    console.log(repVotes);
                    console.log("totalvotes");
                    console.log(totalVotes);
                    console.log("pope AK testing");
                    console.log(voteDifference);
                }*/
                voteDifferencesByCounty.set(d.county_fips, voteDifference);
            } else {
                voteDifferencesByCounty.set(d.county_fips, 0); // If no votes, set difference to 0
            }
        });
        // Find the range of vote differences to determine the color scale domain
        const differencesArray = Array.from(voteDifferencesByCounty.values());
        const differencesExtent = d3.extent(differencesArray);

        // console.log("printing difference vote extent:");
        // console.log(differencesExtent);

        // Create a color scale based on those differences
        const diffColorScale = d3.scaleSequential(d3.interpolateRdBu)
            .domain([-1.0, 1.0]); // Invert domain for RdBu scale

        // Now you can use voteDifferencesByCounty and diffColorScale to color your counties
        const path = d3.geoPath().projection(projection);

        // Sort counties data by FIPS code
        // makes counties render in by state
        /*
        countiesData.sort((a, b) => {
            return d3.ascending(a.id, b.id);
        });
        */

        // draw counties with initial state
        const counties = svg.append('g')
            .attr('class', 'counties')
            .selectAll('path')
            .data(countiesData)
            .enter().append('path')
            .attr('class', 'county')
            .attr('d', path)
            .style('fill', 'none') // initial fill, could be transparent or a light color
            .style('stroke', 'none');

        // transition to final color one by one
        counties.transition()
            .duration(500) // duration of the color transition for each element
            .delay((d, i) => i * 1) // delay transition start for each element; adjust timing here
            .style('fill', d => {
                const countyFIPS = String(d.id).padStart(5, '0');
                const countyName = String(d.properties.name);
                const countyVotes = voteDifferencesByCounty.get(countyFIPS);
                if (countyName === 'District 1') {
                    console.log("district 1 AK render testing");
                    console.log(string.includes(substring)); // true
                }
                return countyVotes !== undefined ? diffColorScale(countyVotes) : 'none';
            });

        mouseOverCountiesInfo(svg, demsByCounty, repsByCounty, stateData, totalVotesByCounty);
        
        // testing border redraw
        drawTransparentStates(svg, stateData);

        console.log("done with county rendering")
        console.timeEnd('drawCounties'); // End the timer with the same label

    }).catch(error => {
        console.error("Error loading the county dataset: ", error);
    });

}

// helper function to print data for verification
function displayData(data) {
    console.log(data);
    const dataDisplayElement = document.getElementById('main');
    dataDisplayElement.textContent = JSON.stringify(data, null, 2);
}

function changeYearAndUpdateDisplay(amount) {
    // Increment the year by 4
    yearOfInterest += amount;
    if (amount === 0) {
        showCounties = !showCounties;
    }

    let shouldUpdate = true;
    // Check if year exceeds your data's range and reset if necessary
    if (yearOfInterest > MAX_YEAR) {
        yearOfInterest = MAX_YEAR; // Assuming you have a START_YEAR defined
        shouldUpdate = false;
    }

    if (yearOfInterest < START_YEAR) {
        yearOfInterest = START_YEAR; // Assuming you have a START_YEAR defined
        shouldUpdate = false;
    }

    console.log("yearOfInterest updated");
    console.log(yearOfInterest);

    if (shouldUpdate) {
        // Update the visualization
        const countiesData = topojson.feature(usData, usData.objects.counties).features;
        const stateData = topojson.feature(usData, usData.objects.states).features;

        console.log(stateData);
        console.log(countiesData);

        // create updated US Map
        const chart = drawMap(stateData, countiesData);

        // Clear the content of the 'main' element
        document.getElementById('main').innerHTML = '';

        // append map
        document.getElementById('main').appendChild(chart);

        let countiesIndicator = "OFF";
        if (showCounties) {
            countiesIndicator = "ON";
        }

        // Optionally, update the button text or another element to indicate the new year
        document.getElementById('yearDisplay').textContent = `Year: ${yearOfInterest}`;
        document.getElementById('toggleCountyButton').textContent = `County View: ${countiesIndicator}`;
    }
}

function mouseOverStateInfo(svg, votesByState, demsByState, repsByState) {
    if (!showCounties) {
        let originalColor;

        svg.selectAll('.state')
            .on('mouseover', function (event, d) {
                originalColor = d3.select(this).style('fill');
                d3.select(this).style('fill', 'green');

                d3.select('#county-info')
                    .html(generatePopupContent(d.properties.name, votesByState, demsByState, repsByState))
                    .style('display', 'block')
                    .style('opacity', '0.75');
            })
            .on('mouseout', function () {
                d3.select(this).style('fill', originalColor || 'gray');
                d3.select('#county-info')
                    .style('display', 'none');
            });

        function generatePopupContent(stateName, votesByState, demsByState, repsByState) {
            upperState = stateName.toUpperCase();
            const demVotes = demsByState.get(upperState);
            const repVotes = repsByState.get(upperState);
            const totalVotes = votesByState.get(upperState);
            const demPercentage = ((demVotes / totalVotes) * 100).toFixed(2);
            const repPercentage = ((repVotes / totalVotes) * 100).toFixed(2);

            const formatNumber = (num) => num.toLocaleString();

            return `<div class ="tooltip-content">
                    <strong>${stateName}</strong><br>
                    <span class="party democrat">Democrat: ${formatNumber(demVotes)} (${demPercentage}%)</span><br>
                    <span class="party republican">Republican: ${formatNumber(repVotes)} (${repPercentage}%)</span><br>
                    <span class="total">Total: ${formatNumber(totalVotes)}</span>
                </div>`;
        }
    }
}

function mouseOverCountiesInfo(svg, demsByCounty, repsByCounty, stateData, totalVotesByCounty) {
    let originalColor;

    svg.selectAll('.county')
        .on('mouseover', function (event, d) {
            originalColor = d3.select(this).style('fill');
            d3.select(this).style('fill', 'green');

            d3.select('#county-info')
                .html(generateCountyInfoContent(d, demsByCounty, repsByCounty, stateData, totalVotesByCounty))
                .style('display', 'block')
                .style('opacity', '0.75');
        })
        .on('mouseout', function () {
            d3.select(this).style('fill', originalColor || 'gray');
            
            d3.select('#county-info')
                .style('display', 'none')
        });

    function generateCountyInfoContent(countyData, demsByCounty, repsByCounty, stateData, totalVotesByCounty) {
        const countyName = countyData.properties.name;
        const countyId = countyData.id;
        const demVotes = demsByCounty.get(countyId);
        const repVotes = repsByCounty.get(countyId);
        const totalVotes = totalVotesByCounty.get(countyId);
        const demPercentage = ((demVotes / totalVotes) * 100).toFixed(2);
        const repPercentage = ((repVotes / totalVotes) * 100).toFixed(2);

        const formatNumber = (num) => num.toLocaleString();

        const stateId = countyId.substring(0, 2);
        const state = stateData.find(state => state.id === stateId);
        const stateName = state.properties.name;

        return `<strong>${countyName} County, ${stateName}</strong><br>
                <span class="party democrat">Democrat: ${formatNumber(demVotes)} (${demPercentage}%)</span><br>
                <span class="party republican">Republican: ${formatNumber(repVotes)} (${repPercentage}%)</span><br>
                <span class="total">Total: ${formatNumber(totalVotes)}</span>
            </div>`;
    }
}

// document.getElementById('nextYearButton').addEventListener('click', () => changeYearAndUpdateDisplay(4));
// document.getElementById('prevYearButton').addEventListener('click', () => changeYearAndUpdateDisplay(-4));
document.getElementById('toggleCountyButton').addEventListener('click', () => changeYearAndUpdateDisplay(0));

document.getElementById('yearSlider').addEventListener('input', function () {
    let newYearVal = parseInt(this.value);
    // Trigger the update for the map visualization
    changeYearAndUpdateDisplay(newYearVal - yearOfInterest)
});


// initialize program with async call to get usData
loadUSData();