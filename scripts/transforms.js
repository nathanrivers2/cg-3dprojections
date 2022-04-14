// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Parallel(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    //Modify the given matrix to get "translate PRP to origin" matrix
    var tPRP = new Matrix(4, 4);
    Mat4x4Translate(tPRP, -prp.x, -prp.y, -prp.z);

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    //Modify the given matrix to get "rotate VRC such that (u,v,n) align with (x,y,z)" matrix
    var rVRC = new Matrix(4, 4);
    Mat4x4RotateVRC(rVRC, prp, srp, vup);
    // 3. shear such that CW is on the z-axis
    //Center of window: (left+right)/2, (bottom+top)/2
    var cw = new Vector3((clip[0] + clip[1])/2, (clip[2]+clip[3])/2, -clip[4]);
    //DOP: CW
    var dop = cw;
    //Modify the given matrix to get "shear such that CW is on the z-axis" matrix
    var shPar = new Matrix(4, 4);
    Mat4x4ShearXY(shPar, -dop.x/dop.z, -dop.y/dop.z);

    // 4. translate near clipping plane to origin
    //Modify the given matrix to get "translate near clipping plane to origin" matrix
    var tPar = new Matrix(4, 4);
    Mat4x4Translate(tPar, 0, 0, clip[4]);

    // 5. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])
    //Modify the given matrix to get "scale such that view volume" matrix
    var sPar = new Matrix(4, 4);
    Mat4x4Scale(sPar, 2/(clip[1] - clip[0]), 2/(clip[3] - clip[2]), 1/clip[5]);

    // Multiply them all together
    return Matrix.multiply([sPar, tPar, shPar, rVRC, tPRP]);
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    var tPRP = new Matrix(4, 4);
    Mat4x4Translate(tPRP, -prp.x, -prp.y, -prp.z);

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    var rVRC = new Matrix(4, 4);
    Mat4x4RotateVRC(rVRC, prp, srp, vup);

    // 3. shear such that CW is on the z-axis
    //Center of window: (left+right)/2, (bottom+top)/2
    var cw = new Vector3((clip[0] + clip[1])/2, (clip[2] + clip[3])/2, -clip[4]);
    //DOP: CW - PRP
    var dop = cw;
    var shPar = new Matrix(4, 4);
    Mat4x4ShearXY(shPar, -dop.x/dop.z, -dop.y/dop.z);
    console.log(shPar)

    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    var sPer = new Matrix(4, 4);
    Mat4x4Scale(sPer, 2 * clip[4] / ((clip[1] - clip[0]) * clip[5]), 2 * clip[4] / ((clip[3] - clip[2]) * clip[5]), 1 / clip[5]);
    
    // Multiply them all together
    return Matrix.multiply([sPer, shPar, rVRC, tPRP]);
}

// create a 4x4 matrix to project a parallel image on the z=0 plane
function mat4x4MPar() {
    let mpar = new Matrix(4, 4);
    mpar.values =   [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 0, 0],
                     [0, 0, 0, 1]];
    return mpar;
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    let mper = new Matrix(4, 4);
    mper.values =   [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, -1, 0]];
    return mper;
}

//Helper function to create a 4x4 matrix - Rotated VRC
function Mat4x4RotateVRC(mat4x4, prp, srp, vup) {
    //n-axis: normalized(PRP-SRP)
    var n = prp.subtract(srp);
    n.normalize();
    //u-axis: normalized(VUP x n-axis)
    var u = vup.cross(n);
    u.normalize();

    //v-axis: n-axis x u-axis
    var v = n.cross(u);
    mat4x4.values = [[u.x, u.y, u.z, 0], 
                    [v.x, v.y, v.z, 0], 
                    [n.x, n.y, n.z, 0], 
                    [0, 0, 0, 1]];
}


///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]]; 
}

// set values of existing 4x4 matrix to the translate matrix
function Mat4x4Translate(mat4x4, tx, ty, tz) {
    mat4x4.values = [[1, 0, 0, tx],
                     [0, 1, 0, ty],
                     [0, 0, 1, tz],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the scale matrix
function Mat4x4Scale(mat4x4, sx, sy, sz) {
    mat4x4.values = [[sx, 0, 0, 0],
                     [0, sy, 0, 0],
                     [0, 0, sz, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function Mat4x4RotateX(mat4x4, theta) {
    let cos = Math.cos(theta);
    let sin = Math.sin(theta);
    mat4x4.values = [[1,  0,   0,     0],
                     [0, cos, -sin, 0],
                     [0, sin, cos,    0],
                     [0, 0,    0,     1]];
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function Mat4x4RotateY(mat4x4, theta) {
    let cos = Math.cos(theta);
    let sin = Math.sin(theta);
    mat4x4.values = [[cos,   0,   sin,    0],
                     [0,     cos, -1*sin, 0],
                     [-1*sin, 0,  cos,    0],
                     [0,      0,    0,    1]];
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function Mat4x4RotateZ(mat4x4, theta) {
    let cos = Math.cos(theta);
    let sin = Math.sin(theta);
    mat4x4.values = [[cos, -1*sin,  0,    0],
                     [sin,  cos,  -1*sin, 0],
                     [0,    0,     1,     0],
                     [0,    0,     0,     1]];
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function Mat4x4ShearXY(mat4x4, shx, shy) {
    mat4x4.values = [[1, 0, shx, 0],
                     [0, 1, shy, 0],
                     [0, 0,  1,  0],
                     [0, 0,  0,  1]];
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}
