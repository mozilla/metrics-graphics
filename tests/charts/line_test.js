module('line');

test('Confidence band is added', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12, 'l': 10, 'u': 14},
               {'date': new Date('2014-03-01'), 'value': 18, 'l': 16, 'u': 20}],
        show_confidence_band: ['l', 'u']
    };

    MG.data_graphic(params);
    ok(document.querySelector('.mg-confidence-band'), 'Confidence band is added');
});

test('Only one confidence is added on multiple calls to the same target element', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12, 'l': 10, 'u': 14},
               {'date': new Date('2014-03-01'), 'value': 18, 'l': 16, 'u': 20}],
        show_confidence_band: ['l', 'u'],
        title: 'confidence added multiple calls'
    };
    var params2 = MG.clone(params)
    MG.data_graphic(params);
    MG.data_graphic(params2);
    equal(document.querySelectorAll(params.target + ' .mg-confidence-band').length, 1, 'We only have one confidence band');
});

test('args.area set to true', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}]
    };

    MG.data_graphic(params);
    ok(document.querySelector('.mg-main-area'), 'Path set for area');
});

test('args.area set to false', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}],
        area: false
    };

    MG.data_graphic(params);
    equal(document.querySelector('.mg-main-area'), null, 'No path for area');
});

// NEEDS TO BE REWRITTEN IN LIGHT OF #614
// test('A solitary active datapoint exists', function() {
//     var params = {
//         target: '#qunit-fixture',
//         data: [{'date': new Date('2014-01-01'), 'value': 12},
//                {'date': new Date('2014-03-01'), 'value': 18}]
//     };

//     MG.data_graphic(params);
//     equal(document.querySelectorAll('.mg-active-datapoint').length, 1, 'One active datapoint exists');
// });

test('A solitary rollover circle exists', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}]
    };

    MG.data_graphic(params);
    equal(document.querySelectorAll('.mg-line-rollover-circle').length, 1, 'One rollover circle exists');
});

test('Rollovers work for single lines', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}]
    };

    MG.data_graphic(params);
    ok(document.querySelector('.mg-rollover-rect'), 'Rollovers exist');
});

test('Rollovers work for multiple lines', function() {
    var params = {
        target: '#qunit-fixture',
        data: [[{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}],
               [{'date': new Date('2014-01-01'), 'value': 120},
               {'date': new Date('2014-03-01'), 'value': 180}]]
    };

    MG.data_graphic(params);
    ok(document.querySelector('.mg-voronoi'), 'Rollovers exist');
});

test('We have only one set of rollovers for single lines', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}]
    };

    MG.data_graphic(params);
    equal(document.querySelectorAll('.mg-rollover-rect').length, 1, 'One set of rollovers exists');
});

test('We have only one set of rollovers for multiple lines', function() {
    var params = {
        target: '#qunit-fixture',
        data: [[{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}],
               [{'date': new Date('2014-01-01'), 'value': 120},
               {'date': new Date('2014-03-01'), 'value': 180}]]
    };

    MG.data_graphic(params);
    equal(document.querySelectorAll('.mg-voronoi').length, 1, 'One set of rollovers exists');
});

test('We use the rect-style rollovers when `aggregate_rolloveres == true`', function() {
    var params = {
        target: '#qunit-fixture',
        data: [[{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}],
               [{'date': new Date('2014-01-01'), 'value': 120},
               {'date': new Date('2014-03-01'), 'value': 180}]],
        aggregate_rollover: true
    };

    MG.data_graphic(params);

    // ensure rollover returns aggregated result data
    equal(document.querySelectorAll('.mg-voronoi').length, 0, 'Voronoi rollover is not generated');
    equal(document.querySelectorAll('.mg-rollover-rect').length, 1, 'Rect rollover is generated');
});

test('There are as many lines as data series (one)', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}]
    };

    MG.data_graphic(params);
    equal(document.querySelectorAll('.mg-main-line').length, 1, 'One line exists');
});

test('There are as many lines as data series (two)', function() {
    var params = {
        target: '#qunit-fixture',
        data: [[{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}],
               [{'date': new Date('2014-01-01'), 'value': 120},
               {'date': new Date('2014-03-01'), 'value': 180}]]
    };

    MG.data_graphic(params);
    equal(document.querySelectorAll('.mg-main-line').length, 2, 'Two lines exist');
});

test('There are as many lines as data series (two) on multiple calls to an existing chart', function() {
    var params = {
        target: '#qunit-fixture',
        data: [[{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}],
               [{'date': new Date('2014-01-01'), 'value': 120},
               {'date': new Date('2014-03-01'), 'value': 180}]]
    };
    var params2 = MG.clone(params);
    MG.data_graphic(params);
    MG.data_graphic(params2);

    equal(document.querySelectorAll('.mg-main-line').length, 2, 'Two lines exist');
});

