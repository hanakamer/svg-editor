let path = $('#svg-path-input').val();
let outputPath = path;
let magnitude = $('#scale').val();
let trnsX = $("#translate-X").val() || 0;
let trnsY = $("#translate-Y").val() || 0;

let points;
const x = d3.scaleLinear()
const y = d3.scaleLinear()

let drag = d3.drag().on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended)
points  = generatePoints(path)



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


const margin = {top: 0, right:0, bottom: 0, left: 0},
  width = 800 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

let svg;
function createSVG(){
  svg = d3.select("body")
   .append("svg")
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
   .attr('class', 'shape-container ')
   .append("g")
   .attr('id', 'SVGshape')

}

let h,w;

function generatePoints(svgPath){
  return parsePath(svgPath).value.map(p=>p);
}

function blurAllElements(){
  $('input').each(function(){
  $(this).trigger('blur')})
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
    .attr("d", lineFunction(path));

}

function findCenter(points){
  let test = [["M",1,1],["L",2,1],["L",3,4], ["L",3,4]]
  let result = points.filter(p=> p[0] !== "Z").reduce((accumulator, currentValue)=>{
     return {'x': accumulator['x']+currentValue[1],
            'y':accumulator['y']+currentValue[2]};
  },{x:0,y:0})
  result['x']=result['x']/points.length-1
  result['y']=result['y']/points.length-1
  return result
}

function addZeroPoint(){
  svg.append('circle')
  .attr('r', 5)
  .attr('cx', 0)
  .attr('cy', 0)
  .style('fill', 'red')

  svg.append('text')
  .text('0,0')
  .attr('x',5)
  .attr('y',15)
  .attr('font-family', 'sans-serif')
  .attr('fill', 'red')
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
    .attr('class','point')

    svg.selectAll('.point')
    .call(drag);

    w = d3.select("#SVGshape").node().getBoundingClientRect().width
    h = d3.select("#SVGshape").node().getBoundingClientRect().height
    let translateX = width/2 - (w/2);
    let translateY =height/2 - (h/2);

    console.log(translateX, translateY)

    svg.attr("transform",
      "translate(" + translateX+ "," + translateY+")");
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
  updatePath(draggedPath,0);
  setOutput(draggedPath);
}

function dragended(d){
  d3.select(this).classed('active', false)
}

function updatePath(newPath,duration){
  svg.select('path')
  .transition()
  .duration(duration)
  .attr('d', line(newPath));
}

function updatePoints(){
  svg.selectAll('.point')
    .transition()
		.duration(200)
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
}

function setOutput(path){
  outputPath=path;
   $("#output" ).val( path );
}

function update(newPath){

  updatePath(newPath,200)

  setOutput(newPath);

  updatePoints();

  blurAllElements();
}

function isValidSvg(str){
  if (typeof path !== 'string') return false
  str = str.trim()
  if (/^[mzlhvcsqta]\s*[-+.0-9][^mlhvzcsqta]+/i.test(str) && /[\dz]$/i.test(str) && str.length > 4) return true
  return false
}

function parsePath(path){
  let result = new SVG.PathArray(path);
  return result;
}

function scaled(points, magnitude){
  let p = points.map((p)=>{
    if(p[0]!=='Z'){
      p[1]= p[1]*magnitude;
      p[2]= p[2]*magnitude
    }
    return p
  })
  let scaledPath  = new SVG.PathArray(p).toString();
  update(scaledPath);
}

function translatePath(pointsArray, translateX, translateY) {
  let translatedPoints = pointsArray.map((p)=>{
    if(p[0]!=='Z'){
      p[1]= parseInt(p[1])+parseInt(translateX);
      p[2]= parseInt(p[2])+parseInt(translateY);
    }
    return p
  })

  let translatedPath = new SVG.PathArray(translatedPoints).toString();

    update(translatedPath);
}

function rotate(pointsArray,degree){

  let rotatedPoints = pointsArray.slice();
  let center = findCenter(pointsArray);
   rotatedPoints.filter(p=>p[0]!=="Z").map((p)=>{
     let vector = new Victor(parseInt(p[1]-center['x']),parseInt(p[2]-center['y']));
     vector.rotateDeg(degree);
     p[1]=parseInt(vector.x + center['x'])
     p[2]=parseInt(vector.y + center['y'])
    return p;
  })
  let rotatedPath  = new SVG.PathArray(rotatedPoints).toString();

  update(rotatedPath);

}

createSVG();


drawLine(points,line,path);

drawPoints(points);
addZeroPoint();

$("#svg-path-input").on("change paste", function() {
  path = $(this).val()
  if (isValidSvg(path)){
    d3.select('svg').remove();
    createSVG();
    points =  generatePoints(path)
    path =  new SVG.PathArray(points).toString();
    drawLine(points,line,path);
    drawPoints(points);
    addZeroPoint();

  } else{
    console.log('what is this? this is not svg')
  }
});
$('#scale').on('focusin', function(){
    $(this).data('val', $(this).val());
});
$("#scale").on("change", function() {
  let prev = parseInt($(this).data('val'));
  let current = parseInt($(this).val());
  if(current !== 0 && prev !== 0 ){
    magnitude = current/prev;
    scaled(points,magnitude);
  }
})
$('#translate-X').on('focusin', function(){
    $(this).data('val', $(this).val());
});
$("#translate-X").on("change", function() {
  let prev = parseInt($(this).data('val'));
  let current = parseInt($(this).val());
  trnsX = current - prev;
  translatePath(points,trnsX,0);

})
$('#translate-Y').on('focusin', function(){
    $(this).data('val', $(this).val());
});
$("#translate-Y").on("change", function() {
  let prev = parseInt($(this).data('val'));
  let current = parseInt($(this).val());
  trnsY = current - prev;
  translatePath(points,0,trnsY);

})
$('#rotate').on('focusin', function(){
    $(this).data('val', $(this).val());
});
$('#rotate').on('change', function(){
    let prev = parseInt($(this).data('val'));
    let current = parseInt($(this).val());
    let degree = current - prev ;
    rotate(points,degree);
});
