MG.globals = {};
MG.deprecations = {
  rollover_callback: { replacement: 'mouseover', version: '2.0' },
  rollout_callback: { replacement: 'mouseout', version: '2.0' },
  x_rollover_format: { replacement: 'x_mouseover', version: '2.10' },
  y_rollover_format: { replacement: 'y_mouseover', version: '2.10' },
  show_years: { replacement: 'show_secondary_x_label', version: '2.1' },
  xax_start_at_min: { replacement: 'axes_not_compact', version: '2.7' },
  interpolate_tension: { replacement: 'interpolate', version: '2.10' }
};
MG.globals.link = false;
MG.globals.version = "1.1";

MG.options = { // <name>: [<defaultValue>, <availableType>]
  x_axis_type: [null, ['categorical']], // TO BE INTRODUCED IN 2.10
  y_axis_type: [null, ['categorical']], // TO BE INTRODUCED IN 2.10
  y_padding_percentage: [0.05, 'number'],                 // for categorical scales
  y_outer_padding_percentage: [0.1, 'number'],            // for categorical scales
  ygroup_padding_percentage: [0.25, 'number'],            // for categorical scales
  ygroup_outer_padding_percentage: [0, 'number'],         // for categorical scales
  x_padding_percentage: [0.05, 'number'],                 // for categorical scales
  x_outer_padding_percentage: [0.1, 'number'],            // for categorical scales
  xgroup_padding_percentage: [0.25, 'number'],            // for categorical scales
  xgroup_outer_padding_percentage: [0, 'number'],         // for categorical scales
  ygroup_accessor: [null, 'string'],
  xgroup_accessor: [null, 'string'],
  y_categorical_show_guides: [false, 'boolean'],
  x_categorical_show_guide: [false, 'boolean'],
  rotate_x_labels: [0, 'number'],
  rotate_y_labels: [0, 'number'],
  scales: [{}],
  scalefns: [{}],
  // Data
  data: [[], ['object[]', 'number[]']], // the data object
  missing_is_zero: [false, 'boolean'], // assume missing observations are zero
  missing_is_hidden: [false, 'boolean'], // show missing observations as missing line segments
  missing_is_hidden_accessor: [null, 'string'], // the accessor for identifying observations as missing
  utc_time: [false, 'boolean'], // determines whether to use a UTC or local time scale
  x_accessor: ['date', 'string'], // the data element that's the x-accessor
  x_sort: [true, 'boolean'], // determines whether to sort the x-axis' values
  y_accessor: ['value', ['string', 'string[]']], // the data element that's the y-accessor
  // Axes
  axes_not_compact: [true, 'boolean'], // determines whether to draw compact or non-compact axes
  european_clock: [false, 'boolean'], // determines whether to show labels using a 24-hour clock
  inflator: [10/9, 'number'], // a multiplier for inflating max_x and max_y
  max_x: [null, ['number', Date]], // the maximum x-value
  max_y: [null, ['number', Date]], // the maximum y-value
  min_x: [null, ['number', Date]], // the minimum x-value
  min_y: [null, ['number', Date]], // the minimum y-value
  min_y_from_data: [false, 'boolean'], // starts y-axis at data's minimum value
  show_year_markers: [false, 'boolean'], // determines whether to show year markers along the x-axis
  show_secondary_x_label: [true, 'boolean'], // determines whether to show years along the x-axis
  small_text: [false, 'boolean'],
  x_extended_ticks: [false, 'boolean'], // determines whether to extend the x-axis ticks across the chart
  x_axis: [true, 'boolean'], // determines whether to display the x-axis
  x_label: ['', 'string'], // the label to show below the x-axis
  xax_count: [6, 'number'], // the number of x-axis ticks
  xax_format: [null, 'function'], // a function that formats the x-axis' labels
  xax_tick_length: [5, 'number'], // the x-axis' tick length in pixels
  xax_units: ['', 'string'], // a prefix symbol to be shown alongside the x-axis' labels
  x_scale_type: ['linear', 'log'], // the x-axis scale type
  y_axis: [true, 'boolean'], // determines whether to display the y-axis
  x_axis_position: ['bottom'], // string
  y_axis_position: ['left'], // string
  y_extended_ticks: [false, 'boolean'], // determines whether to extend the y-axis ticks across the chart
  y_label: ['', 'string'], // the label to show beside the y-axis
  y_scale_type: ['linear', ['linear', 'log']], // the y-axis scale type
  yax_count: [3, 'number'], // the number of y-axis ticks
  yax_format: [null, 'function'], // a function that formats the y-axis' labels
  yax_tick_length: [5, 'number'], // the y-axis' tick length in pixels
  yax_units: ['', 'string'], // a prefix symbol to be shown alongside the y-axis' labels
  yax_units_append: [false, 'boolean'], // determines whether to append rather than prepend units
  // GraphicOptions
  aggregate_rollover: [false, 'boolean'], // links the lines in a multi-line graphic
  animate_on_load: [false, 'boolean'], // determines whether lines are transitioned on first-load
  area: [true, ['boolean', 'array']], // determines whether to fill the area below the line
  flip_area_under_y_value: [null, 'number'], // Specify a Y baseline number value to flip area under it
  baselines: [null, 'object[]'], // horizontal lines that indicate, say, goals.
  chart_type: ['line', ['line', 'histogram', 'point', 'bar', 'missing-data']], // '{line, histogram, point, bar, missing-data}'],
  color: [null, ['string', 'string[]']],
  colors: [null, ['string', 'string[]']],
  custom_line_color_map: [[], 'number[]'], // maps an arbitrary set of lines to colors
  decimals: [2, 'number'], // the number of decimals to show in a rollover
  error: ['', 'string'], // does the graphic have an error that we want to communicate to users
  format: ['count', ['count', 'percentage']], // the format of the data object (count or percentage)
  full_height: [false, 'boolean'], // sets height to that of the parent, adjusts dimensions on window resize
  full_width: [false, 'boolean'], // sets width to that of the parent, adjusts dimensions on window resize
  interpolate: [d3.curveCatmullRom.alpha(0), [d3.curveBasisClosed, d3.curveBasisOpen, d3.curveBasis, d3.curveBundle, d3.curveCardinalClosed, d3.curveCardinalOpen, d3.curveCardinal, d3.curveCatmullRomClosed, d3.curveCatmullRomOpen, d3.curveLinearClosed, d3.curveLinear, d3.curveMonotoneX, d3.curveMonotoneY, d3.curveNatural, d3.curveStep, d3.curveStepAfter, d3.curveStepBefore]], // the interpolation function to use for rendering lines
  legend: ['', 'string[]'], // an array of literals used to label lines
  legend_target: ['', 'string'], // the DOM element to insert the legend in
  linked: [false, 'boolean'], // used to link multiple graphics together
  linked_format: ['%Y-%m-%d', 'string'], // specifies the format of linked rollovers
  list: [false, 'boolean'], // automatically maps the data to x and y accessors
  markers: [null, 'object[]'], // vertical lines that indicate, say, milestones
  max_data_size: [null, 'number'], // for use with custom_line_color_map
  missing_text: [null, 'string'], // The text to display for missing graphics
  show_missing_background: [true, 'boolean'], // Displays a background for missing graphics
  mousemove_align: ['right', 'string'], // implemented in point.js
  x_mouseover: [null, ['string', 'function']],
  y_mouseover: [null, ['string', 'function']],
  mouseover: [null, 'function'], // custom rollover function
  mousemove: [null, 'function'], // custom rollover function
  mouseout: [null, 'function'], // custom rollover function
  click: [null, 'function'],
  point_size: [2.5, 'number'], // the radius of the dots in the scatterplot
  active_point_on_lines: [false, 'boolean'], // if set, active dot on lines will be displayed.
  active_point_accessor: ['active', 'string'], // data accessor value to determine if a point is active or not
  active_point_size: [2, 'number'], // the size of the dot that appears on a line when
  points_always_visible: [false, 'boolean'], //  whether to always display data points and not just on hover
  rollover_time_format: [null, 'string'], // custom time format for rollovers
  show_confidence_band: [null, 'string[]'], // determines whether to show a confidence band
  show_rollover_text: [true, 'boolean'], // determines whether to show text for a data point on rollover
  show_tooltips: [true, 'boolean'], // determines whether to display descriptions in tooltips
  showActivePoint: [true, 'boolean'], // If enabled show active data point information in chart
  target: ['#viz', ['string', HTMLElement]], // the DOM element to insert the graphic in
  transition_on_update: [true, 'boolean'], // gracefully transitions the lines on data change
  x_rug: [false, 'boolean'], // show a rug plot along the x-axis
  y_rug: [false, 'boolean'], // show a rug plot along the y-axis
  mouseover_align: ['right', ['right', 'left']],
  brush: [null, ['xy','x','y']], // add brush function
  brushing_selection_changed: [null, 'function'], // callback function on brushing. the first parameter are the arguments that correspond to this chart, the second parameter is the range of the selection
  zoom_target: [null, 'object'], // the zooming target of brushing function
  click_to_zoom_out: [true, 'boolean'], // if true and the graph is currently zoomed in, clicking on the graph will zoom out
  // Layout
  buffer: [8, 'number'], // the padding around the graphic
  bottom: [45, 'number'], // the size of the bottom margin
  center_title_full_width: [false, 'boolean'], // center title over entire graph
  height: [220, 'number'], // the graphic's height
  left: [50, 'number'], // the size of the left margin
  right: [10, 'number'], // the size of the right margin
  small_height_threshold: [120, 'number'], // maximum height for a small graphic
  small_width_threshold: [160, 'number'], // maximum width for a small graphic
  top: [65, 'number'], // the size of the top margin
  width: [350, 'number'], // the graphic's width
  title_y_position: [10, 'number'], // how many pixels from the top edge (0) should we show the title at
  title: [null, 'string'],
  description: [null, 'string']
};

