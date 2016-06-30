function processScaleTicks (args, axis) {
  var accessor = args[axis+'_accessor'];
  var scale_ticks = args.scales[axis.toUpperCase()].ticks(args[axis+'ax_count']) ;
  var max = args.processed['max_'+axis];

  function log10 (val) {
    if (val === 1000) {
      return 3;
    }
    if (val === 1000000) {
      return 7;
    }
    return Math.log(val) / Math.LN10;
  }

  if (args[axis+'_scale_type'] === 'log') {
    // get out only whole logs
    scale_ticks = scale_ticks.filter(function (d) {
      return Math.abs(log10(d)) % 1 < 1e-6 || Math.abs(log10(d)) % 1 > 1 - 1e-6;
    });
  }

  // filter out fraction ticks if our data is ints and if xmax > number of generated ticks
  var number_of_ticks = scale_ticks.length;

  // is our data object all ints?
  var data_is_int = true;
  args.data.forEach(function (d, i) {
    d.forEach(function (d, i) {
      if (d[accessor] % 1 !== 0) {
        data_is_int = false;
        return false;
      }
    });
  });

  if (data_is_int && number_of_ticks > max && args.format === 'count') {
    // remove non-integer ticks
    scale_ticks = scale_ticks.filter(function (d) {
      return d % 1 === 0;
    });
  }
  args.processed[axis+'_ticks'] = scale_ticks;
}

function rugPlacement (args, axisArgs) {
  var position = axisArgs.position;
  var ns = axisArgs.namespace;
  var coordinates = {};
  if (position === 'left') {
    coordinates.x1 = mg_get_left(args) + 1;
    coordinates.x2 = mg_get_left(args) + args.rug_buffer_size;
    coordinates.y1 = args.scalefns[ns +'f'];
    coordinates.y2 = args.scalefns[ns +'f'];
  } 
  if (position === 'right') {
    coordinates.x1 = mg_get_right(args)-1,
    coordinates.x2 = mg_get_right(args)-args.rug_buffer_size,
    coordinates.y1 = args.scalefns[ns +'f'];
    coordinates.y2 = args.scalefns[ns +'f'];
  } 
  if (position === 'top') {
    coordinates.x1 = args.scalefns[ns +'f'];
    coordinates.x2 = args.scalefns[ns +'f'];
    coordinates.y1 = mg_get_top(args)+1;
    coordinates.y2 = mg_get_top(args)+args.rug_buffer_size;
  } 
  if (position === 'bottom') {
    coordinates.x1 = args.scalefns[ns +'f'];
    coordinates.x2 = args.scalefns[ns +'f'];
    coordinates.y1 = mg_get_bottom(args)-1;
    coordinates.y2 = mg_get_bottom(args)-args.rug_buffer_size;
  }
  return coordinates;
}

function rimPlacement(args, axisArgs) {
  var ns = axisArgs.namespace;
  var position = axisArgs.position;
  var tick_length = args.processed[ns +'_ticks'].length;
  var ticks = args.processed[ns +'_ticks'];
  var scale = args.scales[ns.toUpperCase()];
  var coordinates = {};

  if (position === 'left') {
    coordinates.x1 = mg_get_left(args);
    coordinates.x2 = mg_get_left(args);
    coordinates.y1 = scale(ticks[0]).toFixed(2);
    coordinates.y2 = scale(ticks[tick_length - 1]).toFixed(2);
  }
  if (position === 'right') {
    coordinates.x1 = mg_get_right(args);
    coordinates.x2 = mg_get_right(args);
    coordinates.y1 = scale(ticks[0]).toFixed(2);
    coordinates.y2 = scale(ticks[tick_length - 1]).toFixed(2);
  }
  if (position === 'top') {
    coordinates.x1 = mg_get_left(args);
    coordinates.x2 = mg_get_right(args);
    coordinates.y1 = mg_get_top(args);
    coordinates.y2 = mg_get_top(args);
  }
  if (position === 'bottom') {
    coordinates.x1 = mg_get_left(args);
    coordinates.x2 = mg_get_right(args);
    coordinates.y1 = mg_get_bottom(args);
    coordinates.y2 = mg_get_bottom(args);
  }

  if (position === 'left' || position === 'right') {
    if (args.axes_not_compact && args.chart_type !== 'bar') {
      coordinates.y1 = mg_get_bottom(args);
      coordinates.y2 = mg_get_top(args);
    } else if (tick_length) {
      coordinates.y1 = scale(ticks[0]).toFixed(2);
      coordinates.y2 = scale(ticks[tick_length - 1]).toFixed(2);
    } else {
      coordinates.y1 = 0;
      coordinates.y2 = 0;
    }
  }

  return coordinates;
}

