import * as CG from './transforms.js';
import { Matrix } from './matrix.js'; // since we created a new Matrix class, we need to import it here to use it in the Renderer class

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // limit_fps_flag:      bool 
    // fps:                 int
    constructor(canvas, limit_fps_flag, fps) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.slide_idx = 0;
        this.limit_fps = limit_fps_flag;
        this.fps = fps;
        this.start_time = null;
        this.prev_time = null;

        // Slide 1: spinning polygon angles
        this.spinAngle1 = 0;
        this.spinAngle2 = 0;
        this.spinAngle3 = 0;

        // Slide 3: fun animation
        this.funAngle = 0;

        this.models = {
            slide0: [
                // example model (diamond) -> should be replaced with actual model
                {
                    /* vertices: [
                        CG.Vector3(400, 150, 1),
                        CG.Vector3(500, 300, 1),
                        CG.Vector3(400, 450, 1),
                        CG.Vector3(300, 300, 1)
                    ],
                    transform: null
                    */
                   vertices: [], transform: null, x: 150, y: 150, vx: 100, vy: 100, radius: 50
                }
            ],
            slide1: [
                {
                    // Triangle vertices centered around (0, 0)
                    vertices: [
                        CG.Vector3(0, -50, 1),
                        CG.Vector3(45, 35, 1),
                        CG.Vector3(-45, 35, 1)
                    ],
                    x: 150,
                    y: 150,
                    speed: 1.0,
                    angle: 0,
                    color: [255, 80, 80, 255],
                    transform: null
                },
                {
                    // Square vertices centered around (0, 0)
                    vertices: [
                        CG.Vector3(-40, -40, 1),
                        CG.Vector3(40, -40, 1),
                        CG.Vector3(40, 40, 1),
                        CG.Vector3(-40, 40, 1)
                    ],
                    x: 400,
                    y: 150,
                    speed: -1.5,
                    angle: 0,
                    color: [70, 150, 255, 255],
                    transform: null
                },
                {
                    // Pentagon vertices centered around (0, 0)
                    vertices: [
                        CG.Vector3(0, -50, 1),
                        CG.Vector3(48, -15, 1),
                        CG.Vector3(30, 40, 1),
                        CG.Vector3(-30, 40, 1),
                        CG.Vector3(-48, -15, 1)
                    ],
                    x: 650,
                    y: 150,
                    speed: 0.7,
                    angle: 0,
                    color: [80, 210, 130, 255],
                    transform: null
                }
            ],
            // constructor
            slide2: [
                {
                    // diamond
                    vertices: [
                        CG.Vector3(0, -150, 1),
                        CG.Vector3(100, 0, 1),
                        CG.Vector3(0, 150, 1),
                        CG.Vector3(-100, 0, 1)
                    ],
                    x: 220,
                    y: 300,
                    transform: null
                },
                {
                    // hexagon
                    vertices: [
                        CG.Vector3(-50, -90, 1),
                        CG.Vector3(50, -90, 1),
                        CG.Vector3(100, 0, 1),
                        CG.Vector3(50, 90, 1),
                        CG.Vector3(-50, 90, 1),
                        CG.Vector3(-100, 0, 1)
                    ],
                    x: 570,
                    y: 300,
                    transform: null
                },

            ],
            slide3: [
                {
                    vertices: this.createStarVertices(50, 20),
                    baseX: 200,
                    baseY: 200,
                    x: 200,
                    y: 200,
                    angle: 0,
                    rotateSpeed: 1.5,
                    scaleAmount: 0.3,
                    moveDistance: 50,
                    color: [255, 215, 0, 255],
                    transform: null
                },
                {
                    vertices: this.createStarVertices(40, 16),
                    baseX: 400,
                    baseY: 200,
                    x: 400,
                    y: 200,
                    angle: 0,
                    rotateSpeed: -1.2,
                    scaleAmount: 0.25,
                    moveDistance: 40,
                    color: [255, 100, 150, 255],
                    transform: null
                },
                {
                    vertices: this.createStarVertices(45, 18),
                    baseX: 600,
                    baseY: 200,
                    x: 600,
                    y: 200,
                    angle: 0,
                    rotateSpeed: 1,
                    scaleAmount: 0.35,
                    moveDistance: 30,
                    color: [100, 200, 255, 255],
                    transform: null
                }
            ],
        };

        // create 40 vertices for the ball 
        for (let i = 0; i < 40; i++) {
            let theta = (i / 40) * 2 * Math.PI; // radians
            let x = this.models.slide0[0].radius * Math.cos(theta); // x coordinate
            let y = this.models.slide0[0].radius * Math.sin(theta); // y coordinate
            this.models.slide0[0].vertices.push(CG.Vector3(x, y, 1)); // add vertex to the ball's vertices array
        }

    }

    // flag:  bool
    limitFps(flag) {
        this.limit_fps = flag;
    }

    // n:  int
    setFps(n) {
        this.fps = n;
    }

    // idx: int
    setSlideIndex(idx) {
        this.slide_idx = idx;
    }

    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time; // time since start of animation
        let delta_time = timestamp - this.prev_time; // time since last frame
        //console.log('animate(): t = ' + time.toFixed(1) + ', dt = ' + delta_time.toFixed(1));

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.drawSlide();

        // Invoke call for next frame in animation
        if (this.limit_fps) {
            setTimeout(() => {
                window.requestAnimationFrame((ts) => {
                    this.animate(ts);
                });
            }, Math.floor(1000.0 / this.fps));
        }
        else {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation

        // -----SLIDE 0: BOUNCING BALL
        let dtSec = delta_time / 1000.0; // converts delta_time from milliseconds to seconds

        let ball = this.models.slide0[0];

        // update ball position based on its velocity and delta time
        ball.x += ball.vx * dtSec;
        ball.y += ball.vy * dtSec;

        // check for right wall collisions
        if (ball.x + ball.radius > this.canvas.width) {
            ball.x = this.canvas.width - ball.radius; // reposition to the edge
            ball.vx *= -1; // reverse x velocity
        } 
        // check for left wall collisions
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius; // reposition to the edge
            ball.vx *= -1; // reverse x velocity
        }
        // check for bottom wall collisions
        if (ball.y + ball.radius > this.canvas.height) {
            ball.y = this.canvas.height - ball.radius; // reposition to the edge
            ball.vy *= -1; // reverse y velocity
        } 
        // check for top wall collisions
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius; // reposition to the edge
            ball.vy *= -1; // reverse y velocity
        }

        // create new 3x3 matrix to store the ball's transformation
        ball.transform = new Matrix(3, 3);

        // turn into a translation matrix to move the ball to its new position
        CG.mat3x3Translate(ball.transform, ball.x, ball.y);


        // ----- SLIDE 1: SPINNING POLYGONS
        let dtSec3 = delta_time / 1000.0;

        for (let i = 0; i < this.models.slide1.length; i++) {
            let polygon = this.models.slide1[i];

            // Update the rotation angle based on elapsed time
            polygon.angle += polygon.speed * dtSec3;

            // Create rotation and translation matrices
            let R = new Matrix(3, 3);
            let T = new Matrix(3, 3);

            CG.mat3x3Rotate(R, polygon.angle);
            CG.mat3x3Translate(T, polygon.x, polygon.y);

            // Rotate first, then move to the polygon's position
            polygon.transform = T.mult(R);
        }


        // -----SLIDE 2: GROW / SHRINK 
        let dtSec2 = time / 1000.0; // converts total animation time from milliseconds to seconds

        let diamond = this.models.slide2[0];
        let hexagon = this.models.slide2[1];

        let diamondScale = 1 + 0.5 * Math.sin(2 * Math.PI * 0.5 * dtSec2);

        // grow and shrinking hexagon
        let scaleX = 1 + 0.6 * Math.sin(2 * Math.PI * 0.4 * dtSec2);
        let scaleY = 1 + 0.3 * Math.sin(2 * Math.PI * 0.8 * dtSec2);

        // diamond transformation matrix
        let S1 = new Matrix(3, 3); // scaling matrix
        let T1 = new Matrix(3, 3); // translation matrix

        CG.mat3x3Scale(S1, diamondScale, diamondScale);
        CG.mat3x3Translate(T1, diamond.x, diamond.y);

        diamond.transform = T1.mult(S1); // combine scale (first) and translation (second) matrices to get the final transformation matrix for the diamond

        // hexagon transformation matrix
        let S2 = new Matrix(3, 3); // scaling matrix
        let T2 = new Matrix(3, 3); // translation matrix

        CG.mat3x3Scale(S2, scaleX, scaleY);
        CG.mat3x3Translate(T2, hexagon.x, hexagon.y);

        hexagon.transform = T2.mult(S2);


        // ----- SLIDE 3: ANIMATED STARS - FUN ANIMATION
        let dtSec4 = delta_time / 1000.0;
        let timeSec4 = time / 1000.0;

        for (let i = 0; i < this.models.slide3.length; i++) {
            let star = this.models.slide3[i];

            star.angle += star.rotateSpeed * dtSec4;

            star.x = star.baseX +
                Math.sin(timeSec4 + i) * star.moveDistance;

            star.y = star.baseY +
                Math.cos(timeSec4 + i) * star.moveDistance * 0.5;

            let scaleAmount =
                1 + star.scaleAmount * Math.sin(timeSec4 * 2 + i);

            let R = new Matrix(3, 3);
            CG.mat3x3Rotate(R, star.angle);

            let S = new Matrix(3, 3);
            CG.mat3x3Scale(S, scaleAmount, scaleAmount);

            let T = new Matrix(3, 3);
            CG.mat3x3Translate(T, star.x, star.y);

            star.transform = T.mult(R.mult(S));
        }
    }

    drawSlide() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.slide_idx) {
            case 0:
                this.drawSlide0();
                break;
            case 1:
                this.drawSlide1();
                break;
            case 2:
                this.drawSlide2();
                break;
            case 3:
                this.drawSlide3();
                break;
        }
    }


    drawSlide0() {
        // TODO: draw bouncing ball (circle that changes direction whenever it hits an edge)
        
        // apply the transformation to the ball's vertices
        let ball = this.models.slide0[0];

        // empty array to store new positions of the ball's vertices after transformation
        // array because ball is made up of 40 vertices (points)(num_edges = 40)
        let transformedVertices = []; 

        for (let v of ball.vertices) { // iterate through each vertex of the ball
            let newVertex = ball.transform.mult(v); // multiply the transformation matrix by the vertex to get the new position
            transformedVertices.push(newVertex); // add the new position to the array
        }
        
        // Following lines are example of drawing a single polygon
        // (this should be removed/edited after you implement the slide)
        let teal = [0, 128, 128, 255];
        this.drawConvexPolygon(transformedVertices, teal);
    }

    //
    drawSlide1() {
        // TODO: draw at least 3 polygons that spin about their own centers
        //   - have each polygon spin at a different speed / direction

        for (let i = 0; i < this.models.slide1.length; i++) {
            let polygon = this.models.slide1[i];
            let transformedVertices = [];

            // Transform every vertex of the polygon
            for (let v of polygon.vertices) {
                let newVertex = polygon.transform.mult(v);
                transformedVertices.push(newVertex);
            }

            // Draw the polygon
            this.drawConvexPolygon(
                transformedVertices,
                polygon.color
            );
        }
    }

    //
    drawSlide2() {
        // TODO: draw at least 2 polygons grow and shrink about their own centers
        //   - have each polygon grow / shrink different sizes
        //   - try at least 1 polygon that grows / shrinks non-uniformly in the x and y directions
        let diamond = this.models.slide2[0];
        let hexagon = this.models.slide2[1];

        let transformDiamond = [];
        let transformHexagon = [];

        for (let v of diamond.vertices) {
            let newVertex = diamond.transform.mult(v);
            transformDiamond.push(newVertex);
        }

        for (let v of hexagon.vertices) {
            let newVertex = hexagon.transform.mult(v);
            transformHexagon.push(newVertex);
        }

        let green = [0, 255, 0, 255];
        let blue = [0, 0, 255, 255];

        // draw the polygons using the transformed vertices
        this.drawConvexPolygon(transformDiamond, green);
        this.drawConvexPolygon(transformHexagon, blue);
    }

    // for slide3 - fun
    createStarVertices(outerRadius, innerRadius) {
    let vertices = [];

    for (let i = 0; i < 10; i++) {
        let angle = (Math.PI / 5) * i - Math.PI / 2;
        let radius = (i % 2 === 0) ? outerRadius : innerRadius;

        vertices.push(CG.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            1
        ));
    }

    return vertices;
}

