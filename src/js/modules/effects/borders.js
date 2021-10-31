import app from "./../../app.js";
import config from "./../../config.js";
import Base_layers_class from "./../../core/base-layers.js";
import Dialog_class from "./../../libs/popup.js";
import alertify from "./../../../../node_modules/alertifyjs/build/alertify.min.js";
import Effects_browser_class from "./browser";
import drawBorder from "../../libs/image-border-effect.js";

class Effects_borders_class {
    constructor() {
        this.POP = new Dialog_class();
        this.Base_layers = new Base_layers_class();
        this.Effects_browser = new Effects_browser_class();
    }

    borders(filter_id) {
        if (config.layer.type == null) {
            alertify.error("Layer is empty.");
            return;
        }

        var _this = this;
        var filter = this.Base_layers.find_filter_by_id(filter_id, "borders");

        var settings = {
            title: "Borders",
            params: [
                {
                    name: "color",
                    title: "Color:",
                    value: (filter.color ??= config.COLOR),
                    type: "color",
                },
                { name: "size", title: "Size:", value: (filter.size ??= 10) },
            ],
            on_finish: function (params) {
                var target = Math.min(config.WIDTH, config.HEIGHT);
                _this.add_borders(params, filter_id);
            },
        };
        var rotate = config.layer.rotate;
        config.layer.rotate = 0;
        this.Base_layers.disable_filter(filter_id);
        this.POP.show(settings);
        config.layer.rotate = rotate;
        this.Base_layers.disable_filter(null);
    }

    demo(canvas_id, canvas_thumb) {
        var canvas = document.getElementById(canvas_id);
        var ctx = canvas.getContext("2d");
        //draw
        ctx.drawImage(
            canvas_thumb,
            5,
            5,
            this.Effects_browser.preview_width - 10,
            this.Effects_browser.preview_height - 10
        );

        //add borders
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.stroke();
    }

    render_pre(ctx, data) {}

    render_post(ctx, data, layer) {
        const size = Math.max(0, data.params.size);
        const x = layer.x;
        const y = layer.y;
        const width = parseInt(layer.width);
        const height = parseInt(layer.height);

        //legacy check
        if (x == null) x = 0;
        if (y == null) y = 0;
        if (!width) width = config.WIDTH;
        if (!height) height = config.HEIGHT;

        ctx.save();

        // We need to get aspect ratio for preview canvas and for the main canvas when it gets zoom < 1
        const aspectRatio = ctx.canvas.height / config.HEIGHT;

        let borderWidth = size * aspectRatio;
        // This is the case when it's zoomed more than the canvas size
        if (aspectRatio >= 1 && aspectRatio <= config.ZOOM) {
            borderWidth = size * config.ZOOM;
        }
        // Draw border multiple times to get the necessary with in pixels
        for (let i = 0; i < borderWidth; i++) {
            ctx.putImageData(drawBorder(ctx, data.params.color), 0, 0);
        }

        ctx.restore();
    }

    add_borders(params, filter_id) {
        //apply effect
        return app.State.do_action(
            new app.Actions.Add_layer_filter_action(
                config.layer.id,
                "borders",
                params,
                filter_id
            )
        );
    }
}

export default Effects_borders_class;
