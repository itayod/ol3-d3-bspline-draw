/**
 * Created by itay on 07/09/16.
 */


var DrawInteraction = (function(){

  var self;
  
  
  function DrawInteraction(width,height,parentElem,map) {
    self = this;
    self.coords = [[1,1],[4,5],[12,15],[3,17]];
    self.points = [[192,224.76367354393005],[384,136.75464689731598],[576,392.3977103084326],[768,133.58126552775502]];

    //   d3.range(1, 5).map(function(i) {
    //   return [i * width / 5, 50 + Math.random() * (height - 100)];
    // });

    self.map = map;
    self.width = width;
    self.height = height;
    self.dragged = null;
    self.selected = self.points[0];
    self.isDrawing = false;
    self.isEditing = true;
    self.skretchPointIdx = self.points.length
    self.skretchPoint = self.points[self.points.length-1];

    self.line = d3.svg.line()
      .interpolate('basis')

    
    self.svg = parentElem.append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("tabindex", 1);
    //
    // self.svg.append("rect")
    //   .attr("width", width)
    //   .attr("height", height)
    //   .on("mousedown", mousedown);
    
    self.svg.append("path")
      .datum(self.points)
      .attr("class", "line")
      .on("mouseover", function(){console.log('yay')})
      .on("mousedown", function(a,b,c){
        console.log(a)
        console.log(d3.mouse(self.svg.node()))
        console.log(c)
      })
      .call(self.redraw);
    
    d3.select(window)
      .on("mousemove", mousemove)
      .on("mouseup", mouseup)
      .on("keydown", keydown);

    
    d3.select("#draw")
      .on("click", function(){
        self.isDrawing = true;
        self.isEditing = false;
    
      })
    
    d3.select("#edit")
      .on("click", function(){
        if(self.isDrawing) {
          self.isDrawing = false;
          var i = self.points.indexOf(self.selected);
          self.points.splice(self.skretchPointIdx, 1);
          self.skretchPointIdx--;
          self.skretchPoint = self.points[self.points.length - 1];
          self.selected = self.points.length ? self.points[i > 0 ? i - 1 : 0] : null;
          self.redraw();
        }
        self.isEditing = true;
      })

    map.on('postcompose', function (event) {
     self._translatePoints();
      self.redraw();
    });

    self.svg.node().focus();

    function mousedown() {
      if(self.isDrawing) {
        self.points.push(self.selected = self.dragged = d3.mouse(self.svg.node()));
        self.skretchPointIdx++;
        self.skretchPoint = self.points[self.points.length - 1];
        self._translateCoords()
        self.redraw();
      }else if(self.isEditing) {
        self.dragged = self.selected = d3.mouse(self.svg.node())
      }
    
    }
    
    function mousemove() {
    
      if(self.isDrawing) {
        self.points[self.skretchPointIdx] = d3.mouse(self.svg.node())
        self.redraw();
      }
      if (self.dragged === null) return;

      var m = d3.mouse(self.svg.node());
      self.dragged[0] = Math.max(0, Math.min(self.width, m[0]));
      self.dragged[1] = Math.max(0, Math.min(self.height, m[1]));
      self.redraw();
    }
    
    function mouseup() {
      if (!self.dragged) return;
      mousemove();
      self.dragged = null;
      self._translateCoords()
    }
    
    function keydown() {
      if (!self.selected) return;
      switch (d3.event.keyCode) {
        case 8: // backspace
        case 46: { // delete
          var i = self.points.indexOf(self.selected);
          self.points.splice(self.skretchPointIdx, 1);
          self.skretchPointIdx--;
          self.skretchPoint = self.points[self.points.length - 1];
          self.selected = self.points.length ? self.points[i > 0 ? i - 1 : 0] : null;
          self._translateCoords();
          self.redraw();
          break;
        }
      }
    }

  }

  DrawInteraction.prototype = {

    redraw: function() {
      self.svg.select("path").attr("d", self.line);

      var circle = self.svg.selectAll("circle")
        .data(self.points, function(d) { return d; });

      circle.enter().append("circle")
        .attr("r", 1e-6)
        .on("mousedown", function(d) {
          if(self.isDrawing) {
            self.points.push(self.selected = self.dragged = d);
            self.skretchPointIdx++;
            self.skretchPoint = self.points[self.points.length - 1];
            self.redraw();
          }else if(self.isEditing){

            self.selected = self.dragged = d;

            var m = d3.mouse(self.svg.node());
            self.dragged[0] = Math.max(0, Math.min(self.width, m[0]));
            self.dragged[1] = Math.max(0, Math.min(self.height, m[1]));
            self.redraw();
          }
        })
        .on("dblclick", self.endDraw)
        // .transition()
        // .duration(750)
        // .ease("elastic")
        .attr("r", 6.5);

      circle
        .classed("self.selected", function(d) { return d === self.selected; })
        .attr("cx", function(d) { return d[0]; })
        .attr("cy", function(d) { return d[1]; });

      circle.exit().remove();

      if (d3.event) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
      }
    },

    _translatePoints: function() {

      if(map.frameState_ === null) {
        return self.points;
      }
      var line = [];
      for(var i in self.coords) {

        var pixel = map.getPixelFromCoordinate(self.coords[i]);
        self.points[i] = pixel;
        // line.push(pixel);
      }
      // return line;
    },

    _translateCoords: function() {
      if(map.frameState_ === null) {
        console.warn('frame state is null');
        return self.coords;
      }
      var line = [];
      for(var i in self.points) {

        var coords = map.getCoordinateFromPixel(self.points[i]);
        self.coords[i] = coords;
      }
    },

    endDraw: function() {
      self._translateCoords()
      self.isDrawing = false;
      self.isEditing = true;
    },
    
    getSvg: function() {
      return self.svg;
    },
    
    getPoint: function() {
      return self.points;
    }
    
    
  }
  

  return DrawInteraction;
  
})()