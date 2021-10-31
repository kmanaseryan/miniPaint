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

const drawBorder = (ctx, hexColor) => {
    const width = ctx.canvas.width,
        height = ctx.canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);

    const dataCopy = new Uint8ClampedArray(imageData.data);
    const length = imageData.data.length;

    const changeColor = (position) => {
        if (imageData.data[position + 3] === 0) {
            dataCopy.set([...hexToRgb(hexColor), 255], position);
        }
    };

    for (let i = 0; i < length; i += 4) {
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

        // Change left, top, right and bottom neighbors colors if they are transparent
        changeColor(left);
        changeColor(top);
        changeColor(right);
        changeColor(bottom);

        // Changes corner neighbors colors if they are transparent
        changeColor(topLeftCorner);
        changeColor(topRightCorner);
        changeColor(bottomLeftCorner);
        changeColor(bottomRightCorner);
    }

    imageData.data.set(dataCopy);

    return imageData;
};

export default drawBorder;
