let view;
let ctx;
let scene;
let start_time;

const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

// Initialization function - called when web page loads
function init() {
    let w = 800;
    let h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
           // type: 'perspective',
            //type: 'parallel',
            prp: Vector3(44, 20, -16),
            srp: Vector3(20, 20, -40),
            vup: Vector3(0, 1, 0),
            clip: [-19, 5, -10, 8, 12, 100]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ],
                matrix: new Matrix(4, 4)
            }
        ]
    };

    // event handler for pressing arrow keys
    document.addEventListener('keydown', onKeyDown, false);
    
    // start animation loop
    start_time = performance.now(); // current timestamp in milliseconds
    window.requestAnimationFrame(animate);
}


function drawScene() {
    // TODO: implement drawing here!
    // For each model, for each edge
    //  * transform to canonical view volume
    //  * clip in 3D
    //  * project to 2D
    //  * draw line

        //for perspective 
    if(scene.view.type == 'perspective'){ 

        let nPer = mat4x4Perspective(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
        let mPer= mat4x4MPer();
        let edges = [];
        //for each model
        for(let i=0; i<scene.models.length; i++){ 
            //for each edge transform
            for(let j=0; j<scene.models[i].edges.length; j++){ 
                for(let k=0; k<scene.models[i].edges[j].length-1; k++){ 
                    //need to get vertex at each index in the exges list and make lines for each pair
                    let p0Pointer = scene.models[i].vertices[scene.models[i].edges[j][k]];
                    let p1Pointer = scene.models[i].vertices[scene.models[i].edges[j][k+1]]; 

                    let pt0 = Vector4(p0Pointer.x,p0Pointer.y,p0Pointer.z,p0Pointer.w);
                    let pt1 = Vector4(p1Pointer.x,p1Pointer.y,p1Pointer.z,p1Pointer.w); 
                    //console.log(pt0);

                    //transform both points to canonical view volume
                    let tP0 = Matrix.multiply([nPer,pt0]);
                    let tP1 = Matrix.multiply([nPer,pt1]);
                   

                    //create line for each set of points
                    let line = {pt0: tP0, pt1:tP1}; 
                    edges.push(line);
                }
            }
        }
        console.log(edges);

        //for each edge, clip  
        let clippedEdges = [];
        for(let x=0; x<edges.length;x++){ 
            let clipped = clipLinePerspective(edges[x]); 

            if(clipped != null){ 
                clippedEdges.push(clipped);
            }else{ 
                clippedEdges.push(edges[x]);
            }
        }
        console.log("clipped edges");
        console.log(clippedEdges);

        //multiply clipped edges by mPer and scale 
        let v = new Matrix(4,4);
        v.values= (
                [view.width/2, 0, 0, view.width/2,
                0, view.height/2, 0, view.height/2,
                0, 0, 1, 0,
                0, 0, 0, 1]
                );

        for(edge of clippedEdges){ //think this is how you do a for each loop
                edge.pt0=Matrix.multiply([mPer,edge.pt0]);
                edge.pt1=Matrix.multiply([mPer,edge.pt1]);
        }


        console.log(clippedEdges);

        for(edge of clippedEdges){ //think this is how you do a for each loop
                edge.pt0=Matrix.multiply([v,edge.pt0]);
                edge.pt1=Matrix.multiply([v,edge.pt1]);
        }
        console.log("scaled");
        console.log(clippedEdges);


        //divide x and y by w
        for(edge of clippedEdges){ //think this is how you do a for each loop
            edge.pt0.x=(edge.pt0.x)/(edge.pt0.w);
            edge.pt0.y=(edge.pt0.y)/(edge.pt0.w);
            edge.pt1.x=(edge.pt1.x)/(edge.pt1.w);
            edge.pt1.y=(edge.pt1.y)/(edge.pt1.w);
        }

        console.log("draiwng edges");
        console.log(clippedEdges);

        //then draw each edge
        for(edge of clippedEdges){ //think this is how you do a for each loop
            drawLine(edge.pt0.x,edge.pt0.y,edge.pt1.x,edge.pt1.y);
        }

    }else if(scene.view.type == "parallel"){ 
        let nPar = mat4x4Parallel(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
        let mPar= mat4x4MPar();
        let edges = [];
        //for each model
        for(let i=0; i<scene.models.length; i++){ 
            //for each edge transform
            for(let j=0; j<scene.models[i].edges.length; j++){ 
                for(let k=0; k<scene.models[i].edges[j].length-1; k++){ 
                    //need to get vertex at each index in the exges list and make lines for each pair
                    let p0Pointer = scene.models[i].vertices[scene.models[i].edges[j][k]];
                    let p1Pointer = scene.models[i].vertices[scene.models[i].edges[j][k+1]]; 

                    let pt0 = Vector4(p0Pointer.x,p0Pointer.y,p0Pointer.z,p0Pointer.w);
                    let pt1 = Vector4(p1Pointer.x,p1Pointer.y,p1Pointer.z,p1Pointer.w); 
                    //console.log(pt0);

                    //transform both points to canonical view volume
                    let tP0 = Matrix.multiply([nPar,pt0]);
                    let tP1 = Matrix.multiply([nPar,pt1]);
                   

                    //create line for each set of points
                    let line = {pt0: tP0, pt1:tP1}; 
                    edges.push(line);
                }
            }
        }
        console.log(edges);

        //for each edge, clip  
        let clippedEdges = [];
        for(let x=0; x<edges.length;x++){ 
            let clipped = clipLineParallel(edges[x]); 

            if(clipped != null){ 
                clippedEdges.push(clipped);
            }else{ 
                clippedEdges.push(edges[x]);
            }
        }
        console.log("clipped edges");
        console.log(clippedEdges);

        //multiply clipped edges by mPer and scale 
        let v = new Matrix(4,4);
        v.values= (
                [view.width/2, 0, 0, view.width/2,
                0, view.height/2, 0, view.height/2,
                0, 0, 1, 0,
                0, 0, 0, 1]
                );

        for(edge of clippedEdges){ //think this is how you do a for each loop
                edge.pt0=Matrix.multiply([mPar,edge.pt0]);
                edge.pt1=Matrix.multiply([mPar,edge.pt1]);
        }

        console.log(clippedEdges);

        for(edge of clippedEdges){ //think this is how you do a for each loop
                edge.pt0=Matrix.multiply([v,edge.pt0]);
                edge.pt1=Matrix.multiply([v,edge.pt1]);
        }
        console.log("scaled");
        console.log(clippedEdges);


        //divide x and y by w
        for(edge of clippedEdges){ //think this is how you do a for each loop
            edge.pt0.x=(edge.pt0.x)/(edge.pt0.w);
            edge.pt0.y=(edge.pt0.y)/(edge.pt0.w);
            edge.pt1.x=(edge.pt1.x)/(edge.pt1.w);
            edge.pt1.y=(edge.pt1.y)/(edge.pt1.w);
        }

        console.log("draiwng edges");
        console.log(clippedEdges);

        //then draw each edge
        for(edge of clippedEdges){ //think this is how you do a for each loop
            drawLine(edge.pt0.x,edge.pt0.y,edge.pt1.x,edge.pt1.y);
        }
    }
}


// Get outcode for vertex (parallel view volume)
function outcodeParallel(vertex) {
    let outcode = 0;
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (1.0 + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (-1.0 - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (1.0 + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.x > (0.0 + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Get outcode for vertex (perspective view volume)
function outcodePerspective(vertex, z_min) {
    let outcode = 0;
    if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.x > (z_min + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLineParallel(line) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodeParallel(p0);
    let out1 = outcodeParallel(p1);

    while(true) {
        if(!(out0 | out1)) {
            result = line;
            break;
        } else if(out0 & out1) {
            result = null;
            break;
        } else {
            let outCode = out0 > out1 ? out0 : out1;
            let t;

            if(outCode & LEFT) {
                t = (-1 - p0.x)/(p1.x - p0.x);
            } else if(outCode & RIGHT) {
                t = (1 - p0.x)/(p1.x - p0.x);
            } else if(outCode & BOTTOM) {
                t = (-1 - p0.y)/(p1.y-p0.y);
            } else if(outCode & TOP) {
                t = (1 - p0.y)/(p1.y-p0.y);
            } else if(outCode & FAR) {
                t = (-1 - p0.z)/(p1.z-p0.z);
            } else if(outCode & NEAR) {
                t = (0 - p0.z)/(p1.z-p0.z);
            }

            let xt = p0.x + (p1.x-p0.x)*t;
            let yt = p0.y + (p1.y-p0.y)*t;
            let zt = p0.z + (p1.z-p0.z)*t;

            if(outCode == out0) {
                p0.values = [xt, yt, zt];
                out0 = outcodeParallel(p0);
            } else {
                p1.values = [xt, yt, zt];
                out1 = outcodeParallel(p1);
            }
        }
    }
    // TODO: implement clipping here!
    
    return result;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);
    
    while(true) {
        if(!(out0 | out1)) {
            result = line;
            break;
        } else if(out0 & out1) {
            result = null;
            break;
        } else {
            let outCode = out0 > out1 ? out0 : out1;
            let t;

            if(outCode & LEFT) {
                t = (-p0.x + p0.z)/((p1.x - p0.x) - (p1.z - p0.z));
            } else if(outCode & RIGHT) {
                t = (p0.x + p0.z)/(-(p1.x - p0.x) - (p1.z - p0.z));
            } else if(outCode & BOTTOM) {
                t = (-p0.y + p0.z)/((p1.y - p0.y) - (p1.z - p0.z));                
            } else if(outCode & TOP) {
                t = (-p0.y + p0.z)/(-(p1.y - p0.y) - (p1.z - p0.z));                
            } else if(outCode & FAR) {
                t = (-p0.z - 1)/(p1.z - p0.z);
            } else if(outCode & NEAR) {
                t = (p0.z - z_min)/(-(p1.z - p0.z));
            }

            let xt = p0.x + (p1.x-p0.x)*t;
            let yt = p0.y + (p1.y-p0.y)*t;
            let zt = p0.z + (p1.z-p0.z)*t;

            if(outCode == out0) {
                p0.values = [xt, yt, zt];
                out0 = outcodePerspective(p0);
            } else {
                p1.values = [xt, yt, zt];
                out1 = outcodePerspective(p1);
            }
        }
    }
    
    return result;
}

//leave this alone for now

// Animation loop - repeatedly calls rendering code
function animate(timestamp) {
    // step 1: calculate time (time since start)
    let time = timestamp - start_time;

    // step 2: transform models based on time
    // TODO: implement this!
    
    //Clone the vertices
    let vertices = scene.models[0].vertices.map(v => v);
    
    //Update vertices after apply rotation matrix
    let mat = rotateAboutXAnimation(time, vertices);
    scene.models[0].vertices = vertices.map(v => Matrix.multiply([mat, v]));

    // step 3: draw scene
    ctx.clearRect(0, 0, view.width, view.height);

    drawScene();

    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)
    window.requestAnimationFrame(animate);
}


function rotateAboutXAnimation(time, vertices) {
    let len = vertices.length;
    //Get the center vertex
    let center = new Vector3();
    vertices.map(v => {
        center.x += v.x/len;
        center.y += v.y/len;
        center.z += v.z/len;
    })
    // let theta = 0.01*time/1000%1;
    let theta = 0.01;

    //Rotating matrices
    let tCenter1 = new Matrix(4,4);
    Mat4x4Translate(tCenter1, center.x, center.y, center.z);

    let tCenter2 = new Matrix(4,4);
    Mat4x4Translate(tCenter2, -center.x, -center.y, -center.z);

    let rotateAboutX = new Matrix(4,4);
    Mat4x4RotateX(rotateAboutX, theta); 


    return Matrix.multiply([tCenter1, rotateAboutX, tCenter2]);
}


// Called when user presses a key on the keyboard down 
function onKeyDown(event) {
    let n = scene.view.prp.subtract(scene.view.srp);
    n.normalize();
    let u = scene.view.vup.cross(n);
    u.normalize();
    let v = n.cross(u);
    v.normalize();

    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            break;
        case 65: // A key
        //prp and srp left along the u axis
        scene.view.prp = scene.view.prp.subtract(u);
        scene.view.srp = scene.view.srp.subtract(u);
        console.log("A");
        //deletes previous frame
        ctx.clearRect(0, 0, view.width, view.height);
        drawScene();
        break;
        case 68: // D key
        //prp and srp right along u axis 
        scene.view.prp = scene.view.prp.add(u);
        scene.view.srp = scene.view.srp.add(u);
        console.log("D");
        //deletes previous frame
        ctx.clearRect(0, 0, view.width, view.height);
        drawScene();
        break;
        case 83: // S key
        //prp and srp back along n 
        scene.view.prp = scene.view.prp.subtract(n);
        scene.view.srp = scene.view.srp.subtract(n);
        console.log("S");
        //deletes previous frame
        ctx.clearRect(0, 0, view.width, view.height);
        drawScene();
        break;
        case 87: // W key
        //prp and srp up along n 
        scene.view.prp = scene.view.prp.add(n);
        scene.view.srp = scene.view.srp.add(n);
        console.log("W");
        //deletes previous frame
        ctx.clearRect(0, 0, view.width, view.height);
        drawScene();
        break;
    }
}


///////////////////////////////////////////////////////////////////////////
// No need to edit functions beyond this point
///////////////////////////////////////////////////////////////////////////

// Called when user selects a new scene JSON file
function loadNewScene() {
    let scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    let reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);
        scene.view.srp = Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
            scene.models[i].matrix = new Matrix(4, 4);
        }
    };
    reader.readAsText(scene_file.files[0], 'UTF-8');
}

// Draw black 2D line with red endpoints 
function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}