function labelPlacement(args, axisArgs) {
  var position = axisArgs.position;
  var ns = axisArgs.namespace;
  var tickLength = args[ns +'ax_tick_length'];
  var scale = args.scales[ns.toUpperCase()];
  var coordinates = {};

  if (position === 'left') {
    coordinates.x = mg_get_left(args) - tickLength * 3 / 2;
    coordinates.y = function(d){return scale(d).toFixed(2)}; 
    coordinates.dx = -3;
    coordinates.dy = '.35em';
    coordinates.textAnchor = 'end';
    coordinates.text = function(d){return mg_compute_yax_format(args)(d)};
  }
  if (position === 'right') {
    coordinates.x = mg_get_right(args) + tickLength * 3 / 2;
    coordinates.y = function(d){return scale(d).toFixed(2)}; 
    coordinates.dx = 3;
    coordinates.dy = '.35em';
    coordinates.textAnchor = 'start';
    coordinates.text = function(d){return mg_compute_yax_format(args)(d)};
  }
  if (position === 'top') {
    coordinates.x = function (d) { return scale(d).toFixed(2)};
    coordinates.y = (mg_get_top(args) - tickLength * 7 / 3).toFixed(2);
    coordinates.dx = 0;
    coordinates.dy = '0em';
    coordinates.textAnchor = 'middle';
    coordinates.text = function(d){return mg_default_xax_format(args)(d)};
  }
  if (position === 'bottom') {
    coordinates.x = function (d) { return scale(d).toFixed(2)};
    coordinates.y = (mg_get_bottom(args) + tickLength * 7 / 3).toFixed(2);
    coordinates.dx = 0;
    coordinates.dy = '.50em';
    coordinates.textAnchor = 'middle';
    coordinates.text = function(d){return mg_default_xax_format(args)(d)};
  }

  return coordinates;
}


function selectXaxFormat (args) {
  var c = args.chart_type;
  if (!args.processed.xax_format) {
    if (args.xax_format) {
      args.processed.xax_format = args.xax_format;
    } else {
      if (c === 'line' || c === 'point' || c === 'histogram') {
        args.processed.xax_format = mg_default_xax_format(args);
      } else if (c === 'bar') {
        args.processed.xax_format = mg_default_bar_xax_format(args);
      }
    }
  }
}

function secondaryLabels(g, args, axisArgs) {
  if (args.time_series && (args.show_years || args.show_secondary_x_label)) {
    var tf = mg_get_yformat_and_secondary_time_function(args);
    addSecondaryLabelElements(args, axisArgs, g, tf.timeframe, tf.yformat, tf.secondary);
  }
}

function addSecondaryLabelElements (args, axisArgs, g, time_frame, yformat, secondary_function) {
  var years = secondary_function(args.processed.min_x, args.processed.max_x);
  if (years.length === 0) {
    var first_tick = args.scales.X.ticks(args.xax_count)[0];
    years = [first_tick];
  }

  var yg = mg_add_g(g, 'mg-year-marker');
  if (time_frame === 'default' && args.show_year_markers) {
    yearMarkerLine(args, axisArgs, yg, years, yformat);
  }
  if (time_frame != 'years') yearMarkerText(args, axisArgs, yg, years, yformat);
}

function yearMarkerLine (args, axisArgs, g, years, yformat) {
  g.selectAll('.mg-year-marker')
    .data(years).enter()
    .append('line')
    .attr('x1', function (d) { return args.scales.X(d).toFixed(2); })
    .attr('x2', function (d) { return args.scales.X(d).toFixed(2); })
    .attr('y1', mg_get_top(args))
    .attr('y2', mg_get_bottom(args));
}

function yearMarkerText (args, axisArgs, g, years, yformat) {
  var position = axisArgs.position;
  var ns = axisArgs.namespace;
  var scale = args.scales[ns.toUpperCase()];
  var x, y, dy, textAnchor, textFcn;
  var xAxisTextElement = d3.select(args.target)
    .select('.mg-x-axis text').node().getBoundingClientRect();

  if (position === 'top') {
    x = function (d, i) {return scale(d).toFixed(2)};
    y = (mg_get_top(args) - args.xax_tick_length * 7 / 3) - (xAxisTextElement.height);
    dy = '.50em';
    textAnchor = 'middle'
    textFcn = function(d){return yformat(new Date(d))};
  }
  if (position === 'bottom') {
    x = function (d, i) {return scale(d).toFixed(2)};
    y = (mg_get_bottom(args) + args.xax_tick_length * 7 / 3) + (xAxisTextElement.height * 0.8);
    dy =  '.50em'
    textAnchor = 'middle';
    textFcn = function(d){return yformat(new Date(d))};
  }

  g.selectAll('.mg-year-marker')
    .data(years).enter()
    .append('text')
    .attr('x', x)
    .attr('y', y)
    .attr('dy', dy)
    .attr('text-anchor', textAnchor)
    .text(textFcn);
}

