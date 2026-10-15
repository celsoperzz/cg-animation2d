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
            slide1: [],
            slide2: [],
            slide3: []
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

    //
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
        
        
    }

    //
    drawSlide2() {
        // TODO: draw at least 2 polygons grow and shrink about their own centers
        //   - have each polygon grow / shrink different sizes
        //   - try at least 1 polygon that grows / shrinks non-uniformly in the x and y directions


    }

    //
    drawSlide3() {
        // TODO: get creative!
        //   - animation should involve all three basic transformation types
        //     (translation, scaling, and rotation)
        
        
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
