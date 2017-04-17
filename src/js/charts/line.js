(function() {
  'use strict';

  function mg_line_color_text(elem, d, args) {
    elem.classed('mg-hover-line' + d.line_id + '-color', args.colors === null)
      .attr('fill', args.colors === null ? '' : args.colors[d.line_id - 1]);
  }

  function mg_line_graph_generators(args, plot, svg) {
    mg_add_line_generator(args, plot);
    mg_add_area_generator(args, plot);
    mg_add_flat_line_generator(args, plot);
    mg_add_confidence_band_generator(args, plot, svg);
  }

  function mg_add_confidence_band_generator(args, plot, svg) {
    plot.existing_band = svg.selectAll('.mg-confidence-band').nodes();
    if (args.show_confidence_band) {
      plot.confidence_area = d3.area()
        .defined(plot.line.defined())
        .x(args.scalefns.xf)
        .y0(function(d) {
          var l = args.show_confidence_band[0];
          if (d[l] != undefined) {
            return args.scales.Y(d[l]);
          } else {
            return args.scales.Y(d[args.y_accessor]);
          }
        })
        .y1(function(d) {
          var u = args.show_confidence_band[1];
          if (d[u] != undefined) {
            return args.scales.Y(d[u]);
          } else {
            return args.scales.Y(d[args.y_accessor]);
          }
        })
        .curve(args.interpolate);
    }
  }

  function mg_add_area_generator(args, plot) {
    plot.area = d3.area()
      .defined(plot.line.defined())
      .x(args.scalefns.xf)
      .y0(args.scales.Y.range()[0])
      .y1(args.scalefns.yf)
      .curve(args.interpolate);
  }

  function mg_add_flat_line_generator(args, plot) {
    plot.flat_line = d3.line()
      .defined(function(d) {
        return (d['_missing'] === undefined || d['_missing'] !== true) && d[args.y_accessor] !== null;
      })
      .x(args.scalefns.xf)
      .y(function() {
        return args.scales.Y(plot.data_median); })
      .curve(args.interpolate);
  }

  function mg_add_line_generator(args, plot) {
    plot.line = d3.line()
      .x(args.scalefns.xf)
      .y(args.scalefns.yf)
      .curve(args.interpolate);

    // if missing_is_zero is not set, then hide data points that fall in missing
    // data ranges or that have been explicitly identified as missing in the
    // data source.
    if (!args.missing_is_zero) {
      // a line is defined if the _missing attrib is not set to true
      // and the y-accessor is not null
      plot.line = plot.line.defined(function(d) {
        return (d['_missing'] === undefined || d['_missing'] !== true) && d[args.y_accessor] !== null;
      });
    }
  }

  function mg_add_confidence_band(args, plot, svg, which_line) {
    if (args.show_confidence_band) {
      var confidenceBand;
      if (svg.select('.mg-confidence-band-' + which_line).empty()) {
        svg.append('path')
          .attr('class', 'mg-confidence-band mg-confidence-band-' + which_line)
      }

      // transition this line's confidence band
      confidenceBand = svg.select('.mg-confidence-band-' + which_line);

      confidenceBand
        .transition()
        .duration(function() {
          return (args.transition_on_update) ? 1000 : 0;
        })
        .attr('d', plot.confidence_area(args.data[which_line - 1]))
        .attr('clip-path', 'url(#mg-plot-window-' + mg_target_ref(args.target) + ')')
    }
  }

  function mg_add_area(args, plot, svg, which_line, line_id) {
    var areas = svg.selectAll('.mg-main-area.mg-area' + line_id);
    if (plot.display_area) {
      // if area already exists, transition it
      if (!areas.empty()) {
        svg.node().appendChild(areas.node());

        areas.transition()
          .duration(plot.update_transition_duration)
          .attr('d', plot.area(args.data[which_line]))
          .attr('clip-path', 'url(#mg-plot-window-' + mg_target_ref(args.target) + ')');
      } else { // otherwise, add the area
        svg.append('path')
          .classed('mg-main-area', true)
          .classed('mg-area' + line_id, true)
          .classed('mg-area' + line_id + '-color', args.colors === null)
          .attr('d', plot.area(args.data[which_line]))
          .attr('fill', args.colors === null ? '' : args.colors[line_id - 1])
          .attr('clip-path', 'url(#mg-plot-window-' + mg_target_ref(args.target) + ')');
      }
    } else if (!areas.empty()) {
      areas.remove();
    }
  }

  function mg_default_color_for_path(this_path, line_id) {
    this_path.classed('mg-line' + (line_id) + '-color', true);
  }

  function mg_color_line(args, this_path, which_line, line_id) {
    if (args.colors) {
      // for now, if args.colors is not an array, then keep moving as if nothing happened.
      // if args.colors is not long enough, default to the usual line_id color.
      if (args.colors.constructor === Array) {
        this_path.attr('stroke', args.colors[which_line]);
        if (args.colors.length < which_line + 1) {
          // Go with default coloring.
          // this_path.classed('mg-line' + (line_id) + '-color', true);
          mg_default_color_for_path(this_path, line_id);
        }
      } else {
        // this_path.classed('mg-line' + (line_id) + '-color', true);
        mg_default_color_for_path(this_path, line_id);
      }
    } else {
      // this is the typical workflow
      // this_path.classed('mg-line' + (line_id) + '-color', true);
      mg_default_color_for_path(this_path, line_id);
    }
  }

  function mg_add_line_element(args, plot, this_path, which_line) {
    if (args.animate_on_load) {
      plot.data_median = d3.median(args.data[which_line], function(d) {
        return d[args.y_accessor]; });
      this_path.attr('d', plot.flat_line(args.data[which_line]))
        .transition()
        .duration(1000)
        .attr('d', plot.line(args.data[which_line]))
        .attr('clip-path', 'url(#mg-plot-window-' + mg_target_ref(args.target) + ')');
    } else { // or just add the line
      this_path.attr('d', plot.line(args.data[which_line]))
        .attr('clip-path', 'url(#mg-plot-window-' + mg_target_ref(args.target) + ')');
    }
  }

  function mg_add_line(args, plot, svg, existing_line, which_line, line_id) {
    if (!existing_line.empty()) {
      svg.node().appendChild(existing_line.node());

      var lineTransition = existing_line.transition()
        .duration(plot.update_transition_duration);

      if (!plot.display_area && args.transition_on_update && !args.missing_is_hidden) {
        lineTransition.attrTween('d', path_tween(plot.line(args.data[which_line]), 4));
      } else {
        lineTransition.attr('d', plot.line(args.data[which_line]));
      }
    } else { // otherwise...
      // if we're animating on load, animate the line from its median value
      var this_path = svg.append('path')
        .attr('class', 'mg-main-line mg-line' + line_id);

      mg_color_line(args, this_path, which_line, line_id);
      mg_add_line_element(args, plot, this_path, which_line);
    }
  }

  function mg_add_legend_element(args, plot, which_line, line_id) {
    var this_legend;
    if (args.legend) {
      if (is_array(args.legend)) {
        this_legend = args.legend[which_line];
      } else if (is_function(args.legend)) {
        this_legend = args.legend(args.data[which_line]);
      }

      if (args.legend_target) {
        if (args.colors && args.colors.constructor === Array) {
          plot.legend_text = "<span style='color:" + args.colors[which_line] + "'>&mdash; " +
            this_legend + '&nbsp; </span>' + plot.legend_text;
        } else {
          plot.legend_text = "<span class='mg-line" + line_id + "-legend-color'>&mdash; " +
            this_legend + '&nbsp; </span>' + plot.legend_text;
        }
      } else {
        var anchor_point, anchor_orientation, dx;
        if (args.y_axis_position === 'left') {
          anchor_point = args.data[which_line][args.data[which_line].length - 1];
          anchor_orientation = 'start';
          dx = args.buffer;
        } else {
          anchor_point = args.data[which_line][0];
          anchor_orientation = 'end';
          dx = -args.buffer;
        }
        var legend_text = plot.legend_group.append('svg:text')
          .attr('x', args.scalefns.xf(anchor_point))
          .attr('dx', dx)
          .attr('y', args.scalefns.yf(anchor_point))
          .attr('dy', '.35em')
          .attr('font-size', 10)
          .attr('text-anchor', anchor_orientation)
          .attr('font-weight', '300')
          .text(this_legend);

        if (args.colors && args.colors.constructor === Array) {
          if (args.colors.length < which_line + 1) {
            legend_text.classed('mg-line' + (line_id) + '-legend-color', true);
          } else {
            legend_text.attr('fill', args.colors[which_line]);
          }
        } else {
          legend_text.classed('mg-line' + (line_id) + '-legend-color', true);
        }

        mg_prevent_vertical_overlap(plot.legend_group.selectAll('.mg-line-legend text').nodes(), args);
      }
    }
  }

  function mg_plot_legend_if_legend_target(target, legend) {
    if (target) {
      d3.select(target).html(legend);
    }
  }

  function mg_add_legend_group(args, plot, svg) {
    if (args.legend) plot.legend_group = mg_add_g(svg, 'mg-line-legend');
  }

  function mg_remove_existing_line_rollover_elements(svg) {
    // remove the old rollovers if they already exist
    mg_selectAll_and_remove(svg, '.mg-rollover-rect');
    mg_selectAll_and_remove(svg, '.mg-voronoi');

    // remove the old rollover text and circle if they already exist
    mg_selectAll_and_remove(svg, '.mg-active-datapoint');
    mg_selectAll_and_remove(svg, '.mg-line-rollover-circle');
    //mg_selectAll_and_remove(svg, '.mg-active-datapoint-container');
  }

  function mg_add_rollover_circle(args, svg) {
    // append circle
    var circle = svg.selectAll('.mg-line-rollover-circle')
      .data(args.data)
      .enter().append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 0);

    if (args.colors && args.colors.constructor === Array) {
      circle
        .attr('class', function(d) {
          return 'mg-line' + d.line_id;
        })
        .attr('fill', function(d, i) {
          return args.colors[i];
        })
        .attr('stroke', function(d, i) {
          return args.colors[i];
        });
    } else {
      circle.attr('class', function(d, i) {
        return [
          'mg-line' + d.line_id,
          'mg-line' + d.line_id + '-color',
          'mg-area' + d.line_id + '-color'
        ].join(' ');
      });
    }
    circle.classed('mg-line-rollover-circle', true);
  }

  function mg_set_unique_line_id_for_each_series(args) {
    // update our data by setting a unique line id for each series
    // increment from 1... unless we have a custom increment series
    var line_id = 1;
    for (var i = 0; i < args.data.length; i++) {
      for (var j = 0; j < args.data[i].length; j++) {
        // if custom line-color map is set, use that instead of line_id
        if (args.custom_line_color_map.length > 0) {
          args.data[i][j].line_id = args.custom_line_color_map[i];
        } else {
          args.data[i][j].line_id = line_id;
        }
      }
      line_id++;
    }
  }

  function mg_nest_data_for_voronoi(args) {
    return d3.merge(args.data);
  }

  function mg_line_class_string(args) {
    return function(d) {
      var class_string;

      if (args.linked) {
        var v = d[args.x_accessor];
        var formatter = MG.time_format(args.utc_time, args.linked_format);

        // only format when x-axis is date
        var id = (typeof v === 'number') ? (d.line_id - 1) : formatter(v);
        class_string = 'roll_' + id + ' mg-line' + d.line_id;

        if (args.color === null) {
          class_string += ' mg-line' + d.line_id + '-color';
        }
        return class_string;

      } else {
        class_string = 'mg-line' + d.line_id;
        if (args.color === null) class_string += ' mg-line' + d.line_id + '-color';
        return class_string;
      }
    };
  }

  function mg_add_voronoi_rollover(args, svg, rollover_on, rollover_off, rollover_move) {
    var voronoi = d3.voronoi()
      .x(function(d) {
        return args.scales.X(d[args.x_accessor]).toFixed(2); })
      .y(function(d) {
        return args.scales.Y(d[args.y_accessor]).toFixed(2); })
      .extent([
        [args.buffer, args.buffer + args.title_y_position],
        [args.width - args.buffer, args.height - args.buffer]
      ]);

    var g = mg_add_g(svg, 'mg-voronoi');
    g.selectAll('path')
      .data(voronoi.polygons(mg_nest_data_for_voronoi(args)))
      .enter()
      .append('path')
      .filter(function(d) {
        return d !== undefined && d.length > 0; })
      .attr('d', function(d) {
        return d == null ? null : 'M' + d.join('L') + 'Z'; })
      .datum(function(d) {
        return d == null ? null : d.data; }) // because of d3.voronoi, reassign d
      .attr('class', mg_line_class_string(args))
      .on('mouseover', rollover_on)
      .on('mouseout', rollover_off)
      .on('mousemove', rollover_move);

    mg_configure_voronoi_rollover(args, svg);
  }

  function nest_data_for_aggregate_rollover(args) {
    var data_nested = d3.nest()
      .key(function(d) {
        return d[args.x_accessor]; })
      .entries(d3.merge(args.data));
    data_nested.forEach(function(entry) {
      var datum = entry.values[0];
      entry.key = datum[args.x_accessor];
    });

    if (args.x_sort) {
      return data_nested.sort(function(a, b) {
        return new Date(a.key) - new Date(b.key); });
    } else {
      return data_nested;
    }
  }

  function mg_add_aggregate_rollover(args, svg, rollover_on, rollover_off, rollover_move) {
    // Undo the keys getting coerced to strings, by setting the keys from the values
    // This is necessary for when we have X axis keys that are things like
    var data_nested = nest_data_for_aggregate_rollover(args);

    var xf = data_nested.map(function(di) {
      return args.scales.X(di.key);
    });

    var g = svg.append('g')
      .attr('class', 'mg-rollover-rect');

    g.selectAll('.mg-rollover-rects')
      .data(data_nested).enter()
      .append('rect')
      .attr('x', function(d, i) {
        if (xf.length === 1) return mg_get_plot_left(args);
        else if (i === 0) return xf[i].toFixed(2);
        else return ((xf[i - 1] + xf[i]) / 2).toFixed(2);
      })
      .attr('y', args.top)
      .attr('width', function(d, i) {
        if (xf.length === 1) return mg_get_plot_right(args);
        else if (i === 0) return ((xf[i + 1] - xf[i]) / 2).toFixed(2);
        else if (i === xf.length - 1) return ((xf[i] - xf[i - 1]) / 2).toFixed(2);
        else return ((xf[i + 1] - xf[i - 1]) / 2).toFixed(2);
      })
      .attr('class', function(d) {
        var line_classes = d.values.map(function(datum) {
          var lc = mg_line_class(datum.line_id);
          if (args.colors === null) lc += ' ' + mg_line_color_class(datum.line_id);
          return lc;
        }).join(' ');
        if (args.linked && d.values.length > 0) {
          line_classes += ' ' + mg_rollover_id_class(mg_rollover_format_id(d.values[0], 0, args));
        }

        return line_classes;
      })
      .attr('height', args.height - args.bottom - args.top - args.buffer)
      .attr('opacity', 0)
      .on('mouseover', rollover_on)
      .on('mouseout', rollover_off)
      .on('mousemove', rollover_move);

    mg_configure_aggregate_rollover(args, svg);
  }

  function mg_configure_singleton_rollover(args, svg) {
    svg.select('.mg-rollover-rect rect')
      .on('mouseover')(args.data[0][0], 0);
  }

  function mg_configure_voronoi_rollover(args, svg) {
    for (var i = 0; i < args.data.length; i++) {
      var j = i + 1;

      if (args.custom_line_color_map.length > 0 &&
        args.custom_line_color_map[i] !== undefined) {
        j = args.custom_line_color_map[i];
      }

      if (args.data[i].length === 1 && !svg.selectAll('.mg-voronoi .mg-line' + j).empty()) {
        svg.selectAll('.mg-voronoi .mg-line' + j)
          .on('mouseover')(args.data[i][0], 0);

        svg.selectAll('.mg-voronoi .mg-line' + j)
          .on('mouseout')(args.data[i][0], 0);
      }
    }
  }

  function mg_line_class(line_id) {
    return 'mg-line' + line_id;
  }

  function mg_line_color_class(line_id) {
    return 'mg-line' + line_id + '-color';
  }

  function mg_rollover_id_class(id) {
    return 'roll_' + id;
  }

  function mg_rollover_format_id(d, i, args) {
    var v = d[args.x_accessor];
    var formatter = MG.time_format(args.utc_time, args.linked_format);
    // only format when x-axis is date
    var id = (typeof v === 'number') ? i : formatter(v);
    return id;
  }

  function mg_add_single_line_rollover(args, svg, rollover_on, rollover_off, rollover_move) {
    // set to 1 unless we have a custom increment series
    var line_id = 1;
    if (args.custom_line_color_map.length > 0) {
      line_id = args.custom_line_color_map[0];
    }

    var g = svg.append('g')
      .attr('class', 'mg-rollover-rect');

    var xf = args.data[0].map(args.scalefns.xf);

    g.selectAll('.mg-rollover-rects')
      .data(args.data[0]).enter()
      .append('rect')
      .attr('class', function(d, i) {
        var cl = mg_line_color_class(line_id) + ' ' + mg_line_class(d.line_id);
        if (args.linked) cl += cl + ' ' + mg_rollover_id_class(mg_rollover_format_id(d, i, args));
        return cl;
      })
      .attr('x', function(d, i) {
        // if data set is of length 1
        if (xf.length === 1) return mg_get_plot_left(args);
        else if (i === 0) return xf[i].toFixed(2);
        else return ((xf[i - 1] + xf[i]) / 2).toFixed(2);
      })
      .attr('y', function(d, i) {
        return (args.data.length > 1) ? args.scalefns.yf(d) - 6 // multi-line chart sensitivity
          : args.top;
      })
      .attr('width', function(d, i) {
        // if data set is of length 1
        if (xf.length === 1) return mg_get_plot_right(args);
        else if (i === 0) return ((xf[i + 1] - xf[i]) / 2).toFixed(2);
        else if (i === xf.length - 1) return ((xf[i] - xf[i - 1]) / 2).toFixed(2);
        else return ((xf[i + 1] - xf[i - 1]) / 2).toFixed(2);
      })
      .attr('height', function(d, i) {
        return (args.data.length > 1) ? 12 // multi-line chart sensitivity
          : args.height - args.bottom - args.top - args.buffer;
      })
      .attr('opacity', 0)
      .on('mouseover', rollover_on)
      .on('mouseout', rollover_off)
      .on('mousemove', rollover_move);

    if (mg_is_singleton(args)) {
      mg_configure_singleton_rollover(args, svg);
    }
  }

  function mg_configure_aggregate_rollover(args, svg) {
    var rect = svg.selectAll('.mg-rollover-rect rect');
    var rect_first = rect.nodes()[0][0] || rect.nodes()[0];
    if (args.data.filter(function(d) { return d.length === 1; }).length > 0) {
      rect.on('mouseover')(rect_first.__data__, 0);
    }
  }

  function mg_is_standard_multiline(args) {
    return args.data.length > 1 && !args.aggregate_rollover;
  }

  function mg_is_aggregated_rollover(args) {
    return args.data.length > 1 && args.aggregate_rollover;
  }

  function mg_is_singleton(args) {
    return args.data.length === 1 && args.data[0].length === 1;
  }

  function mg_draw_all_line_elements(args, plot, svg) {
    mg_remove_dangling_bands(plot, svg);

    for (var i = args.data.length - 1; i >= 0; i--) {
      var this_data = args.data[i];

      // passing the data for the current line
      MG.call_hook('line.before_each_series', [this_data, args]);

      // override increment if we have a custom increment series
      var line_id = i + 1;
      if (args.custom_line_color_map.length > 0) {
        line_id = args.custom_line_color_map[i];
      }

      args.data[i].line_id = line_id;

      if (this_data.length === 0) {
        continue;
      }
      var existing_line = svg.select('path.mg-main-line.mg-line' + (line_id));

      mg_add_confidence_band(args, plot, svg, line_id);
      mg_add_area(args, plot, svg, i, line_id);
      mg_add_line(args, plot, svg, existing_line, i, line_id);
      mg_add_legend_element(args, plot, i, line_id);

      // passing the data for the current line
      MG.call_hook('line.after_each_series', [this_data, existing_line, args]);
    }
  }

  function mg_remove_dangling_bands(plot, svg) {
    if (plot.existing_band[0] && plot.existing_band[0].length > svg.selectAll('.mg-main-line').node().length) {
      svg.selectAll('.mg-confidence-band').remove();
    }
  }

  function mg_line_display_area(args) {
    if (typeof args.original_area === 'undefined') {
      return args.area && !args.use_data_y_min && args.data.length <= 1 && args.aggregate_rollover === false;
    } else {
      return args.original_area;
    }
  }

  function mg_line_main_plot(args) {
    var plot = {};
    var svg = mg_get_svg_child_of(args.target);

    // remove any old legends if they exist
    mg_selectAll_and_remove(svg, '.mg-line-legend');
    mg_add_legend_group(args, plot, svg);

    plot.data_median = 0;
    plot.update_transition_duration = (args.transition_on_update) ? 1000 : 0;
    plot.display_area = mg_line_display_area(args);
    plot.legend_text = '';
    mg_line_graph_generators(args, plot, svg);
    plot.existing_band = svg.selectAll('.mg-confidence-band').nodes();

    // should we continue with the default line render? A `line.all_series` hook should return false to prevent the default.
    var continueWithDefault = MG.call_hook('line.before_all_series', [args]);
    if (continueWithDefault !== false) {
      mg_draw_all_line_elements(args, plot, svg);
    }

    mg_plot_legend_if_legend_target(args.legend_target, plot.legend_text);
  }

  function mg_line_rollover_setup(args, graph) {
    var svg = mg_get_svg_child_of(args.target);

    if (svg.selectAll('.mg-active-datapoint-container').nodes().length === 0) {
      mg_add_g(svg, 'mg-active-datapoint-container');
    }

    mg_remove_existing_line_rollover_elements(svg);
    mg_add_rollover_circle(args, svg);
    mg_set_unique_line_id_for_each_series(args);

    if (mg_is_standard_multiline(args)) {
      mg_add_voronoi_rollover(args, svg, graph.rolloverOn(args), graph.rolloverOff(args), graph.rolloverMove(args));
    } else if (mg_is_aggregated_rollover(args)) {
      mg_add_aggregate_rollover(args, svg, graph.rolloverOn(args), graph.rolloverOff(args), graph.rolloverMove(args));
    } else {
      mg_add_single_line_rollover(args, svg, graph.rolloverOn(args), graph.rolloverOff(args), graph.rolloverMove(args));
    }
  }

  function mg_update_rollover_circle(args, svg, d) {
    if (args.aggregate_rollover && args.data.length > 1) {
      // hide the circles in case a non-contiguous series is present
      svg.selectAll('circle.mg-line-rollover-circle')
        .style('opacity', 0);

      d.values.forEach(function(datum) {
        if (mg_data_in_plot_bounds(datum, args)) mg_update_aggregate_rollover_circle(args, svg, datum);
      });
    } else if ((args.missing_is_hidden && d['_missing']) || d[args.y_accessor] === null) {
      // disable rollovers for hidden parts of the line
      // recall that hidden parts are missing data ranges and possibly also
      // data points that have been explicitly identified as missing
      return;
    } else {
      // show circle on mouse-overed rect
      if (mg_data_in_plot_bounds(d, args)) {
        mg_update_generic_rollover_circle(args, svg, d);
      }
    }
  }

  function mg_update_aggregate_rollover_circle(args, svg, datum) {
    svg.select('circle.mg-line-rollover-circle.mg-line' + datum.line_id)
      .attr('cx', args.scales.X(datum[args.x_accessor]).toFixed(2))
      .attr('cy', args.scales.Y(datum[args.y_accessor]).toFixed(2))
      .attr('r', args.point_size)
      .style('opacity', 1);
  }

  function mg_update_generic_rollover_circle(args, svg, d) {
    svg.selectAll('circle.mg-line-rollover-circle.mg-line' + d.line_id)
      .classed('mg-line-rollover-circle', true)
      .attr('cx', function() {
        return args.scales.X(d[args.x_accessor]).toFixed(2);
      })
      .attr('cy', function() {
        return args.scales.Y(d[args.y_accessor]).toFixed(2);
      })
      .attr('r', args.point_size)
      .style('opacity', 1);
  }

  function mg_trigger_linked_mouseovers(args, d, i) {
    if (args.linked && !MG.globals.link) {
      MG.globals.link = true;
      if (!args.aggregate_rollover || d.value !== undefined || d.values.length > 0) {
        var datum = d.values ? d.values[0] : d;
        var id = mg_rollover_format_id(datum, i, args);
        // trigger mouseover on matching line in .linked charts
        d3.selectAll('.' + mg_line_class(datum.line_id) + '.' + mg_rollover_id_class(id))
          .each(function(d) {
            d3.select(this)
              .on('mouseover')(d, i);
          });
      }
    }
  }

  function mg_trigger_linked_mouseouts(args, d, i) {
    if (args.linked && MG.globals.link) {
      MG.globals.link = false;

      var formatter = MG.time_format(args.utc_time, args.linked_format);
      var datums = d.values ? d.values : [d];
      datums.forEach(function(datum) {
        var v = datum[args.x_accessor];
        var id = (typeof v === 'number') ? i : formatter(v);

        // trigger mouseout on matching line in .linked charts
        d3.selectAll('.roll_' + id)
          .each(function(d) {
            d3.select(this)
              .on('mouseout')(d);
          });
      });
    }
  }

  function mg_remove_active_data_points_for_aggregate_rollover(args, svg) {
    svg.selectAll('circle.mg-line-rollover-circle').filter(function(circle) {
        return circle.length > 1;
      })
      .style('opacity', 0);
  }

  function mg_remove_active_data_points_for_generic_rollover(args, svg, d) {
    svg.selectAll('circle.mg-line-rollover-circle.mg-line' + d.line_id)
      .style('opacity', function() {
        var id = d.line_id - 1;

        if (args.custom_line_color_map.length > 0 &&
          args.custom_line_color_map.indexOf(d.line_id) !== undefined
        ) {
          id = args.custom_line_color_map.indexOf(d.line_id);
        }

        if (args.data[id].length === 1) {
          return 1;
        } else {
          return 0;
        }
      });
  }

  function mg_remove_active_text(svg) {
    svg.select('.mg-active-datapoint').text('');
  }

  function lineChart(args) {
    this.init = function(args) {
      this.args = args;

      if (!args.data || args.data.length === 0) {
        args.internal_error = 'No data was supplied';
        internal_error(args);
        return this;
      } else {
        args.internal_error = undefined;
      }

      raw_data_transformation(args);
      process_line(args);

      MG.call_hook('line.before_destroy', this);

      init(args);

      // TODO incorporate markers into calculation of x scales
      new MG.scale_factory(args)
        .namespace('x')
        .numericalDomainFromData()
        .numericalRange('bottom')

      var baselines = (args.baselines || []).map(function(d) {
        return d[args.y_accessor];
      });

      new MG.scale_factory(args)
        .namespace('y')
        .zeroBottom(true)
        .inflateDomain(true)
        .numericalDomainFromData(baselines)
        .numericalRange('left');

      var svg = mg_get_svg_child_of(args.target);

      if (args.x_axis) {
        new MG.axis_factory(args)
          .namespace('x')
          .type('numerical')
          .position(args.x_axis_position)
          .rug(x_rug(args))
          .label(mg_add_x_label)
          .draw();
      }

      if (args.y_axis) {
        new MG.axis_factory(args)
          .namespace('y')
          .type('numerical')
          .position(args.y_axis_position)
          .rug(y_rug(args))
          .label(mg_add_y_label)
          .draw();
      }

      this.markers();
      this.mainPlot();
      this.rollover();
      this.windowListeners();

      MG.call_hook('line.after_init', this);

      return this;
    };

    this.mainPlot = function() {
      mg_line_main_plot(args);
      return this;
    };

    this.markers = function() {
      markers(args);
      return this;
    };

    this.rollover = function() {
      var that = this;
      mg_line_rollover_setup(args, that);
      MG.call_hook('line.after_rollover', args);

      return this;
    };

    this.rolloverOn = function(args) {
      var svg = mg_get_svg_child_of(args.target);
      var fmt = mg_get_rollover_time_format(args);

      return function(d, i) {
        mg_update_rollover_circle(args, svg, d);
        mg_trigger_linked_mouseovers(args, d, i);

        svg.selectAll('text')
          .filter(function(g, j) {
            return d === g;
          })
          .attr('opacity', 0.3);

        // update rollover text except for missing data points
        if (args.show_rollover_text &&
            !((args.missing_is_hidden && d['_missing']) || d[args.y_accessor] === null)
          ) {
          var mouseover = mg_mouseover_text(args, { svg: svg });
          var row = mouseover.mouseover_row();
          if (args.aggregate_rollover) {
            row.text((args.aggregate_rollover && args.data.length > 1
              ? mg_format_x_aggregate_mouseover
              : mg_format_x_mouseover)(args, d));
          }

          var pts = args.aggregate_rollover && args.data.length > 1
            ? d.values
            : [d];

          pts.forEach(function(di) {
            if (args.aggregate_rollover) {
              row = mouseover.mouseover_row();
            }

            if (args.legend) {
              mg_line_color_text(row.text(args.legend[di.line_id - 1] + '  ').bold().elem(), di, args);
            }

            mg_line_color_text(row.text('\u2014  ').elem(), di, args);
            if (!args.aggregate_rollover) {
              row.text(mg_format_x_mouseover(args, di));
            }

            row.text(mg_format_y_mouseover(args, di, args.time_series === false));
          })
        }

        if (args.mouseover) {
          args.mouseover(d, i);
        }
      };
    };

    this.rolloverOff = function(args) {
      var svg = mg_get_svg_child_of(args.target);

      return function(d, i) {
        mg_trigger_linked_mouseouts(args, d, i);
        if (args.aggregate_rollover) {
          mg_remove_active_data_points_for_aggregate_rollover(args, svg);
        } else {
          mg_remove_active_data_points_for_generic_rollover(args, svg, d);
        }

        if (args.data[0].length > 1) {
          mg_clear_mouseover_container(svg);
        }

        if (args.mouseout) {
          args.mouseout(d, i);
        }
      };
    };

    this.rolloverMove = function(args) {
      return function(d, i) {
        if (args.mousemove) {
          args.mousemove(d, i);
        }
      };
    };

    this.windowListeners = function() {
      mg_window_listeners(this.args);
      return this;
    };

    this.init(args);
  }

  MG.register('line', lineChart);
}).call(this);