//
    drawSlide3() {
        // TODO: get creative!
        //   - animation should involve all three basic transformation types
        //     (translation, scaling, and rotation)

        for (let i = 0; i < this.models.slide3.length; i++) {
            let star = this.models.slide3[i];
            let transformedVertices = [];

            for (let j = 0; j < star.vertices.length; j++) {
                let v = star.vertices[j];
                let transformed = star.transform.mult(v);
                transformedVertices.push(transformed);
            }

            this.drawConvexPolygon(transformedVertices, star.color);
        }
    }

    
    // vertex_list:  array of object [Matrix(3, 1), Matrix(3, 1), ..., Matrix(3, 1)]
    // color:        array of int [R, G, B, A]
    drawConvexPolygon(vertex_list, color) {
        this.ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (color[3] / 255) + ')';
        this.ctx.beginPath();
        let x = vertex_list[0].values[0][0] / vertex_list[0].values[2][0];
        let y = vertex_list[0].values[1][0] / vertex_list[0].values[2][0];
        this.ctx.moveTo(x, y);
        for (let i = 1; i < vertex_list.length; i++) {
            x = vertex_list[i].values[0][0] / vertex_list[i].values[2][0];
            y = vertex_list[i].values[1][0] / vertex_list[i].values[2][0];
            this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
};

export { Renderer };