function addNumericalLabels (g, args, axisArgs) {
  var ns = axisArgs.namespace;
  var coords = labelPlacement(args, axisArgs);
  var ticks = args.processed[ns +'_ticks'];

  //var yax_format = mg_compute_yax_format(args);
  var labels = g.selectAll('.mg-yax-labels')
    .data(ticks).enter()
    .append('text')
    .attr('x', coords.x)
    .attr('dx',coords.dx)
    .attr('y', coords.y)
    .attr('dy', coords.dy)
    .attr('text-anchor', coords.textAnchor)
    .text(coords.text);
  // move the labels if they overlap.
  
  if (ns == 'x') {
    selectXaxFormat(args);
    if (args.time_series && args.european_clock) {

      labels.append('tspan').classed('mg-european-hours', true).text(function (_d, i) {
        var d = new Date(_d);
        if (i === 0) return d3.time.format('%H')(d);
        else return '';
      });
      labels.append('tspan').classed('mg-european-minutes-seconds', true).text(function (_d, i) {
        var d = new Date(_d);
        return ':' + args.processed.xax_format(d);
      });
    } else {
      labels.text(function (d) {
        return args.xax_units + args.processed.xax_format(d);
      });
    }
    secondaryLabels(g, args, axisArgs);
  }

  if (mg_elements_are_overlapping(labels)) {
    labels.filter(function(d,i) {
      return (i+1) % 2 === 0;
    }).remove();

    var svg = mg_get_svg_child_of(args.target);
    svg.selectAll('.mg-'+ns+'ax-ticks').filter(function(d,i){ return (i+1) % 2 === 0; })
      .remove();
  }

}

function addTickLines (g, args, axisArgs) {
  // name
  var ns = axisArgs.namespace;
  var position = axisArgs.position;
  var scale = args.scales[ns.toUpperCase()]

  var ticks = args.processed[ns+'_ticks'];
  var ticksClass = 'mg-'+ns+'ax-ticks';
  var extendedTicksClass = 'mg-extended-'+ns+'ax-ticks';
  var extendedTicks = args[ns +'_extended_ticks'];
  var tickLength = args[ns +'ax_tick_length'];

  var x1,x2,y1,y2;

  if (position === 'left') {
    x1 = mg_get_left(args);
    x2 = extendedTicks ? mg_get_right(args) : mg_get_left(args) - tickLength;
    y1 = function (d) { return scale(d).toFixed(2); }
    y2 = function (d) { return scale(d).toFixed(2); }
  }
  if (position === 'right') {
    x1 = mg_get_right(args);
    x2 = extendedTicks ? mg_get_left(args) : mg_get_right(args) + tickLength;
    y1 = function (d) { return scale(d).toFixed(2); }
    y2 = function (d) { return scale(d).toFixed(2); }
  }
  if (position === 'top') {
    x1 = function (d) { return scale(d).toFixed(2); }
    x2 = function (d) { return scale(d).toFixed(2); }
    y1 = mg_get_top(args);
    y2 = extendedTicks ? mg_get_bottom(args) : mg_get_top(args) - tickLength;
  }
  if (position === 'bottom') {
    x1 = function (d) { return scale(d).toFixed(2); }
    x2 = function (d) { return scale(d).toFixed(2); }
    y1 = mg_get_bottom(args);
    y2 = extendedTicks ? mg_get_top(args) : mg_get_bottom(args) + tickLength;
  }

  g.selectAll('.'+ticksClass)
    .data(ticks).enter()
    .append('line')
    .classed(extendedTicksClass, extendedTicks)
    .attr('x1', x1)
    .attr('x2', x2)
    .attr('y1', y1)
    .attr('y2', y2);
}

function initializeAxisRim (g, args, axisArgs) {
  var namespace = axisArgs.namespace;
  var tick_length = args.processed[namespace +'_ticks'].length;

  var rim = rimPlacement(args, axisArgs);

  if (!args[namespace+'_extended_ticks'] && !args[namespace+'_extended_ticks'] && tick_length) {
    g.append('line')
      .attr('x1', rim.x1)
      .attr('x2', rim.x2)
      .attr('y1', rim.y1)
      .attr('y2', rim.y2);
  }
}


function initializeRug(args, rug_class) {
  var svg = mg_get_svg_child_of(args.target);
  var all_data = mg_flatten_array(args.data);
  var rug = svg.selectAll('line.'+rug_class).data(all_data);

  //set the attributes that do not change after initialization, per
  rug.enter().append('svg:line').attr('class', rug_class).attr('opacity', 0.3);

  //remove rug elements that are no longer in use
  mg_exit_and_remove(rug);

  //set coordinates of new rug elements
  mg_exit_and_remove(rug);
  return rug;
}



