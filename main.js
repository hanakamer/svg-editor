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

let curve  = d3.line().curve(d3.curveCardial)


const margin = {top: 0, right:0, bottom: 0, left: 0},
  width = 800 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

let svg;
function createSVG(){
  svg = d3.select("#svg-path")
   .append("svg")
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
   .attr('class', 'shape-container ')
   .append("g")
   .attr('id', 'SVGshape')

}

let h,w;
let center;
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
    .attr('stroke', '#BCE784')
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 2.5)
    .attr("d", lineFunction(path));

}

function findCenter(points){
  let result;
  let count = 0;
  result = points.filter(p=> p[0] !== "Z").reduce((accumulator, currentValue,index)=>{
    count = index+1
     return {'x': accumulator['x']+currentValue[1],
            'y':accumulator['y']+currentValue[2]};
  },{x:0,y:0});
  result['x']= Math.round(result['x']/count * 100) / 100
  result['y']= Math.round(result['y']/count * 100) / 100
  return result
}

function addZeroPoint(){
  svg.append('circle')
  .attr('r', 5)
  .attr('cx', 0)
  .attr('cy', 0)
  .style('fill', '#fb2e01')

  svg.append('text')
  .text('0,0')
  .attr('x',5)
  .attr('y',15)
  .attr('font-family', 'sans-serif')
  .attr('fill', 'red')
}

function drawPoints(points){
  center = findCenter(points);

  svg.append('circle')
  .attr('r', 3)
  .attr('cx', center['x'])
  .attr('cy', center['y'])
  .style('fill', '#6fcb9f')
  .attr('id','center')

  svg.append('text')
  .text(center['x']+','+center['y'])
  .attr('x',center['x']+5)
  .attr('y',center['y']+15)
  .attr('font-family', 'sans-serif')
  .attr('fill', '#6fcb9f')
  .attr('id','center-text')

  let p;
  if(points[points.length-1][0]=="Z"){
    p = points.map(p=>p)
    p.splice(-1,1)
  }else {
    p = points.map(p=>p)
  }
  svg.selectAll('.point')
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
    .style('fill','#5DD39E')
    .attr('class','point')

    svg.selectAll('.point')
    .call(drag);

    w = d3.select(".line").node().getBoundingClientRect().width
    h = d3.select(".line").node().getBoundingClientRect().height
    let translateX = width/2 - center['x'];
    let translateY =height/2 - center['y'];

    svg.attr("transform",
      "translate(" +translateX+ "," + translateY+")");
}

function dragstarted(d){
  d3.select(this).transition()
      .duration(500)
      .style("fill", 'black');
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
  d3.select(this).transition()
      .duration(500)
      .style("fill", 'orange');
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

   center = findCenter(points);

   d3.select('#center')
   .transition()
   .duration(10)
   .attr('cx', center['x'])
   .attr('cy', center['y']);

   d3.select('#center-text')
   .transition()
   .duration(10)
   .text(center['x']+','+center['y'])
   .attr('x',center['x']+5)
   .attr('y',center['y']+15)

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
      p[2]= p[2]*magnitude;
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
      p[2]= parseInt(p[2])-parseInt(translateY);
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
     let vector = new Victor(Number(p[1]-center['x']),Number(p[2]-center['y']));
     vector.rotateDeg(degree);
     p[1]=round(vector.x + center['x'])
     p[2]=round(vector.y + center['y'])
    return p;
  })
  let rotatedPath  = new SVG.PathArray(rotatedPoints).toString();

  update(rotatedPath);

}
function round(num){
  return Math.round(num*100)/100;

}

function resetAllInputs(){
  $("#scale").val(1);
  $('#translate-X').val(0);
  $('#translate-Y').val(0);
  $('#rotate').val(0);
}

createSVG();

drawLine(points,line,path);

drawPoints(points);
addZeroPoint();


$(".button").on("click", function() {
  var $button = $(this);
  let prev = Number($button.parent().find("input").val());
  let inputElement = $button.parent().find("input");
  let step = Number(inputElement.attr('step')) || 1;
  let current;

  if ($button.hasClass('inc')) {
	   current = step < 1 ? prev + step : parseInt(prev + step) ;
	} else {
     current = step < 1 ? prev - step : parseInt(prev - step) ;
  }
  inputElement.focus();
  inputElement.val(current);

  if (inputElement.attr('id')=='scale'){
    if(current !== 0 && prev !== 0 ){
      magnitude = current/prev;
      scaled(points,magnitude);
    }
  }
  else if (inputElement.attr('id') == 'translate-X'){
    trnsX = current - prev;
    translatePath(points,trnsX,0);
  }
  else if (inputElement.attr('id') == 'translate-Y'){
    trnsY = current - prev;
    translatePath(points,0,trnsY);
  }
  else if (inputElement.attr('id') == 'rotate'){
    let degree = current - prev ;
    rotate(points,degree);
  } else {
    return;
  }

});

$("#svg-path-input").on("change", function() {
  path = $(this).val()
  d3.selectAll('svg.shape-container').remove();
  if (isValidSvg(path)){
    createSVG();
    points =  generatePoints(path)
    path =  new SVG.PathArray(points).toString();
    console.log(path)
    drawLine(points,line,path);
    drawPoints(points);
    addZeroPoint();
    resetAllInputs();
    setOutput(path);

  } else{
    console.log('what is this? this is not svg')
  }
});

$('#scale').on('focusin', function(){
    $(this).data('val', $(this).val());
});
$("#scale").on("change", function() {
  let prev = Math.round($(this).data('val')*100)/100;
  let current = Math.round($(this).val()*100)/100;
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

document.getElementById("copyButton").addEventListener("click", function() {
    copyToClipboard(document.getElementById("output"));
});

function copyToClipboard(elem) {
	  // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";
    var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
    var origSelectionStart, origSelectionEnd;
    if (isInput) {
        // can just use the original source element for the selection and copy
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
    } else {
        // must use a temporary form element for the selection and copy
        target = document.getElementById(targetId);
        if (!target) {
            var target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = elem.textContent;
    }
    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);

    // copy the selection
    var succeed;
    try {
    	  succeed = document.execCommand("copy");
    } catch(e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }

    if (isInput) {
        // restore prior selection
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
    } else {
        // clear temporary content
        target.textContent = "";
    }
    return succeed;
}
