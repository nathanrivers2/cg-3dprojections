// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Parallel(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    // 3. shear such that CW is on the z-axis
    // 4. translate near clipping plane to origin
    // 5. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])

    // ...
    // let transform = Matrix.multiply([...]);
    // return transform;
    var tPRP = new Matrix(4, 4);
    Mat4x4Translate(tPRP, -prp.x, -prp.y, -prp.z);

    var rVRC = new Matrix(4, 4);
    Mat4x4RotateVRC(rVRC, prp, srp, vup);

    var cw = new Vector3((clip[0] + c[1])/2, (c[2] + c[3])/2, -c[4]);
    var dop = cw.subtract(prp);
    var shPar = new Matrix(4, 4);
    Mat4x4ShearXY(shPar, -dop.x/dop.z, -dop.y/dop.z);

    var tPar = new Matrix(4, 4);
    Mat4x4Translate(tPar, 0, 0, c[4]);

    var sPar = new Matrix(4, 4);
    Mat4x4Scale(sPar, 2/(c[1] - c[0]), 2/(c[3] - c[2]), 1/c[5]);
    
    return Matrix.multiply([sPar, tPar, shPar, rVRC, tPRP]);
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    // 3. shear such that CW is on the z-axis
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])

    // ...
    // let transform = Matrix.multiply([...]);
    // return transform;
    var tPRP = new Matrix(4, 4);
    Mat4x4Translate(tPRP, -prp.x, -prp.y, -prp.z);

    var rVRC = new Matrix(4, 4);
    Mat4x4RotateVRC(rVRC, prp, srp, vup);

    var cw = new Vector3((clip[0] + c[1])/2, (c[2] + c[3])/2, -c[4]);
    var dop = cw.subtract(prp);
    var shPar = new Matrix(4, 4);
    Mat4x4ShearXY(shPar, -dop.x/dop.z, -dop.y/dop.z);

    var sPer = new Matrix(4, 4);
    Mat4x4Scale(sPer, 2 * c[4] / ((c[1] - c[0]) * c[5]), 2 * c[4] / ((c[3] - c[2]) * c[5]), 1 / c[5]);

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
    mpar.values =   [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 0, 0],
                     [0, 0, -1, 0]];
    return mper;
}

function Mat4x4RotateVRC(mat4x4, prp, srp, vup) {
    var n = prp.subtract(srp).normalize();
    var u = vup.cross(n).normalize();
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
                     [0, cos, -1*sin, 0],
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