function rug (args, axisArgs) {
  'use strict';
  args.rug_buffer_size = args.chart_type === 'point'
    ? args.buffer / 2
    : args.buffer * 2 / 3;

  var rug = initializeRug(args, 'mg-'+axisArgs.namespace+'-rug');
  var rug_positions = rugPlacement(args, axisArgs);
  rug.attr('x1', rug_positions.x1)
    .attr('x2', rug_positions.x2)
    .attr('y1', rug_positions.y1)
    .attr('y2', rug_positions.y2);

  mg_add_color_accessor_to_rug(rug, args, 'mg-'+axisArgs.namespace+'-rug-mono');
}


function categoricalLabelPlacement(args, axisArgs, group) {
  var ns = axisArgs.namespace;
  var position = axisArgs.position;
  var scale = args.scales[ns.toUpperCase()];
  var groupScale = args.scales[(ns+'group').toUpperCase()]
  var coords = {};
  coords.cat = {};
  coords.group = {};
  // x, y, dy, text-anchor

  if (position === 'left') {
    coords.cat.x = mg_get_plot_left(args) - args.buffer;
    coords.cat.y =  function(d) { return groupScale(group) + scale(d) + scale.rangeBand() / 2; }
    coords.cat.dy =  '.35em';
    coords.cat.textAnchor = args['rotate_'+ns+'_labels'] ? 'middle' : 'end';
    coords.group.x = mg_get_plot_left(args) - args.buffer;
    coords.group.y =  groupScale(group) + (groupScale.rangeBand ? groupScale.rangeBand()/2 + scale.rangeBand()/2: 0);
    coords.group.dy = '.35em';
    coords.group.textAnchor = args['rotate_'+ns+'_labels'] ? 'middle' : 'end';
  }

  if (position === 'right') {
    coords.cat.x = mg_get_plot_right(args)  - args.buffer;
    coords.cat.y =  function(d) { return groupScale(group) + scale(d) + scale.rangeBand() / 2; }
    coords.cat.dy =  '.35em';
    coords.cat.textAnchor = args['rotate_'+ns+'_labels'] ? 'middle' : 'start';
    coords.group.x = mg_get_plot_right(args)  - args.buffer;
    coords.group.y =  groupScale(group) + (groupScale.rangeBand ? groupScale.rangeBand()/2 : 0);
    coords.group.dy = '.35em';
    coords.group.textAnchor =  args['rotate_'+ns+'_labels'] ? 'middle' : 'start';
  }

  if (position === 'top') {
    coords.cat.x =  function(d) { return groupScale(group) + scale(d) + scale.rangeBand() / 2; }
    coords.cat.y = mg_get_plot_top(args)  + args.buffer;
    coords.cat.dy =  '.35em';
    coords.cat.textAnchor = args['rotate_'+ns+'_labels'] ? 'start' : 'middle';
    coords.group.x =  groupScale(group) + (groupScale.rangeBand ? groupScale.rangeBand()/2 : 0);
    coords.group.y = mg_get_plot_top(args)  + args.buffer;
    coords.group.dy = '.35em';
    coords.group.textAnchor = args['rotate_'+ns+'_labels'] ? 'start' : 'middle';
  }

  if (position === 'bottom') {
    coords.cat.x =  function(d) { return groupScale(group) + scale(d) + scale.rangeBand() / 2; }
    coords.cat.y = mg_get_plot_bottom(args)  + args.buffer;
    coords.cat.dy =  '.35em';
    coords.cat.textAnchor = args['rotate_'+ns+'_labels'] ? 'start' : 'middle';
    coords.group.x = groupScale(group) + (groupScale.rangeBand ? groupScale.rangeBand()/2  : 0);
    coords.group.y = mg_get_plot_bottom(args)  + args.buffer;
    coords.group.dy = '.35em';
    coords.group.textAnchor = args['rotate_'+ns+'_labels'] ? 'start' : 'middle';
  }

  return coords;
}

function categoricalLabels (args, axisArgs) {
  var ns = axisArgs.namespace;
  var nsClass = 'mg-'+ns+'-axis';
  var scale = args.scales[ns.toUpperCase()];
  var groupScale = args.scales[(ns+'group').toUpperCase()]
  var groupAccessor = ns +'group_accessor';
  
  var svg = mg_get_svg_child_of(args.target);
  mg_selectAll_and_remove(svg, '.' + nsClass);
  var g = mg_add_g(svg, nsClass);
  var group_g;
  var groups = groupScale.domain && groupScale.domain() ? groupScale.domain() : ['1'];
  groups.forEach(function(group){
    // grab group placement stuff.
    var coords = categoricalLabelPlacement(args, axisArgs, group);

    group_g = mg_add_g(g, 'mg-group-' + mg_normalize(group));
    if (args[groupAccessor] !== null) {
      var labels = group_g.append('svg:text')
        .classed('mg-barplot-group-label', true)
        .attr('x', coords.group.x)
        .attr('y', coords.group.y)
        .attr('dy', coords.group.dy)
        .attr('text-anchor', coords.group.textAnchor)
        .text(group);

    } else {
      var labels = group_g.selectAll('text').data(scale.domain()).enter().append('svg:text')
        .attr('x', coords.cat.x)
        .attr('y', coords.cat.y)
        .attr('dy', coords.cat.dy)
        .attr('text-anchor', coords.cat.textAnchor)
        .text(String);
    }
    if (args['rotate_'+ ns +'_labels']) {
      rotateLabels(labels, args['rotate_'+ ns +'_labels']);
    }

  });
}


