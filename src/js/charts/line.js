{
  function mg_line_color_text (elem, line_id, { color, colors }) {
    elem.classed('mg-hover-line-color', color === null)
      .classed(`mg-hover-line${line_id}-color`, colors === null)
      .attr('fill', colors === null ? '' : colors[line_id - 1])
  }

  function mg_line_graph_generators (args, plot, svg) {
    mg_add_line_generator(args, plot)
    mg_add_area_generator(args, plot)
    mg_add_flat_line_generator(args, plot)
    mg_add_confidence_band_generator(args, plot, svg)
  }

  function mg_add_confidence_band_generator (args, plot, svg) {
    plot.existing_band = svg.selectAll('.mg-confidence-band').nodes()
    if (args.show_confidence_band) {
      plot.confidence_area = d3.area()
        .defined(plot.line.defined())
        .x(args.scaleFunctions.xf)
        .y0(d => {
          const l = args.show_confidence_band[0]
          if (d[l] != undefined) {
            return args.scales.Y(d[l])
          } else {
            return args.scales.Y(d[args.yAccessor])
          }
        })
        .y1(d => {
          const u = args.show_confidence_band[1]
          if (d[u] != undefined) {
            return args.scales.Y(d[u])
          } else {
            return args.scales.Y(d[args.yAccessor])
          }
        })
        .curve(args.interpolate)
    }
  }

  function mg_add_area_generator ({ scaleFunctions, scales, interpolate, flip_area_under_y_value }, plot) {
    const areaBaselineValue = (Number.isFinite(flip_area_under_y_value)) ? scales.Y(flip_area_under_y_value) : scales.Y.range()[0]

    plot.area = d3.area()
      .defined(plot.line.defined())
      .x(scaleFunctions.xf)
      .y0(() => {
        return areaBaselineValue
      })
      .y1(scaleFunctions.yf)
      .curve(interpolate)
  }

  function mg_add_flat_line_generator ({ yAccessor, scaleFunctions, scales, interpolate }, plot) {
    plot.flat_line = d3.line()
      .defined(d => (d._missing === undefined || d._missing !== true) && d[yAccessor] !== null)
      .x(scaleFunctions.xf)
      .y(() => scales.Y(plot.data_median))
      .curve(interpolate)
  }

  function mg_add_line_generator ({ scaleFunctions, interpolate, missingIsZero, yAccessor }, plot) {
    plot.line = d3.line()
      .x(scaleFunctions.xf)
      .y(scaleFunctions.yf)
      .curve(interpolate)

    // if missingIsZero is not set, then hide data points that fall in missing
    // data ranges or that have been explicitly identified as missing in the
    // data source.
    if (!missingIsZero) {
      // a line is defined if the _missing attrib is not set to true
      // and the y-accessor is not null
      plot.line = plot.line.defined(d => (d._missing === undefined || d._missing !== true) && d[yAccessor] !== null)
    }
  }

  function mg_add_confidence_band (
    { show_confidence_band, transition_on_update, data, target },
    plot,
    svg,
    which_line
  ) {
    if (show_confidence_band) {
      let confidenceBand
      if (svg.select(`.mg-confidence-band-${which_line}`).empty()) {
        svg.append('path')
          .attr('class', `mg-confidence-band mg-confidence-band-${which_line}`)
      }

      // transition this line's confidence band
      confidenceBand = svg.select(`.mg-confidence-band-${which_line}`)

      confidenceBand
        .transition()
        .duration(() => (transition_on_update) ? 1000 : 0)
        .attr('d', plot.confidence_area(data[which_line - 1]))
        .attr('clip-path', `url(#mg-plot-window-${targetRef(target)})`)
    }
  }

  function mg_add_area ({ data, target, colors }, plot, svg, which_line, line_id) {
    const areas = svg.selectAll(`.mg-main-area.mg-area${line_id}`)
    if (plot.display_area) {
      // if area already exists, transition it
      if (!areas.empty()) {
        svg.node().appendChild(areas.node())

        areas.transition()
          .duration(plot.update_transition_duration)
          .attr('d', plot.area(data[which_line]))
          .attr('clip-path', `url(#mg-plot-window-${targetRef(target)})`)
      } else { // otherwise, add the area
        svg.append('path')
          .classed('mg-main-area', true)
          .classed(`mg-area${line_id}`, true)
          .classed('mg-area-color', colors === null)
          .classed(`mg-area${line_id}-color`, colors === null)
          .attr('d', plot.area(data[which_line]))
          .attr('fill', colors === null ? '' : colors[line_id - 1])
          .attr('clip-path', `url(#mg-plot-window-${targetRef(target)})`)
      }
    } else if (!areas.empty()) {
      areas.remove()
    }
  }

  function mg_default_color_for_path (this_path, line_id) {
    this_path.classed('mg-line-color', true)
      .classed(`mg-line${line_id}-color`, true)
  }

  function mg_color_line ({ colors }, this_path, which_line, line_id) {
    if (colors) {
      // for now, if args.colors is not an array, then keep moving as if nothing happened.
      // if args.colors is not long enough, default to the usual line_id color.
      if (colors.constructor === Array) {
        this_path.attr('stroke', colors[which_line])
        if (colors.length < which_line + 1) {
          // Go with default coloring.
          // this_path.classed('mg-line' + (line_id) + '-color', true);
          mg_default_color_for_path(this_path, line_id)
        }
      } else {
        // this_path.classed('mg-line' + (line_id) + '-color', true);
        mg_default_color_for_path(this_path, line_id)
      }
    } else {
      // this is the typical workflow
      // this_path.classed('mg-line' + (line_id) + '-color', true);
      mg_default_color_for_path(this_path, line_id)
    }
  }

  function mg_add_line_element ({ animate_on_load, data, yAccessor, target }, plot, this_path, which_line) {
    if (animate_on_load) {
      plot.data_median = d3.median(data[which_line], d => d[yAccessor])
      this_path.attr('d', plot.flat_line(data[which_line]))
        .transition()
        .duration(1000)
        .attr('d', plot.line(data[which_line]))
        .attr('clip-path', `url(#mg-plot-window-${targetRef(target)})`)
    } else { // or just add the line
      this_path.attr('d', plot.line(data[which_line]))
        .attr('clip-path', `url(#mg-plot-window-${targetRef(target)})`)
    }
  }

  function mg_add_line (args, plot, svg, existing_line, which_line, line_id) {
    if (!existing_line.empty()) {
      svg.node().appendChild(existing_line.node())

      const lineTransition = existing_line.transition()
        .duration(plot.update_transition_duration)

      if (!plot.display_area && args.transition_on_update && !args.missingIsHidden) {
        lineTransition.attrTween('d', pathTween(plot.line(args.data[which_line]), 4))
      } else {
        lineTransition.attr('d', plot.line(args.data[which_line]))
      }
    } else { // otherwise...
      // if we're animating on load, animate the line from its median value
      const this_path = svg.append('path')
        .attr('class', `mg-main-line mg-line${line_id}`)

      mg_color_line(args, this_path, which_line, line_id)
      mg_add_line_element(args, plot, this_path, which_line)
    }
  }

  function mg_add_legend_element (args, plot, which_line, line_id) {
    let this_legend
    if (args.legend) {
      if (is_array(args.legend)) {
        this_legend = args.legend[which_line]
      } else if (is_function(args.legend)) {
        this_legend = args.legend(args.data[which_line])
      }

      if (args.legend_target) {
        if (args.colors && args.colors.constructor === Array) {
          plot.legend_text = `<span style='color:${args.colors[which_line]}'>&mdash; ${this_legend}&nbsp; </span>${plot.legend_text}`
        } else {
          plot.legend_text = `<span class='mg-line${line_id}-legend-color'>&mdash; ${this_legend}&nbsp; </span>${plot.legend_text}`
        }
      } else {
        let anchor_point, anchor_orientation, dx

        if (args.yAxis_position === 'left') {
          anchor_point = args.data[which_line][args.data[which_line].length - 1]
          anchor_orientation = 'start'
          dx = args.buffer
        } else {
          anchor_point = args.data[which_line][0]
          anchor_orientation = 'end'
          dx = -args.buffer
        }
        const legend_text = plot.legend_group.append('svg:text')
          .attr('x', args.scaleFunctions.xf(anchor_point))
          .attr('dx', dx)
          .attr('y', args.scaleFunctions.yf(anchor_point))
          .attr('dy', '.35em')
          .attr('font-size', 10)
          .attr('text-anchor', anchor_orientation)
          .attr('font-weight', '300')
          .text(this_legend)

        if (args.colors && args.colors.constructor === Array) {
          if (args.colors.length < which_line + 1) {
            legend_text.classed(`mg-line${line_id}-legend-color`, true)
          } else {
            legend_text.attr('fill', args.colors[which_line])
          }
        } else {
          legend_text.classed('mg-line-legend-color', true)
            .classed(`mg-line${line_id}-legend-color`, true)
        }

        preventVerticalOverlap(plot.legend_group.selectAll('.mg-line-legend text').nodes(), args)
      }
    }
  }

  function mg_plot_legend_if_legend_target (target, legend) {
    if (target) d3.select(target).html(legend)
  }

  function mg_add_legend_group ({ legend }, plot, svg) {
    if (legend) plot.legend_group = addG(svg, 'mg-line-legend')
  }

  function mg_remove_existing_line_rollover_elements (svg) {
    // remove the old rollovers if they already exist
    selectAllAndRemove(svg, '.mg-rollover-rect')
    selectAllAndRemove(svg, '.mg-voronoi')

    // remove the old rollover text and circle if they already exist
    selectAllAndRemove(svg, '.mg-active-datapoint')
    selectAllAndRemove(svg, '.mg-line-rollover-circle')
    // selectAllAndRemove(svg, '.mg-active-datapoint-container');
  }

  function mg_add_rollover_circle ({ data, colors }, svg) {
    // append circle
    const circle = svg.selectAll('.mg-line-rollover-circle')
      .data(data)
      .enter().append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 0)

    if (colors && colors.constructor === Array) {
      circle
        .attr('class', ({ __line_id__ }) => `mg-line${__line_id__}`)
        .attr('fill', (d, i) => colors[i])
        .attr('stroke', (d, i) => colors[i])
    } else {
      circle.attr('class', ({ __line_id__ }, i) => [
        `mg-line${__line_id__}`,
        `mg-line${__line_id__}-color`,
        `mg-area${__line_id__}-color`
      ].join(' '))
    }
    circle.classed('mg-line-rollover-circle', true)
  }

  function mg_set_unique_line_id_for_each_series ({ data, custom_line_color_map }) {
    // update our data by setting a unique line id for each series
    // increment from 1... unless we have a custom increment series

    for (let i = 0; i < data.length; i++) {
      data[i].forEach(datum => {
        datum.__index__ = i + 1
        datum.__line_id__ = (custom_line_color_map.length > 0) ? custom_line_color_map[i] : i + 1
      })
    }
  }

  function mg_nest_data_for_voronoi ({ data }) {
    return d3.merge(data)
  }

  function mg_line_class_string (args) {
    return d => {
      let class_string

      if (args.linked) {
        const v = d[args.xAccessor]
        const formatter = MG.time_format(args.utcTime, args.linked_format)

        // only format when x-axis is date
        const id = (typeof v === 'number') ? (d.__line_id__ - 1) : formatter(v)
        class_string = `roll_${id} mg-line${d.__line_id__}`

        if (args.color === null) {
          class_string += ` mg-line${d.__line_id__}-color`
        }
        return class_string
      } else {
        class_string = `mg-line${d.__line_id__}`
        if (args.color === null) class_string += ` mg-line${d.__line_id__}-color`
        return class_string
      }
    }
  }

  function mg_add_voronoi_rollover (args, svg, rollover_on, rollover_off, rollover_move, rollover_click) {
    const voronoi = d3.voronoi()
      .x(d => args.scales.X(d[args.xAccessor]).toFixed(2))
      .y(d => args.scales.Y(d[args.yAccessor]).toFixed(2))
      .extent([
        [args.buffer, args.buffer + (args.title ? args.title_yPosition : 0)],
        [args.width - args.buffer, args.height - args.buffer]
      ])

    const g = addG(svg, 'mg-voronoi')
    g.selectAll('path')
      .data(voronoi.polygons(mg_nest_data_for_voronoi(args)))
      .enter()
      .append('path')
      .filter(d => d !== undefined && d.length > 0)
      .attr('d', d => d == null ? null : `M${d.join('L')}Z`)
      .datum(d => d == null ? null : d.data) // because of d3.voronoi, reassign d
      .attr('class', mg_line_class_string(args))
      .on('click', rollover_click)
      .on('mouseover', rollover_on)
      .on('mouseout', rollover_off)
      .on('mousemove', rollover_move)

    mg_configure_voronoi_rollover(args, svg)
  }

  function nest_data_for_aggregateRollover ({ xAccessor, data, xSort }) {
    const data_nested = d3.nest()
      .key(d => d[xAccessor])
      .entries(d3.merge(data))
    data_nested.forEach(entry => {
      const datum = entry.values[0]
      entry.key = datum[xAccessor]
    })

    if (xSort) {
      return data_nested.sort((a, b) => new Date(a.key) - new Date(b.key))
    } else {
      return data_nested
    }
  }

  function mg_add_aggregateRollover (args, svg, rollover_on, rollover_off, rollover_move, rollover_click) {
    // Undo the keys getting coerced to strings, by setting the keys from the values
    // This is necessary for when we have X axis keys that are things like
    const data_nested = nest_data_for_aggregateRollover(args)

    const xf = data_nested.map(({ key }) => args.scales.X(key))

    const g = svg.append('g')
      .attr('class', 'mg-rollover-rect')

    g.selectAll('.mg-rollover-rects')
      .data(data_nested).enter()
      .append('rect')
      .attr('x', (d, i) => {
        if (xf.length === 1) return getPlotLeft(args)
        else if (i === 0) return xf[i].toFixed(2)
        else return ((xf[i - 1] + xf[i]) / 2).toFixed(2)
      })
      .attr('y', args.top)
      .attr('width', (d, i) => {
        if (xf.length === 1) return getPlotRight(args)
        else if (i === 0) return ((xf[i + 1] - xf[i]) / 2).toFixed(2)
        else if (i === xf.length - 1) return ((xf[i] - xf[i - 1]) / 2).toFixed(2)
        else return ((xf[i + 1] - xf[i - 1]) / 2).toFixed(2)
      })
      .attr('class', ({ values }) => {
        let line_classes = values.map(({ __line_id__ }) => {
          let lc = mg_line_class(__line_id__)
          if (args.colors === null) lc += ` ${mg_line_color_class(__line_id__)}`
          return lc
        }).join(' ')
        if (args.linked && values.length > 0) {
          line_classes += ` ${mg_rollover_id_class(mg_rollover_format_id(values[0], args))}`
        }

        return line_classes
      })
      .attr('height', args.height - args.bottom - args.top - args.buffer)
      .attr('opacity', 0)
      .on('click', rollover_click)
      .on('mouseover', rollover_on)
      .on('mouseout', rollover_off)
      .on('mousemove', rollover_move)

    mg_configure_aggregateRollover(args, svg)
  }

  function mg_configure_singleton_rollover ({ data }, svg) {
    svg.select('.mg-rollover-rect rect')
      .on('mouseover')(data[0][0], 0)
  }

  function mg_configure_voronoi_rollover ({ data, custom_line_color_map }, svg) {
    for (let i = 0; i < data.length; i++) {
      let j = i + 1

      if (custom_line_color_map.length > 0 &&
        custom_line_color_map[i] !== undefined) {
        j = custom_line_color_map[i]
      }

      if (data[i].length === 1 && !svg.selectAll(`.mg-voronoi .mg-line${j}`).empty()) {
        svg.selectAll(`.mg-voronoi .mg-line${j}`)
          .on('mouseover')(data[i][0], 0)

        svg.selectAll(`.mg-voronoi .mg-line${j}`)
          .on('mouseout')(data[i][0], 0)
      }
    }
  }

  function mg_line_class (line_id) {
    return `mg-line${line_id}`
  }

  function mg_line_color_class (line_id) {
    return `mg-line${line_id}-color`
  }

  function mg_rollover_id_class (id) {
    return `roll_${id}`
  }

  function mg_rollover_format_id (d, { xAccessor, utcTime, linked_format }) {
    const v = d[xAccessor]
    const formatter = MG.time_format(utcTime, linked_format)
    // only format when x-axis is date
    return (typeof v === 'number') ? v.toString().replace('.', '_') : formatter(v)
  }

  function mg_add_single_line_rollover (args, svg, rollover_on, rollover_off, rollover_move, rollover_click) {
    // set to 1 unless we have a custom increment series
    let line_id = 1
    if (args.custom_line_color_map.length > 0) {
      line_id = args.custom_line_color_map[0]
    }

    const g = svg.append('g')
      .attr('class', 'mg-rollover-rect')

    const xf = args.data[0].map(args.scaleFunctions.xf)

    g.selectAll('.mg-rollover-rects')
      .data(args.data[0]).enter()
      .append('rect')
      .attr('class', (d, i) => {
        let cl = `${mg_line_color_class(line_id)} ${mg_line_class(d.__line_id__)}`
        if (args.linked) cl += `${cl} ${mg_rollover_id_class(mg_rollover_format_id(d, args))}`
        return cl
      })
      .attr('x', (d, i) => {
        // if data set is of length 1
        if (xf.length === 1) return getPlotLeft(args)
        else if (i === 0) return xf[i].toFixed(2)
        else return ((xf[i - 1] + xf[i]) / 2).toFixed(2)
      })
      .attr('y', (d, i) => (args.data.length > 1) ? args.scaleFunctions.yf(d) - 6 // multi-line chart sensitivity
        : args.top)
      .attr('width', (d, i) => {
        // if data set is of length 1
        if (xf.length === 1) return getPlotRight(args)
        else if (i === 0) return ((xf[i + 1] - xf[i]) / 2).toFixed(2)
        else if (i === xf.length - 1) return ((xf[i] - xf[i - 1]) / 2).toFixed(2)
        else return ((xf[i + 1] - xf[i - 1]) / 2).toFixed(2)
      })
      .attr('height', (d, i) => (args.data.length > 1) ? 12 // multi-line chart sensitivity
        : args.height - args.bottom - args.top - args.buffer)
      .attr('opacity', 0)
      .on('click', rollover_click)
      .on('mouseover', rollover_on)
      .on('mouseout', rollover_off)
      .on('mousemove', rollover_move)

    if (mg_is_singleton(args)) {
      mg_configure_singleton_rollover(args, svg)
    }
  }

  function mg_configure_aggregateRollover ({ data }, svg) {
    const rect = svg.selectAll('.mg-rollover-rect rect')
    const rect_first = rect.nodes()[0][0] || rect.nodes()[0]
    if (data.filter(({ length }) => length === 1).length > 0) {
      rect.on('mouseover')(rect_first.__data__, 0)
    }
  }

  function mg_is_standard_multiline ({ data, aggregateRollover }) {
    return data.length > 1 && !aggregateRollover
  }

  function mg_is_aggregated_rollover ({ data, aggregateRollover }) {
    return data.length > 1 && aggregateRollover
  }

  function mg_is_singleton ({ data }) {
    return data.length === 1 && data[0].length === 1
  }

  function mg_draw_all_line_elements (args, plot, svg) {
    mg_remove_dangling_bands(plot, svg)

    // If option activated, remove existing active points if exists
    if (args.active_point_on_lines) {
      svg.selectAll('circle.mg-shown-active-point').remove()
    }

    for (let i = args.data.length - 1; i >= 0; i--) {
      const this_data = args.data[i]

      // passing the data for the current line
      MG.callHook('line.before_each_series', [this_data, args])

      // override increment if we have a custom increment series
      let line_id = i + 1
      if (args.custom_line_color_map.length > 0) {
        line_id = args.custom_line_color_map[i]
      }

      args.data[i].__line_id__ = line_id

      // If option activated, add active points for each lines
      if (args.active_point_on_lines) {
        svg.selectAll('circle-' + line_id)
          .data(args.data[i])
          .enter()
          .filter((d) => {
            return d[args.active_point_accessor]
          })
          .append('circle')
          .attr('class', 'mg-area' + (line_id) + '-color mg-shown-active-point')
          .attr('cx', args.scaleFunctions.xf)
          .attr('cy', args.scaleFunctions.yf)
          .attr('r', () => {
            return args.active_point_size
          })
      }

      const existing_line = svg.select(`path.mg-main-line.mg-line${line_id}`)
      if (this_data.length === 0) {
        existing_line.remove()
        continue
      }

      mg_add_confidence_band(args, plot, svg, line_id)

      if (Array.isArray(args.area)) {
        if (args.area[line_id - 1]) {
          mg_add_area(args, plot, svg, i, line_id)
        }
      } else {
        mg_add_area(args, plot, svg, i, line_id)
      }

      mg_add_line(args, plot, svg, existing_line, i, line_id)
      mg_add_legend_element(args, plot, i, line_id)

      // passing the data for the current line
      MG.callHook('line.after_each_series', [this_data, existing_line, args])
    }
  }

  function mg_remove_dangling_bands ({ existing_band }, svg) {
    if (existing_band[0] && existing_band[0].length > svg.selectAll('.mg-main-line').node().length) {
      svg.selectAll('.mg-confidence-band').remove()
    }
  }

  function mg_line_main_plot (args) {
    const plot = {}
    const svg = getSvgChildOf(args.target)

    // remove any old legends if they exist
    selectAllAndRemove(svg, '.mg-line-legend')
    mg_add_legend_group(args, plot, svg)

    plot.data_median = 0
    plot.update_transition_duration = (args.transition_on_update) ? 1000 : 0
    plot.display_area = (args.area && !args.use_data_y_min && args.data.length <= 1 && args.aggregateRollover === false) || (Array.isArray(args.area) && args.area.length > 0)
    plot.legend_text = ''
    mg_line_graph_generators(args, plot, svg)
    plot.existing_band = svg.selectAll('.mg-confidence-band').nodes()

    // should we continue with the default line render? A `line.all_series` hook should return false to prevent the default.
    const continueWithDefault = MG.callHook('line.before_all_series', [args])
    if (continueWithDefault !== false) {
      mg_draw_all_line_elements(args, plot, svg)
    }

    mg_plot_legend_if_legend_target(args.legend_target, plot.legend_text)
  }

  function mg_line_rollover_setup (args, graph) {
    const svg = getSvgChildOf(args.target)

    if (args.showActivePoint && svg.selectAll('.mg-active-datapoint-container').nodes().length === 0) {
      addG(svg, 'mg-active-datapoint-container')
    }

    mg_remove_existing_line_rollover_elements(svg)
    mg_add_rollover_circle(args, svg)
    mg_set_unique_line_id_for_each_series(args)

    if (mg_is_standard_multiline(args)) {
      mg_add_voronoi_rollover(args, svg, graph.rolloverOn(args), graph.rolloverOff(args), graph.rolloverMove(args), graph.rolloverClick(args))
    } else if (mg_is_aggregated_rollover(args)) {
      mg_add_aggregateRollover(args, svg, graph.rolloverOn(args), graph.rolloverOff(args), graph.rolloverMove(args), graph.rolloverClick(args))
    } else {
      mg_add_single_line_rollover(args, svg, graph.rolloverOn(args), graph.rolloverOff(args), graph.rolloverMove(args), graph.rolloverClick(args))
    }
  }

  function mg_update_rollover_circle (args, svg, d) {
    if (args.aggregateRollover && args.data.length > 1) {
      // hide the circles in case a non-contiguous series is present
      svg.selectAll('circle.mg-line-rollover-circle')
        .style('opacity', 0)

      d.values.forEach((datum, index, list) => {
        if (args.missingIsHidden && list[index]._missing) {
          return
        }

        if (dataInPlotBounds(datum, args)) mg_update_aggregateRollover_circle(args, svg, datum)
      })
    } else if ((args.missingIsHidden && d._missing) || d[args.yAccessor] === null) {
      // disable rollovers for hidden parts of the line
      // recall that hidden parts are missing data ranges and possibly also
      // data points that have been explicitly identified as missing

    } else {
      // show circle on mouse-overed rect
      if (dataInPlotBounds(d, args)) {
        mg_update_generic_rollover_circle(args, svg, d)
      }
    }
  }

  function mg_update_aggregateRollover_circle ({ scales, xAccessor, yAccessor, point_size }, svg, datum) {
    svg.select(`circle.mg-line-rollover-circle.mg-line${datum.__line_id__}`)
      .attr('cx', scales.X(datum[xAccessor]).toFixed(2))
      .attr('cy', scales.Y(datum[yAccessor]).toFixed(2))
      .attr('r', point_size)
      .style('opacity', 1)
  }

  function mg_update_generic_rollover_circle ({ scales, xAccessor, yAccessor, point_size }, svg, d) {
    svg.selectAll(`circle.mg-line-rollover-circle.mg-line${d.__line_id__}`)
      .classed('mg-line-rollover-circle', true)
      .attr('cx', () => scales.X(d[xAccessor]).toFixed(2))
      .attr('cy', () => scales.Y(d[yAccessor]).toFixed(2))
      .attr('r', point_size)
      .style('opacity', 1)
  }

  function mg_trigger_linked_mouseovers (args, d, i) {
    if (args.linked && !MG.globals.link) {
      MG.globals.link = true
      if (!args.aggregateRollover || d[args.yAccessor] !== undefined || (d.values && d.values.length > 0)) {
        const datum = d.values ? d.values[0] : d
        const id = mg_rollover_format_id(datum, args)
        // trigger mouseover on matching line in .linked charts
        d3.selectAll(`.${mg_line_class(datum.__line_id__)}.${mg_rollover_id_class(id)}`)
          .each(function (d) {
            d3.select(this)
              .on('mouseover')(d, i)
          })
      }
    }
  }

  function mg_trigger_linked_mouseouts ({ linked, utcTime, linked_format, xAccessor }, d, i) {
    if (linked && MG.globals.link) {
      MG.globals.link = false

      const formatter = MG.time_format(utcTime, linked_format)
      const datums = d.values ? d.values : [d]
      datums.forEach(datum => {
        const v = datum[xAccessor]
        const id = (typeof v === 'number') ? i : formatter(v)

        // trigger mouseout on matching line in .linked charts
        d3.selectAll(`.roll_${id}`)
          .each(function (d) {
            d3.select(this)
              .on('mouseout')(d)
          })
      })
    }
  }

  function mg_remove_active_data_points_for_aggregateRollover (args, svg) {
    svg.selectAll('circle.mg-line-rollover-circle').filter(({ length }) => length > 1)
      .style('opacity', 0)
  }

  function mg_remove_active_data_points_for_generic_rollover ({ custom_line_color_map, data }, svg, line_id) {
    svg.selectAll(`circle.mg-line-rollover-circle.mg-line${line_id}`)
      .style('opacity', () => {
        let id = line_id - 1
        if (custom_line_color_map.length > 0 &&
          custom_line_color_map.indexOf(line_id) !== undefined
        ) {
          id = custom_line_color_map.indexOf(line_id)
        }

        if (data[id].length === 1) {
          return 1
        } else {
          return 0
        }
      })
  }

  function mg_remove_active_text (svg) {
    svg.select('.mg-active-datapoint').text('')
  }

  function lineChart (args) {
    this.init = function (args) {
      this.args = args

      if (!args.data || args.data.length === 0) {
        args.internalError = 'No data was supplied'
        internalError(args)
        return this
      } else {
        args.internalError = undefined
      }

      rawDataTransformation(args)
      processLine(args)

      MG.callHook('line.before_destroy', this)

      init(args)

      // TODO incorporate markers into calculation of x scales
      new MG.scale_factory(args)
        .namespace('x')
        .numericalDomainFromData()
        .numericalRange('bottom')

      const baselines = (args.baselines || []).map(d => d[args.yAccessor])

      new MG.scale_factory(args)
        .namespace('y')
        .zeroBottom(true)
        .inflateDomain(true)
        .numericalDomainFromData(baselines)
        .numericalRange('left')

      if (args.xAxis) {
        new MG.axis_factory(args)
          .namespace('x')
          .type('numerical')
          .position(args.xAxis_position)
          .rug(xRug(args))
          .label(addXLabel)
          .draw()
      }

      if (args.yAxis) {
        new MG.axis_factory(args)
          .namespace('y')
          .type('numerical')
          .position(args.yAxis_position)
          .rug(yRug(args))
          .label(addYLabel)
          .draw()
      }

      this.markers()
      this.mainPlot()
      this.rollover()
      this.windowListeners()
      if (args.brush) MG.addBrushFunction(args)
      MG.callHook('line.after_init', this)

      return this
    }

    this.mainPlot = function () {
      mg_line_main_plot(args)
      return this
    }

    this.markers = function () {
      markers(args)
      return this
    }

    this.rollover = function () {
      mg_line_rollover_setup(args, this)
      MG.callHook('line.after_rollover', args)

      return this
    }

    this.rolloverClick = args => (d, i) => {
      if (args.click) {
        args.click(d, i)
      }
    }

    this.rolloverOn = args => {
      const svg = getSvgChildOf(args.target)

      return (d, i) => {
        mg_update_rollover_circle(args, svg, d)
        mg_trigger_linked_mouseovers(args, d, i)

        svg.selectAll('text')
          .filter((g, j) => d === g)
          .attr('opacity', 0.3)

        // update rollover text except for missing data points
        if (args.show_rollover_text &&
            !((args.missingIsHidden && d._missing) || d[args.yAccessor] === null)
        ) {
          const mouseover = mouseoverText(args, { svg })
          let row = mouseover.mouseover_row()
          if (args.aggregateRollover) {
            row.text((args.aggregateRollover && args.data.length > 1
              ? formatXAggregateMouseover
              : formatXMouseover)(args, d))
          }

          const pts = args.aggregateRollover && args.data.length > 1
            ? d.values
            : [d]

          pts.forEach(di => {
            if (args.aggregateRollover) {
              row = mouseover.mouseover_row()
            }

            if (args.legend) {
              mg_line_color_text(row.text(`${args.legend[di.__index__ - 1]}  `).bold(), di.__line_id__, args)
            }

            mg_line_color_text(row.text('\u2014  ').elem, di.__line_id__, args)
            if (!args.aggregateRollover) {
              row.text(formatXMouseover(args, di))
            }

            row.text(formatYMouseover(args, di, args.timeSeries === false))
          })
        }

        if (args.mouseover) {
          args.mouseover(d, i)
        }
      }
    }

    this.rolloverOff = args => {
      const svg = getSvgChildOf(args.target)

      return (d, i) => {
        mg_trigger_linked_mouseouts(args, d, i)
        if (args.aggregateRollover) {
          mg_remove_active_data_points_for_aggregateRollover(args, svg)
        } else {
          mg_remove_active_data_points_for_generic_rollover(args, svg, d.__line_id__)
        }

        if (args.data[0].length > 1) {
          clearMouseoverContainer(svg)
        }

        if (args.mouseout) {
          args.mouseout(d, i)
        }
      }
    }

    this.rolloverMove = args => (d, i) => {
      if (args.mousemove) {
        args.mousemove(d, i)
      }
    }

    this.windowListeners = function () {
      windowListeners(this.args)
      return this
    }

    this.init(args)
  }

  MG.register('line', lineChart)
}
