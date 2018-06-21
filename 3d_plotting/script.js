 var pointCount = 300;
 var i, r;

 var x = [];
 var y = [];
 var z = [];
 var c = [];
 
 for (i = 0; i < pointCount; i++) {
     r = i * (pointCount - i);
     x.push(r * Math.cos(i / 30));
     y.push(r * Math.sin(i / 30));
     z.push(i);
     c.push(i)
 }

 Plotly.plot('graph', [{
     type: 'scatter3d',
     mode: 'lines',
     x: x,
     y: y,
     z: z,
     opacity: 0.7,
     line: {
         width: 10,
         color: c,
         colorscale: 'Viridis'
     }
 }]);

 setInterval(() => {

 var xx = [];
 var yy = [];
 var zz = [];
 
 for (i = 0; i < 100; i++) {
     r = i * (pointCount - i);
     x.push(r * Math.cos(i / 30)*Math.floor(Math.random()*9));
     y.push(r * Math.sin(i / 30)*Math.floor(Math.random()*9));
     z.push(i*Math.floor(Math.random()*9));
 
 }

 Plotly.extendTraces('graph', {
    x: [xx],
    y: [yy],
    z: [zz]
  }, [0], x.length)

 }, 1000);