function categoricalGuides (args, axisArgs) {
  // for each group
  // for each data point

  var ns = axisArgs.namespace;
  var scalef = args.scalefns[ns+'f'];
  var groupf = args.scalefns[ns+'groupf'];
  var groupScale = args.scales[(ns+'group').toUpperCase()];
  var scale = args.scales[ns.toUpperCase()];
  var position = axisArgs.position;

  var svg = mg_get_svg_child_of(args.target);
  var alreadyPlotted = [];

  var x1, x2, y1, y2;
  var grs = (groupScale.domain && groupScale.domain()) ? groupScale.domain() : [null];

  grs.forEach(function(group){
    scale.domain().forEach(function(cat) {

      if (position === 'left' || position === 'right') {
        x1 = mg_get_plot_left(args);
        x2 = mg_get_plot_right(args);
        y1 = scale(cat) + groupScale(group) + scale.rangeBand()/2 //* ( group === null);
        y2 = scale(cat) + groupScale(group) + scale.rangeBand()/2 //* ( group === null);
      }

      if (position === 'top' || position === 'bottom') {
        x1 = scale(cat) + groupScale(group) + scale.rangeBand()/2 * ( group === null);
        x2 = scale(cat) + groupScale(group) + scale.rangeBand()/2 * ( group === null);
        y1 = mg_get_plot_bottom(args);
        y2 = mg_get_plot_top(args);
      }

      svg.append('line')
        .attr('x1', x1)
        .attr('x2', x2)
        .attr('y1', y1)
        .attr('y2', y2)
        .attr('stroke-dasharray', '2,1')
        .attr('stroke', 'lightgray');
      });

      var first = groupScale(group) + scale.range()[0] + scale.rangeBand()/2 * (group === null || (position !== 'top' && position !='bottom'));
      var last  = groupScale(group) + scale.range()[scale.range().length-1] + scale.rangeBand()/2 * ( group === null || (position !== 'top' && position !='bottom'));

      if (position === 'left' || position === 'right') {
        x11 = mg_get_plot_left(args);
        x21 = mg_get_plot_left(args);
        y11 = first;
        y21 = last;

        x12 = mg_get_plot_right(args);
        x22 = mg_get_plot_right(args);
        y12 = first;
        y22 = last;
      }
      if (position === 'bottom' || position === 'top') {
        x11 = first;
        x21 = last;
        y11 = mg_get_plot_bottom(args);
        y21 = mg_get_plot_bottom(args);

        x12 = first;
        x22 = last;
        y12 = mg_get_plot_top(args);
        y22 = mg_get_plot_top(args);
      }
      
      svg.append('line')
        .attr('x1', x11)
        .attr('x2', x21)
        .attr('y1', y11)
        .attr('y2', y21)
        .attr('stroke-dasharray', '2,1')
        .attr('stroke', 'lightgray');
      svg.append('line')
        .attr('x1', x12)
        .attr('x2', x22)
        .attr('y1', y12)
        .attr('y2', y22)
        .attr('stroke-dasharray', '2,1')
        .attr('stroke', 'lightgray');

  })
}

//
function rotateLabels (labels, rotation_degree) {
  if (rotation_degree) {
    labels.attr({
      transform: function() {
        var elem = d3.select(this);
        return 'rotate('+rotation_degree+' '+elem.attr('x')+','+elem.attr('y')+')';
      }
    });
  }
}

function zeroLine(args, axisArgs) {
  var svg = mg_get_svg_child_of(args.target);
  var ns = axisArgs.namespace;
  var position = axisArgs.position;
  var scale = args.scales[ns.toUpperCase()];
  var x1, x2, y1, y2;
  if (position === 'left' || position === 'right') {
    x1 = mg_get_plot_left(args);
    x2 = mg_get_plot_right(args);
    y1 = scale(0)+1;
    y2 = scale(0)+1;
  }
  if (position === 'bottom' || position === 'top') {
    y1 = mg_get_plot_top(args);
    y2 = mg_get_plot_bottom(args);
    x1 = scale(0)-1;
    x2 = scale(0)-1; 
  }

  svg.append('line')
    .attr('x1', x1)
    .attr('x2', x2)
    .attr('y1', y1)
    .attr('y2', y2)
    .attr('stroke', 'black')
}

var mgDrawAxis = {};

