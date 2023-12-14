let elecYear = 2000;

// Ensure the DOM is loaded before executing
document.addEventListener('DOMContentLoaded', loadElectoralVote(elecYear));

function loadElectoralVote(currentYear){

    // JavaScript to create the SVG and append the legend
    // Set the dimensions for the SVG container
    const svgWidth = 600;
    const svgHeight = 40;
  
    // Append an SVG to the div with the id 'map-container'
    const svg = d3.select("#electbar-container").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
  
    // Now append the legend to the SVG
    const legendWidth = 500;
    const legendHeight = 20;
    const legendMargin = { top: svgHeight - 40, left: (svgWidth - legendWidth) / 2 };

    /// Create the gradient definition
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "vote-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    // Blue color stop at 50%
    linearGradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", "#2166ac"); // Blue color for Democrats

    // Red color stop at 50%
    linearGradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", "#b2182b"); // Red color for Republicans
  
    // Draw the legend rectangle
    svg.append("rect")
        .attr("x", legendMargin.left)
        .attr("y", legendMargin.top)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#vote-gradient)");
  
    // Add text labels for the legend
    svg.append("text")
        .attr("class", "legend-label")
        .attr("x", legendMargin.left)
        .attr("y", legendMargin.top + legendHeight + 15)
        .text("100% - Democrat");
  
    svg.append("text")
        .attr("class", "legend-label")
        .attr("x", legendMargin.left + legendWidth)
        .attr("y", legendMargin.top + legendHeight + 15)
        .attr("text-anchor", "end")
        .text("Republican - 100%");
}

document.getElementById('yearSlider').addEventListener('input', function () {
    // Select the SVG container and remove its children
    d3.select("#electbar-container").select("elect-svg").selectAll("*").remove();
    elecYear = parseInt(this.value);
    // Trigger the update for the map visualization
    loadElectoralVote(elecYear);
});