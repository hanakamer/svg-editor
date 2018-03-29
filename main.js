let path = $('#svg-path-input').val();
let outputPath = path;
let magnitude = $('#scale').val();
let trnsX = $("#translate-X").val();
let trnsY = $("#translate-Y").val();
// let rotate = $("#rotate").val();
let points;
const x = d3.scaleLinear()
const y = d3.scaleLinear()

let drag = d3.drag().on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended)
points  = generatePoints(path)

// testLine(points);

let line = function(path){
  return d3.line()
    .x(function(d) {
      if(d[0] == 'Z'){
        return x(parsePath(path).value[0][1]);
      }
      return x(d[1]);
    })
    .y(function(d) {
      if(d[0] == 'Z'){
        return x(parsePath(path).value[0][2]);
      }
      return y(d[2]);
    })
}


const margin = {top: 30, right: 20, bottom: 30, left: 50},
  width = 1000 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom;

const svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");



function generatePoints(svgPath){
  return parsePath(svgPath).value.map(p=>p);
}

function rotate(pointsArray,degree){
  debugger;
  console.log(pointsArray)
  let rotatedPoints = pointsArray.slice();
   rotatedPoints.map((p)=>{
     let vector = new Victor(p[1],p[2]);
     vector.rotate(degree);
     p[1]=vector.x;
     p[2]=vector.y
    return p;
  })
  console.log(rotatedPoints);
  let rotatedPath  = new SVG.PathArray(rotatedPoints).toString();
  svg.select('path').attr('d', line(rotatedPath));
  setOutput(rotatedPath);
  points = generatePoints(rotatedPath);

  // a: pointsArray[i][1],
  //       b: pointsArray[i][2],
  //       c: pointsArray[i+1][1],
  //       d: pointsArray[i+1][2],
  //       e: pointsArray[i+1][1]-pointsArray[i][1],
  //       f: pointsArray[i+1][2]-pointsArray[i][2]

}



function drawLine(pointsArray, lineFunction, path){
  svg.append('path')
    .datum(pointsArray)
    .attr('fill','none')
    .attr('class','line')
    .attr('stroke', 'steelblue')
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 2.5)
    .attr("d", lineFunction(path))
}
function drawPoints(points){
  let p;
  if(points[points.length-1][0]=="Z"){
    p = points.map(p=>p)
    p.splice(-1,1)
  }else {
    p = points.map(p=>p)
  }
  svg.selectAll('circle')
    .data(p)
    .enter()
    .append('circle')
    .attr('r', 5)
    .attr('cx', d=>{
      if(d[0]=='Z'){
        return
      }else{
        return x(d[1])
      }
    })
    .attr('cy', d=>{
      if(d[0]=='Z'){
        return
      }else{
        return y(d[2])
      }
    })
    .style('cursor','pointer')
    .style('fill','orange')
  svg.selectAll('circle')
    .call(drag);
}
function dragstarted(d){
  d3.select(this).raise().classed('active', true)
}

function dragged(d){
  d[1] = x.invert(d3.event.x);
  d[2] = y.invert(d3.event.y);
  let cx = x.invert(d3.event.x);
  let cy = y.invert(d3.event.y);
  d3.select(this)
    .attr('cx', x(cx))
    .attr('cy', y(cy))
  let draggedPath  = new SVG.PathArray(points).toString();
  svg.select('path').attr('d', line(draggedPath));
  setOutput(draggedPath);
}
function dragended(d){
  d3.select(this).classed('active', false)
}

function scaled(points, magnitude){
  // let p = points.map((p)=>{
  //   if(p[0]!=='Z'){
  //     p[1]= p[1]*magnitude;
  //     p[2]= p[2]*magnitude
  //   }
  //   return p
  // })
  // path  = new SVG.PathArray(p).toString();
  // svg.select('path').attr('d', line);
}
drawLine(points,line,path);
drawPoints(points);

function isValidSvg(str){
  if (typeof path !== 'string') return false
  str = str.trim()
  if (/^[mzlhvcsqta]\s*[-+.0-9][^mlhvzcsqta]+/i.test(str) && /[\dz]$/i.test(str) && str.length > 4) return true
  return false
}

function updateSvg(path){
}
function parsePath(path){
  let result = new SVG.PathArray(path);
  return result;
}
function translatePath(path,X,Y) {
  let result = new SVG.PathArray(path).move(X, Y).toString();
  return result;
}

function setOutput(path){
  outputPath=path;
   $("#output" ).val( path );
}


$("#svg-path-input").on("change paste keyup", function() {
  path = $(this).val()
  if (isValidSvg(path)){
    console.log('ok just a sec');
    updateSvg(path);
    setOutput(path);
    points  = generatePoints(outputPath)
  } else{
    console.log('what is this? this is not svg')
  }
});

$("#scale").on("change", function() {
  magnitude = $(this).val();
  scaled(points,magnitude);
})

$("#translate-X").on("change", function() {
  trnsX = $(this).val();
  let translatedPath = translatePath(outputPath,trnsX,trnsY);
  setOutput(translatedPath);
  updateSvg(outputPath);

})
$("#translate-Y").on("change", function() {
  trnsY = $(this).val();
  let translatedPath = translatePath(outputPath,trnsX,trnsY);
  setOutput(translatedPath);
  updateSvg(outputPath);

})
$("#rotate").on("change", function() {
  let degree = $(this).val() ;
  rotate(points,degree);

})