mgDrawAxis.categorical = function(args, axisArgs) {
  var ns = axisArgs.namespace;
  //mg_add_categorical_labels(args, axisArgs);
  categoricalLabels(args, axisArgs);
  categoricalGuides(args, axisArgs);

  //if (args.show_bar_zero) mg_bar_add_zero_line(args, axisArgs);
  // if (args[ns+'group_accessor']) groupLines(args, axisArgs);
  
  //if (args[ns+'_categorical_show_guides']) mg_y_categorical_show_guides(args, axisArgs);
}

mgDrawAxis.numerical = function(args, axisArgs) {
  var namespace = axisArgs.namespace;
  var axisName = namespace +'_axis';
  var axisClass = 'mg-' + namespace + '-axis';
  var svg = mg_get_svg_child_of(args.target);

  //MG.call_hook(axisName + '.process_min_max', args, args.processed['min_'+namespace], args.processed['max_'+namespace]);

  mg_selectAll_and_remove(svg, '.'+axisClass);

  if (!args[axisName]) { return this; }

  var g = mg_add_g(svg, axisClass);
  // mg_add_label(g, args);
  processScaleTicks(args, namespace);
  initializeAxisRim(g, args, axisArgs);
  addTickLines(g, args, axisArgs);
  addNumericalLabels(g, args, axisArgs)

  if (args[namespace+'_rug']) { 
    rug(args, axisArgs); 
  }

  if (args.show_bar_zero) mg_bar_add_zero_line(args);
  //if (axisArgs.zeroLine) zeroLine(args, axisArgs);

  return this;
}


function axisFactory(args) {
  var axisArgs = {};
  axisArgs.type = 'numerical';

  this.namespace = function(ns) {
    // take the ns in the scale, and use it to 
    axisArgs.namespace = ns;
    return this;
  }

  this.rug = function(tf) {
    axisArgs.rug = tf;
    return this;
  }

  this.type = function(t) {
    axisArgs.type = t;
    return this;
  }

  this.position = function(pos) {
    axisArgs.position = pos;
    return this;
  }

  this.zeroLine = function(tf) {
    axisArgs.zeroLine = tf;
    return this;
  }

  this.draw = function() {
    // ok. Here are all the steps.
    mgDrawAxis[axisArgs.type](args, axisArgs);
    return this;
  }

  return this;

}

MG.axis_factory = axisFactory;

/* ================================================================================ */
/* ================================================================================ */
/* ================================================================================ */


function y_rug (args) {
  'use strict';
  args.rug_buffer_size = args.chart_type === 'point'
    ? args.buffer / 2
    : args.buffer * 2 / 3;

  var rug = mg_make_rug(args, 'mg-y-rug');

  rug.attr('x1', args.left + 1)
    .attr('x2', args.left + args.rug_buffer_size)
    .attr('y1', args.scalefns.yf)
    .attr('y2', args.scalefns.yf);

  mg_add_color_accessor_to_rug(rug, args, 'mg-y-rug-mono');
}

MG.y_rug = y_rug;

function mg_change_y_extents_for_bars (args, my) {
  if (args.chart_type === 'bar') {
    my.min = 0;
    my.max = d3.max(args.data[0], function (d) {
      var trio = [];
      trio.push(d[args.y_accessor]);

      if (args.baseline_accessor !== null) {
        trio.push(d[args.baseline_accessor]);
      }

      if (args.predictor_accessor !== null) {
        trio.push(d[args.predictor_accessor]);
      }

      return Math.max.apply(null, trio);
    });
  }
  return my;
}

function mg_compute_yax_format (args) {
  var yax_format = args.yax_format;
  if (!yax_format) {
    if (args.format === 'count') {
      // increase decimals if we have small values, useful for realtime data
      if (args.processed.max_y < 0.0001) {
        args.decimals = 6;
      } else if (args.processed.max_y < 0.1) {
        args.decimals = 4;
      }

      yax_format = function (f) {
        if (f < 1.0) {
          // Don't scale tiny values.
          return args.yax_units + d3.round(f, args.decimals);
        } else {
          var pf = d3.formatPrefix(f);
          return args.yax_units + pf.scale(f) + pf.symbol;
        }
      };
    } else { // percentage
      yax_format = function (d_) {
        var n = d3.format('.2p');
        return n(d_);
      };
    }
  }
  return yax_format;
}

function mg_bar_add_zero_line (args) {
  var svg = mg_get_svg_child_of(args.target);
  var extents = args.scales.X.domain();
  if (0 >= extents[0] && extents[1] >= 0) {
    var r = args.scales.Y.range();
    var g = args.categorical_groups.length ? 
      args.scales.YGROUP(args.categorical_groups[args.categorical_groups.length-1]) : args.scales.YGROUP();
    svg.append('svg:line')
    .attr('x1', args.scales.X(0))
    .attr('x2', args.scales.X(0))
    .attr('y1', r[0] + mg_get_plot_top(args))
    .attr('y2', r[r.length-1] + g )//+ args.scales.YGROUP.rangeBand())
    .attr('stroke', 'black')
    .attr('opacity', .2);
  }
}