MG.charts = {};

MG.defaults = options_to_defaults(MG.options);

MG.data_graphic = function(args) {
  'use strict';

  MG.call_hook('global.defaults', MG.defaults);

  if (!args) { args = {}; }

  for (let key in args) {
    if (!mg_validate_option(key, args[key])) {
      if (!(key in MG.options)) {
        console.warn(`Option ${key} not recognized`);
      } else {
        console.warn(`Option ${key} expected type ${MG.options[key][1]} but got ${args[key]} instead`);
      }
    }
  }

  var selected_chart = MG.charts[args.chart_type || MG.defaults.chart_type];
  merge_with_defaults(args, selected_chart.defaults, MG.defaults);

  if (args.list) {
    args.x_accessor = 0;
    args.y_accessor = 1;
  }

  // check if buffer value is less than default value
  if (args.buffer < 8) { args.buffer = 8; }

  // check for deprecated parameters
  for (var key in MG.deprecations) {
    if (args.hasOwnProperty(key)) {
      var deprecation = MG.deprecations[key],
        message = 'Use of `args.' + key + '` has been deprecated',
        replacement = deprecation.replacement,
        version;

      // transparently alias the deprecated
      if (replacement) {
        if (args[replacement]) {
          message += '. The replacement - `args.' + replacement + '` - has already been defined. This definition will be discarded.';
        } else {
          args[replacement] = args[key];
        }
      }

      if (deprecation.warned) {
        continue;
      }

      deprecation.warned = true;

      if (replacement) {
        message += ' in favor of `args.' + replacement + '`';
      }

      warn_deprecation(message, deprecation.version);
    }
  }

  MG.call_hook('global.before_init', args);

  new selected_chart.descriptor(args);

  return args.data;
};
