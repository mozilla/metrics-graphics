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

MG.charts = {};

MG.data_graphic = function(args) {
  'use strict';
  var defaults = {
    missing_is_zero: false,                     // if true, missing values will be treated as zeros
    missing_is_hidden: false,                   // if true, missing values will appear as broken segments
    missing_is_hidden_accessor: null,           // the accessor that determines the boolean value for missing data points
    legend: '' ,                                // an array identifying the labels for a chart's lines
    legend_target: '',                          // if set, the specified element is populated with a legend
    error: '',                                  // if set, a graph will show an error icon and log the error to the console
    animate_on_load: false,                     // animate lines on load
    top: 65,                                    // the size of the top margin
    title_y_position: 10,                       // how many pixels from the top edge (0) should we show the title at
    center_title_full_width: false,             // center the title over the full graph (i.e. ignore left and right margins)
    bottom: 45,                                 // the size of the bottom margin
    right: 10,                                  // size of the right margin
    left: 50,                                   // size of the left margin
    buffer: 8,                                  // the buffer between the actual chart area and the margins
    width: 350,                                 // the width of the entire graphic
    height: 220,                                // the height of the entire graphic
    full_width: false,                          // sets the graphic width to be the width of the parent element and resizes dynamically
    full_height: false,                         // sets the graphic width to be the width of the parent element and resizes dynamically
    small_height_threshold: 120,                // the height threshold for when smaller text appears
    small_width_threshold: 160,                 // the width  threshold for when smaller text appears
    xax_count: 6,                               // number of x axis ticks
    xax_tick_length: 5,                         // x axis tick length
    axes_not_compact: true,
    yax_count: 3,                               // number of y axis ticks
    yax_tick_length: 5,                         // y axis tick length
    x_extended_ticks: false,                    // extends x axis ticks across chart - useful for tall charts
    y_extended_ticks: false,                    // extends y axis ticks across chart - useful for long charts
    y_scale_type: 'linear',
    max_x: null,
    max_y: null,
    min_x: null,
    min_y: null,                                // if set, y axis starts at an arbitrary value
    min_y_from_data: false,                     // if set, y axis will start at minimum value rather than at 0
    point_size: 2.5,                            // the size of the dot that appears on a line on mouse-over
    x_accessor: 'date',
    xax_units: '',
    x_label: '',
    x_sort: true,
    x_axis: true,
    y_axis: true,
    x_axis_position: 'bottom',
    y_axis_position: 'left',
    x_axis_type: null,                          // TO BE INTRODUCED IN 2.10
    y_axis_type: null,                          // TO BE INTRODUCED IN 2.10
    ygroup_accessor: null,
    xgroup_accessor:null,
    y_padding_percentage: 0.05,                 // for categorical scales
    y_outer_padding_percentage: .1,             // for categorical scales
    ygroup_padding_percentage:.25,              // for categorical scales
    ygroup_outer_padding_percentage: 0,         // for categorical scales
    x_padding_percentage: 0.05,                 // for categorical scales
    x_outer_padding_percentage: .1,             // for categorical scales
    xgroup_padding_percentage:.25,              // for categorical scales
    xgroup_outer_padding_percentage: 0,         // for categorical scales
    y_categorical_show_guides: false,
    x_categorical_show_guide: false,
    rotate_x_labels: 0,
    rotate_y_labels: 0,
    y_accessor: 'value',
    y_label: '',
    yax_units: '',
    yax_units_append: false,
    x_rug: false,
    y_rug: false,
    mouseover_align: 'right',                   // implemented in point.js
    x_mouseover: null,
    y_mouseover: null,
    transition_on_update: true,
    mouseover: null,
    click: null,
    show_rollover_text: true,
    show_confidence_band: null,                 // given [l, u] shows a confidence at each point from l to u
    xax_format: null,                           // xax_format is a function that formats the labels for the x axis.
    area: true,
    chart_type: 'line',
    data: [],
    decimals: 2,                                // the number of decimals in any rollover
    format: 'count',                            // format = {count, percentage}
    inflator: 10/9,                             // for setting y axis max
    linked: false,                              // links together all other graphs with linked:true, so rollovers in one trigger rollovers in the others
    linked_format: '%Y-%m-%d',                  // What granularity to link on for graphs. Default is at day
    list: false,
    baselines: null,                            // sets the baseline lines
    markers: null,                              // sets the marker lines
    scalefns: {},
    scales: {},
    utc_time: false,
    european_clock: false,
    show_year_markers: false,
    show_secondary_x_label: true,
    target: '#viz',
    interpolate: d3.curveCatmullRom.alpha(0),   // interpolation method to use when rendering lines; increase tension if your data is irregular and you notice artifacts
    custom_line_color_map: [],                  // allows arbitrary mapping of lines to colors, e.g. [2,3] will map line 1 to color 2 and line 2 to color 3
    colors: null,                               // UNIMPLEMENTED - allows direct color mapping to line colors. Will eventually require
    max_data_size: null,                        // explicitly specify the the max number of line series, for use with custom_line_color_map
    aggregate_rollover: false,                  // links the lines in a multi-line chart
    show_tooltips: true                         // if enabled, a chart's description will appear in a tooltip (requires jquery)
  };

  MG.call_hook('global.defaults', defaults);

  if (!args) { args = {}; }

  var selected_chart = MG.charts[args.chart_type || defaults.chart_type];
  // Keep the original area setting around so we can later determine if it was
  // supplied or if we used the default.
  args.original_area = args.area;
  merge_with_defaults(args, selected_chart.defaults, defaults);

  if (args.list) {
    args.x_accessor = 0;
    args.y_accessor = 1;
  }

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
