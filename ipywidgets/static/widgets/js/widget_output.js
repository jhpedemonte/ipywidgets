// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// This widget is strongly coupled to the notebook because of the outputarea
// dependency.
// TODO: Use jupyter-js-output-area to break the coupling to the notebook.
define([
    "./widget",
    "jquery",
    "notebook/js/outputarea",
    "underscore",
], function(widget, $, outputarea, _) {
    "use strict";

    var OutputModel = widget.DOMWidgetModel.extend({
        defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
            _model_name: "OutputModel",
            _view_name: "OutputView"
        }),
    });

    var OutputView = widget.DOMWidgetView.extend({
        initialize: function (parameters) {
            OutputView.__super__.initialize.apply(this, [parameters]);
            this.listenTo(this.model, 'msg:custom', this._handle_route_msg, this);
        },

        render: function(){
            this.output_area = new outputarea.OutputArea({
                selector: this.$el,
                prompt_area: false,
                events: this.model.widget_manager.notebook.events,
                keyboard_manager: this.model.widget_manager.keyboard_manager });

            // Make output area reactive.
            var that = this;
            this.output_area.element.on('changed', function() {
                that.model.set('contents', that.output_area.element.html());
            });
            this.listenTo(this.model, 'change:contents', function(){
                var html = this.model.get('contents');
                if (this.output_area.element.html() != html) {
                    this.output_area.element.html(html);
                }
            }, this);

            // Set initial contents.
            this.output_area.element.html(this.model.get('contents'));
        },

        /**
         * Handles re-routed iopub messages.
         */
        _handle_route_msg: function(msg) {
            if (msg) {
                var msg_type = msg.msg_type;
                if (msg_type=='clear_output') {
                    this.output_area.handle_clear_output(msg);
                } else {
                    this.output_area.handle_output(msg);
                }
            }
        },
    });

    return {
        OutputView: OutputView,
        OutputModel: OutputModel,
    };
});