function set_min_max_y (args) {
  // flatten data
  // remove weird data, if log.
  var data = mg_flatten_array(args.data);

  if (args.y_scale_type === 'log') {
    data = data.filter(function (d) {
      return d[args.y_accessor] > 0;
    });
  }

  if (args.baselines) {
    data = data.concat(args.baselines);
  }

  var extents = d3.extent(data, function (d) {
    return d[args.y_accessor];
  });

  var my = {};
  my.min = extents[0];
  my.max = (args.max_y_floor === null) ? extents[1] : Math.max(extents[1], args.max_y_floor);
  // the default case is for the y-axis to start at 0, unless we explicitly want it
  // to start at an arbitrary number or from the data's minimum value
  if (my.min >= 0 && !args.min_y && !args.min_y_from_data) {
    my.min = 0;
  }

  mg_change_y_extents_for_bars(args, my);
  my.min = (args.min_y !== null)
    ? args.min_y
    : my.min;

  my.max = (args.max_y !== null)
    ? args.max_y
    : (my.max < 0)
      ? my.max + (my.max - my.max * args.inflator)
      : my.max * args.inflator;

  if (args.y_scale_type !== 'log' && my.min < 0) {
    my.min = my.min - (my.min - my.min * args.inflator);
  }

  if (!args.min_y && args.min_y_from_data) {

      var buff = (my.max - my.min) *.01;
      my.min = extents[0] - buff;
      my.max = extents[1] + buff;
  }
  args.processed.min_y = my.min;
  args.processed.max_y = my.max;
}

function mg_y_domain_range (args, scale) {
  scale.domain([args.processed.min_y, args.processed.max_y])
    .range([mg_get_plot_bottom(args), args.top]);
  return scale;
}

function mg_define_y_scales (args) {
  var scale = args.y_scale_type === 'log' ? d3.scale.log() : d3.scale.linear();
  if (args.y_scale_type === 'log') {
    if (args.chart_type === 'histogram') {
      // log histogram plots should start just below 1
      // so that bins with single counts are visible
      args.processed.min_y = 0.2;
    } else {
      if (args.processed.min_y <= 0) {
        args.processed.min_y = 1;
      }
    }
  }
  args.scales.Y = mg_y_domain_range(args, scale);
  args.scales.Y.clamp(args.y_scale_type === 'log');

  // used for ticks and such, and designed to be paired with log or linear
  args.scales.Y_axis = mg_y_domain_range(args, d3.scale.linear());
}

function mg_add_y_label (g, args) {
  if (args.y_label) {
    g.append('text')
      .attr('class', 'label')
      .attr('x', function () {
        return -1 * (mg_get_plot_top(args) +
        ((mg_get_plot_bottom(args)) - (mg_get_plot_top(args))) / 2);
      })
      .attr('y', function () {
        return args.left / 2;
      })
      .attr('dy', '0.4em')
      .attr('text-anchor', 'middle')
      .text(function (d) {
        return args.y_label;
      })
      .attr('transform', function (d) {
        return 'rotate(-90)';
      });
  }
}

function mg_add_y_axis_rim (g, args) {
  var tick_length = args.processed.y_ticks.length;
  if (!args.x_extended_ticks && !args.y_extended_ticks && tick_length) {
    var y1scale, y2scale;

    if (args.axes_not_compact && args.chart_type !== 'bar') {
      y1scale = args.height - args.bottom;
      y2scale = args.top;
    } else if (tick_length) {
      y1scale = args.scales.Y(args.processed.y_ticks[0]).toFixed(2);
      y2scale = args.scales.Y(args.processed.y_ticks[tick_length - 1]).toFixed(2);
    } else {
      y1scale = 0;
      y2scale = 0;
    }

    g.append('line')
      .attr('x1', args.left)
      .attr('x2', args.left)
      .attr('y1', y1scale)
      .attr('y2', y2scale);
  }
}

function mg_add_y_axis_tick_lines (g, args) {
  g.selectAll('.mg-yax-ticks')
    .data(args.processed.y_ticks).enter()
    .append('line')
    .classed('mg-extended-y-ticks', args.y_extended_ticks)
    .attr('x1', args.left)
    .attr('x2', function () {
      return (args.y_extended_ticks)
        ? args.width - args.right
        : args.left - args.yax_tick_length;
    })
    .attr('y1', function (d) { return args.scales.Y(d).toFixed(2); })
    .attr('y2', function (d) { return args.scales.Y(d).toFixed(2); });
}

function mg_add_y_axis_tick_labels (g, args) {
  var yax_format = mg_compute_yax_format(args);
  g.selectAll('.mg-yax-labels')
    .data(args.processed.y_ticks).enter()
    .append('text')
    .attr('x', args.left - args.yax_tick_length * 3 / 2)
    .attr('dx', -3)
    .attr('y', function (d) {
      return args.scales.Y(d).toFixed(2);
    })
    .attr('dy', '.35em')
    .attr('text-anchor', 'end')
    .text(function (d) {
      var o = yax_format(d);
      return o;
    });
}