test('No zombie lines when we update a chart with fewer lines', function() {
    var params = {
        target: '#qunit-fixture',
        data: [[{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}],
               [{'date': new Date('2014-01-01'), 'value': 120},
               {'date': new Date('2014-03-01'), 'value': 180}]]
    };

    var params2 = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}]
    };

    MG.data_graphic(params);
    MG.data_graphic(params2);

    equal(document.querySelectorAll('.mg-main-line').length, 1, 'One line exists');
});

test('Rollover circle is visible on load if the dataset is of length 1', function() {
    var data = [{"date": '2014-02-01', "value": 6}];
    var data = MG.convert.date(data, 'date');

    MG.data_graphic({
        data: data,
        target: "#qunit-fixture"
    });

    deepEqual(d3.select('.mg-line-rollover-circle').style('opacity'), "1", 'Rollover circle is visible');
});

// NEEDS TO BE REWRITTEN IN LIGHT OF #614
// test('Only one active data point container is added on multiple calls to the same target element', function() {
//     var params = {
//         target: '#qunit-fixture',
//         data: [{'date': new Date('2014-01-01'), 'value': 12, 'l': 10, 'u': 14},
//                {'date': new Date('2014-03-01'), 'value': 18, 'l': 16, 'u': 20}]
//     };

//     MG.data_graphic(params);
//     MG.data_graphic(MG.clone(params));

//     equal(document.querySelectorAll('.mg-active-datapoint-container').length, 1, 'We only have one active data point container');
// });

test('No zombie lines when custom_line_color_map is set', function() {
    var data = [];
    data[0] = [{'date': new Date('2015-03-05'), 'value': 12000}];
    data[1] = [{'date': new Date('2015-03-06'), 'value': 35000}];
    data[2] = [{'date': new Date('2015-03-07'), 'value': 23000},{'date': new Date('2015-03-08'), 'value': 20000}];

    MG.data_graphic({
        data: data,
        target: '#qunit-fixture',
        max_data_size: 5,
        custom_line_color_map: [3,4,5]
    });

    MG.data_graphic({
        data: data,
        target: '#qunit-fixture',
        max_data_size: 5,
        custom_line_color_map: [1,2,3]
    });

    equal(document.querySelectorAll('.mg-main-line.mg-line5-color').length, 0, 'Line 5 was removed on update');
});

test('Only one line legend is added on multiple calls to the same target element', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}],
        legend: ['US', 'CA'],
        line_legends: true
    };

    MG.data_graphic(params);
    MG.data_graphic(MG.clone(params));

    equal(document.querySelectorAll('.mg-line-legend').length, 1, 'We only have one mg-line-legend');
});

test('Only one active data point container added on multiple calls to the same target element (lines)', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}]
    };

    MG.data_graphic(params);
    MG.data_graphic(MG.clone(params));

    equal(document.querySelectorAll('.mg-active-datapoint-container').length, 1, 'We only have one mg-active-datapoint-container with lines');
});

test('When 1 data series is empty (out of 2) and missing_is_zero is true, remaining line is rendered', function() {
    var data = [];
    data[0] = [];
    data[1] = [{'date': new Date('2015-03-07'), 'value': 23000},{'date': new Date('2015-03-08'), 'value': 20000}];

    MG.data_graphic({
        target: '#qunit-fixture',
        data: data,
        missing_is_zero: true
    });

    equal(document.querySelectorAll('.mg-main-line').length, 1, 'Line for non-empty data series is still rendered');
});

//Explores branch 10
test('y_axis_position set to right', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}],
        legend: ['US', 'CA'],
        y_axis_position: 'right'
    };

    MG.data_graphic(params);
    equal(document.querySelector('.mg-line-legend-color').getAttribute('text-anchor'), 'end', 'text-anchor is set to "end"');
});

//Explores branches 5, 8
test('legend-target is set', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}],
        legend: ['US', 'CA'],
        legend_target: '.legend',
    };

    MG.data_graphic(params);
    equal(document.querySelector('#qunit-fixture').style.color, "", 'color is not set');
});

//Explores branch 5 and 7
test('legend-target and colors are set', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}],
        legend: ['US', 'CA'],
        legend_target: '.legend',
        colors: ['blue', 'rgb(255,100,43)', '#CCCCFF']
    };

    MG.data_graphic(params);
    ok(document.querySelector('.mg-line-legend'), "mg-line-legend is added");
});

//Explores branch 4
test('legend-target is set to an integer', function() {
    var params = {
        target: '#qunit-fixture',
        data: [{'date': new Date('2014-01-01'), 'value': 12},
               {'date': new Date('2014-03-01'), 'value': 18}],
        legend: 2
    };

    MG.data_graphic(params);
    ok(document.querySelector('.mg-line-legend'), "mg-line-legend should have been added");
});
