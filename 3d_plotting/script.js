
 var x = [];
 var y = [];
 var z = [];
 var c = [];

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


     x.push(Math.floor(Math.random() * 29));
     y.push(Math.floor(Math.random() * 99));
     z.push(Math.floor(Math.random() * 9));
     c.push(Math.floor(Math.random() * 255));


     Plotly.react('graph', [{
         type: 'scatter3d',
         mode: 'lines',
         x: x,
         y: y,
         z: z,
         opacity: 0.7,
         line: {
             width: 5,
             color: c,
             colorscale: 'Viridis'
         }
     }]);


 }, 50);