function y_axis (args) {
  if (!args.processed) {
    args.processed = {};
  }

  var svg = mg_get_svg_child_of(args.target);

  //set_min_max_y(args);
  MG.call_hook('y_axis.process_min_max', args, args.processed.min_y, args.processed.max_y);

  //mg_define_y_scales(args);
  //mg_add_scale_function(args, 'yf', 'Y', args.y_accessor);

  mg_selectAll_and_remove(svg, '.mg-y-axis');

  if (!args.y_axis) { return this; }

  var g = mg_add_g(svg, 'mg-y-axis');
  mg_add_y_label(g, args);
  mg_process_scale_ticks(args, 'y');
  mg_add_y_axis_rim(g, args);
  mg_add_y_axis_tick_lines(g,  args);
  mg_add_y_axis_tick_labels(g, args);

  if (args.y_rug) { y_rug(args); }

  return this;
}

MG.y_axis = y_axis;

function mg_add_categorical_labels (args) {
  var svg = mg_get_svg_child_of(args.target);
  mg_selectAll_and_remove(svg, '.mg-y-axis');
  var g = mg_add_g(svg, 'mg-y-axis');
  var group_g;
  (args.categorical_groups.length ? args.categorical_groups : ['1']).forEach(function(group){

    group_g = mg_add_g(g, 'mg-group-' + mg_normalize(group))

    if (args.ygroup_accessor !== null) {
      mg_add_group_label(group_g, group, args);
    }
    else {
      var labels = mg_add_graphic_labels(group_g, group, args);
      mg_rotate_labels(labels, args.rotate_y_labels);
    }
  });
}

function mg_add_graphic_labels (g, group, args) {
  return g.selectAll('text').data(args.scales.Y.domain()).enter().append('svg:text')
      .attr('x', args.left - args.buffer)
      .attr('y', function (d) {
        return args.scales.YGROUP(group) + args.scales.Y(d) + args.scales.Y.rangeBand() / 2;
      })
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .text(String);
}

function mg_add_group_label (g, group, args) {
    g.append('svg:text')
      .classed('mg-barplot-group-label', true)
      .attr('x', args.left - args.buffer)
      .attr('y', args.scales.YGROUP(group) + args.scales.YGROUP.rangeBand()/2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .text(group);
}

// function mg_draw_group_scaffold(args) {
//   if (args.ygroup_accessor !== null) {
//     var svg = mg_get_svg_child_of(args.target);
//     svg.selectAll('scaffold').data(args.scales.YGROUP.domain()).enter().append("rect")
//       .attr('x', mg_get_plot_left(args))
//       .attr('y', args.scales.YGROUP)
//       .attr('width', mg_get_plot_right(args) - mg_get_plot_left(args))
//       .attr('fill', 'black')
//       .attr('opacity', .3);
//   }
// }


function mg_draw_group_lines(args) {
  var svg = mg_get_svg_child_of(args.target);
  var groups = args.scales.YGROUP.domain();
  var first = groups[0];
  var last  = groups[groups.length-1];
  svg.selectAll('mg-group-lines').data(groups).enter().append('line')
    .attr('x1', mg_get_plot_left(args))
    .attr('x2', mg_get_plot_left(args))
    .attr('y1', function(d){
      return args.scales.YGROUP(d);
    })
    .attr('y2', function(d){
      return args.scales.YGROUP(d) + args.ygroup_height;
    })
    .attr('stroke-width', 1)
    .attr('stroke', 'lightgray')
}

function mg_y_categorical_show_guides(args) {
  // for each group
  // for each data point
  var svg = mg_get_svg_child_of(args.target);
  var alreadyPlotted = [];
  args.data[0].forEach(function(d){
    if (alreadyPlotted.indexOf(d[args.y_accessor]) === -1) {
      svg.append('line')
        .attr('x1', mg_get_plot_left(args))
        .attr('x2', mg_get_plot_right(args))
        .attr('y1', args.scalefns.yf(d) + args.scalefns.ygroupf(d))
        .attr('y2', args.scalefns.yf(d) + args.scalefns.ygroupf(d))
        .attr('stroke-dasharray', '2,1')
        .attr('stroke', 'lightgray');
    }
  })
}

function y_axis_categorical (args) {
  if (!args.y_axis) { return this; }
  mg_add_categorical_labels(args);
  //mg_draw_group_scaffold(args);
  if (args.show_bar_zero) mg_bar_add_zero_line(args);
  if (args.ygroup_accessor) mg_draw_group_lines(args);
  if (args.y_categorical_show_guides) mg_y_categorical_show_guides(args);
  return this;
}

MG.y_axis_categorical = y_axis_categorical;
