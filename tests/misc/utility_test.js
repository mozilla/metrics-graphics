module('utility');

test('MG.convert.date', function() {
    var data = [{'date': '2014-01-01', 'value': 12},
               {'date': '2014-03-01', 'value': 18}];

    MG.convert.date(data, 'date');
    equal($.type(data[0].date), 'date', 'First date is of type date');
    equal($.type(data[1].date), 'date', 'Second date is of type date');
});

test('MG.convert.date with an alternative timestamp style', function() {
    var data = [{'date': '2014-20-12', 'value': 12},
               {'date': '2014-21-12', 'value': 18}];

    MG.convert.date(data, 'date', '%Y-%d-%m');
    equal($.type(data[0].date), 'date', 'First date is of type date');
    equal($.type(data[1].date), 'date', 'Second date is of type date');
});

test('MG.convert.number', function() {
    var data = [{'date': '2014-20-12', 'value': '12'},
               {'date': '2014-21-12', 'value': '18'}];

    MG.convert.number(data, 'value');
    equal($.type(data[0].value), 'number', 'First value is a number');
    equal($.type(data[1].value), 'number', 'Second value is a number');
});

test('MG.convert.number with nulls', function() {
    var data = [{'date': '2014-20-12', 'value': '0'},
               {'date': '2014-21-12', 'value': null}];

    MG.convert.number(data, 'value');
    equal($.type(data[0].value), 'number', 'First value is a number');
    equal($.type(data[1].value), 'null', 'Second value is null');
});

test('mg_get_svg_child_of', function(){
    d3.select('#qunit-fixture').append('svg');

    var svg_element_with_node = mg_get_svg_child_of(document.querySelector('#qunit-fixture'));
    var svg_element_with_text = mg_get_svg_child_of('#qunit-fixture');

    equal(svg_element_with_node.nodes().length, 1, 'Node-based argument should return a d3 selection with svg.');
    equal(svg_element_with_node.nodes().length, 1, 'Selector-based argument should return a d3 selection with svg.');
});


test('mg_target_ref', function() {
    var chart_area2 = document.createElement('div');
    mg_target_ref(chart_area2);
    ok(chart_area2.getAttribute('data-mg-uid').match(/mg-[\d]/), 'applies generated ID to DOM element');
});

test('Overlapping markers are taken care of', function() {
    var params = {
      data: [{
        "date": new Date('2016-01-01'),
        "value": 6
      },
      {
        "date": new Date('2016-01-02'),
        "value": 8
      },
      {
        "date": new Date('2016-01-03'),
        "value": 34
      },
      {
        "date": new Date('2016-01-04'),
        "value": 38
      }],
      markers: [{'date': new Date('2016-01-02'), 'label': 'A happened'},{'date': new Date('2016-01-02'), 'label': 'B happened'}],
      target: "#qunit-fixture"
    };

    MG.data_graphic(params);

    equal(mg_is_horizontally_overlapping(d3.selectAll('.mg-marker-text').node(), d3.selectAll('.mg-marker-text').nodes()), false, 'Markers aren\'t overlapping');
});

test('compare_type', function() {
    [
        ['number', null, true],
        ['number', 1, true],
        ['number', 'str', false],
        ['number[]', 1, false],
        ['number[]', [1], true],
        ['object[]', [{}, 1], false],
        [['number', 'string'], 1, true],
        [['number', 'string'], 'str', true],
        [['number', 'string'], {}, false],
        [['a', 'b'], 'a', true],
        [['a', 'b'], 'c', false]
    ].forEach(i => {
        equal(compare_type(i[0], i[1]), i[2], i);
    });
});
