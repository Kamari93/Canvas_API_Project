// Destructor from the matter library (Matter is a global variable)
// Engine is used to transition from current state of our world into a new state
// Render is used to draw things onto the screen
// Runner coordinates updates between the engine and the world
// Bodies is the reference to the entire collection of shapes we create
// World is a snapshot of all the diff shapes that we have
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter

// columns
const cellsHorizontal = 20;
// rows
const cellsVertical = 15;
const width = window.innerWidth;
const height = window.innerHeight;

// gives the program the measurements for each cell...one side of one of our square cells
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

// Boiler plate code
const engine = Engine.create();
// disable gravity in the y direction 
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    // tell render where we want to show rep inside html
    element: document.body,
    // specify what engine to use
    engine: engine,
    // pass in an options object
    options: {
        wireframes: false,
        width,
        height
    }
});

// tell render to draw all updates on the screen
Render.run(render);
// Runner coordinates all changes of our engine
Runner.run(Runner.create(), engine);


// Walls-Border For Canvas:
// the first 2 numbers for the shapes are positional from top right (x,y) and the last 2 are width and height of the shape
// setting the static property to true ensures that the shape will never move
// be default gravity is enabled in the simulation
const walls =
    // top wall
    [Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    // bottom wall
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
    // left side wall
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
    // right side wall
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })];
World.add(world, walls);

// Maze generation

// shuffle function for random maze generation...take an array and randomly re-order
const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        // gives random index inside the arr
        const index = Math.floor(Math.random() * counter);
        counter = counter - 1;
        // swaps the elements to randomize the order...swap whatever index is with whats currently at counter...ensures we swap each element atleast one time
        const temporary = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temporary;
    }
    return arr
};

// create an empty array with 3 possible places in it... for each element inside map over the arr and return new arr with 3 elements of false
const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
    // If i have visited the cell at [row, column], then return
    if (grid[row][column]) {
        return;
    }
    // Mark this cell as being visited...grid array keeps track of visited cells
    grid[row][column] = true;

    // Assemble randomly-order list of neighbors...coordinate pairs of all neighbors for different maze generations
    const neighbors = shuffle([
        // neigbor order below...up, right, down, left
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);


    // For each neighbor...
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor
        // See if that neighbor is out of bounds...don't go in direction that doesn't exist 
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
        };

        // Check if we have visited that neighbor, and continue to next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }

        // Remove a wall from either horizontals or verticals 
        // moving left or right 
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
            // move up and down 
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }

        // iterates through  random walls visited, creating maze by adding true/false v/h values indicating if wall present (recursion)
        stepThroughCell(nextRow, nextColumn);
    }

    // Visit the next cell...call stepThroughCell() again with new row,column of the cell we want to visit
};

// stepThroughCell(startRow, startColumn);
stepThroughCell(startRow, startColumn);

// iterate over the horizontals ...generating the maze utilizing the false values to create rectangles
horizontals.forEach((row, rowIndex) => {
    // check each row and if open is true don't create a rectangle
    row.forEach((open, columnIndex) => {
        if (open === true) {
            return;
        }

        // x,y coordinates and width height of rectangle 
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );
        World.add(world, wall);
    });
});

// iterate over the vertcals ...generating the maze utilizing the false values to create rectangles
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open === true) {
            return;
        }

        // x,y coordinates and width height of rectangle 
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );
        World.add(world, wall)
    });
});

// Goal
const goal = Bodies.rectangle(
    // x,y coordinates for the center of the goal cell and then the width and height
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7,
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'green'
        }
    }
);

World.add(world, goal);

// Ball 
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4
const ball = Bodies.circle(
    // x,y coordniates for center of the ball and radius
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    {
        label: 'ball',
        render: {
            fillStyle: 'orange'
        }
    }
);

World.add(world, ball)

// key controls for ball
document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    // move ball up...using js key codes
    if (event.keyCode === 81) {
        Body.setVelocity(ball, { x: x, y: y - 5 });
    }

    // move ball down...using js key codes
    if (event.keyCode === 65) {
        Body.setVelocity(ball, { x: x, y: y + 5 });
    }

    // move ball left...using js key codes
    if (event.keyCode === 37) {
        Body.setVelocity(ball, { x: x - 5, y: y });
    }

    // move ball right...using js key codes
    if (event.keyCode === 39) {
        Body.setVelocity(ball, { x: x + 5, y: y });
    }
});

// Win Condition
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];

        // check if the collision includes the ball and goal where either can be label a or b
        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
            // if user wins, turn gravity back on
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            // static makes the walss stay fixed in place so by setting it to false we make the walls collapse
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});