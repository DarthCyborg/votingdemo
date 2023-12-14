// Ensure the DOM is loaded before executing
document.addEventListener('DOMContentLoaded', function() {
    // JavaScript to create the SVG and append the legend
  
    // Set the dimensions for the SVG container
    const svgWidth = 155;
    const svgHeight = 600;
  
    // Append an SVG to the div with the id 'map-container'
    const svg = d3.select("#map-container").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
  
    // Now append the legend to the SVG
    const legendWidth = 20;
    const legendHeight = 500;
    const legendMargin = { top: 50, left: 20 };

    // Create the gradient definition
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%");

    // Define the range of the color scale for the legend
    const colorScaleDomain = d3.scaleSequential(d3.interpolateRdBu).domain([1, -1]);

    // Append multiple color stops to the gradient
    const numStops = 10; // Number of color stops for the gradient
    for (let i = 0; i <= numStops; i++) {
        const offset = `${(i / numStops) * 100}%`;
        const color = colorScaleDomain(i / numStops * 2 - 1); // Scale from 1 to -1

        linearGradient.append("stop")
            .attr("offset", offset)
            .attr("stop-color", color);
    }

  
    // Draw the legend rectangle
    svg.append("rect")
    .attr("x", legendMargin.left)
    .attr("y", legendMargin.top)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("rx", 10) // This will set the radius on the x-axis
    .attr("ry", 10) // This will set the radius on the y-axis
    .style("fill", "url(#legend-gradient)");

    // Add text labels for the legend
    svg.append("text")
    .attr("class", "legend-label")
    .attr("x", legendMargin.left)
    .attr("y", legendMargin.top - 30)
    .attr("text-anchor", "start") // Aligns the text to start at the x position
    .html("Demographic<tspan x='" + (legendMargin.left) + "' dy='1.2em'>Party Affiliations:</tspan>");

    // Add text labels for the legend
    svg.append("text")
    .attr("class", "legend-label")
    .attr("x", legendMargin.left + legendWidth + 5)
    .attr("y", legendMargin.top + 20)
    .attr("text-anchor", "start") // Aligns the text to start at the x position
    .style("font-size", "14px") // Set the text size to 14px
    .html("100%<tspan x='" 
        + (legendMargin.left + legendWidth + 5) + "' dy='1.2em'>Democrat</tspan><tspan x='"
        + (legendMargin.left + legendWidth + 5) + "' dy='1.2em'>Voters</tspan>");

    // Add text labels for the legend
    svg.append("text")
    .attr("class", "legend-label")
    .attr("x", legendMargin.left + legendWidth + 5)
    .attr("y", legendMargin.top + legendHeight/2)
    .attr("text-anchor", "start") // Aligns the text to start at the x position
    .style("font-size", "14px") // Set the text size to 14px
    .text("50/50");

    svg.append("text")
    .attr("class", "legend-label")
    .attr("x", legendMargin.left + legendWidth + 5)
    .attr("y", legendMargin.top + legendHeight - 50) // Adjusted to not overlap with the bottom edge
    .attr("text-anchor", "start") // Aligns the text to start at the x position
    .style("font-size", "14px") // Set the text size to 14px
    .html("100%<tspan x='" 
        + (legendMargin.left + legendWidth + 5) + "' dy='1.2em'>Republican</tspan><tspan x='"
        + (legendMargin.left + legendWidth + 5) + "' dy='1.2em'>Voters</tspan>");
    

  });
  