function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result
        ? [
              parseInt(result[1], 16),
              parseInt(result[2], 16),
              parseInt(result[3], 16),
          ]
        : [0, 0, 0];
}

/**
 * Detects the shapes from the list of points then creates
 * separate list of points for each shape. In every shapes
 * the points are ordered so that it's possible to draw the shape
 * just iterating one by one
 * @param {number[][]} points
 * @returns {number[][]}
 */
function constructShapes(points) {
    const shapes = [];

    points.map((point) => {
        let shapeIndex = -1;
        let closestPointIndex = -1;

        shapes.map((shape, index) => {
            let { index: _closestPointIndex, ...rest } = getClosestPoint(
                shape,
                point,
                2
            );
            if (_closestPointIndex >= 0) {
                shapeIndex = index;
                closestPointIndex = _closestPointIndex;
            }
        });

        if (shapeIndex === -1) {
            shapes.push([]);
            shapeIndex = shapes.length - 1;
            closestPointIndex = 0;
        }
        let nextPoint = shapes[shapeIndex][closestPointIndex + 1];
        if (
            !nextPoint ||
            nextPoint[0] != point[0] ||
            nextPoint[1] != point[1]
        ) {
            shapes[shapeIndex].splice(closestPointIndex + 1, 0, point);
        }
    });
    return shapes;
}

/**
 *
 * @param {number[][]} points
 * @param {number[]} point
 * @param {number} distance
 * @returns
 */
function getClosestPoint(points, point, distance) {
    let dist = distance + 1;
    let i = -1;
    points.map((nextPoint, index) => {
        const d = getDistance(point, nextPoint);
        if (d !== 0 && d < dist) {
            i = index;
            dist = d;
        }
    });

    if (dist > distance || i === -1) return { closestPoint: null };

    return { closestPoint: points[i], index: i };
}

/**
 * Calculates the distance between to coordinates
 * @param {number[]} point1
 * @param {number[]} point2
 * @returns
 */
function getDistance(point1, point2) {
    const xDif = Math.pow(point2[0] - point1[0], 2);
    const yDif = Math.pow(point2[1] - point1[1], 2);
    const d = Math.pow(xDif + yDif, 0.5);
    return d;
}

/**
 *
 * @param {canvas.context} ctx
 * @param {string} hexColor
 * @param {number} borderWidth
 */
const drawBorder = (ctx, hexColor, borderWidth) => {
    const points = [];

    const width = ctx.canvas.width + 150,
        height = ctx.canvas.height + 150;

    const imageData = ctx.getImageData(0, 0, width, height);
    const length = imageData.data.length;

    const usePoint = (position, row, col) => {
        if (imageData.data[position + 3] <= 1) {
            points.push([col, row]);
        }
    };

    let row = -1;
    for (let i = 0; i < length; i += 4) {
        if (!(i % (width * 4))) {
            row++;
        }
        const col = (i - row * width * 4) / 4;

        const top = i - width * 4;
        const bottom = i + width * 4;
        const left = i - 4;
        const right = i + 4;
        const topLeftCorner = i - width * 4 - 4;
        const topRightCorner = i - width * 4 + 4;
        const bottomLeftCorner = i + width * 4 - 4;
        const bottomRightCorner = i + width * 4 + 4;

        let isNoneTransparent = imageData.data[i + 3] > 0;
        if (
            !isNoneTransparent ||
            i % (width * 4) === 0 ||
            i + width * 4 >= length
        ) {
            continue;
        }

        // Use left, top, right and bottom neighbors if they are transparent
        usePoint(left, row, col);
        usePoint(top, row, col);
        usePoint(right, row, col);
        usePoint(bottom, row, col);

        // Use corner neighbors if they are transparent
        usePoint(topLeftCorner, row, col);
        usePoint(topRightCorner, row, col);
        usePoint(bottomLeftCorner, row, col);
        usePoint(bottomRightCorner, row, col);
    }

    const shapes = constructShapes(points);

    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = hexColor;
    shapes.map((shape) => {
        ctx.beginPath();
        ctx.moveTo(...shape[0]);
        shape.map((point, index) => {
            if (index > 1) {
                // Smooth lines
                ctx.lineCap = "round";
                ctx.lineJoin = "round";

                // If it's further than 2 pixels then move to the next point
                if (getDistance(shape[index - 1], point) > 2) {
                    ctx.moveTo(...point);
                } else {
                    const prevPoint = shape[index - 1];
                    const controlPointX = (prevPoint[0] + point[0]) / 2;
                    const controlPointY = (prevPoint[1] + point[1]) / 2;

                    ctx.quadraticCurveTo(
                        ...shape[index - 1],
                        controlPointX,
                        controlPointY
                    );
                }
            }
        });
        ctx.stroke();
    });
};

export default drawBorder;
