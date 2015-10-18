var histogram_defaults;

module('histogram', {
  setup: function() {
    histogram-defaults = {
        target: '#qunit-fixture',
        data: d3.range(10000).map(d3.random.bates(10)),
        chart_type: 'histogram',
        linked: true
    };
  }
});

test('A solitary active datapoint exists', function() {
    var params = extend(histogram-defaults);
    MG.data_graphic(params);
    equal(document.querySelectorAll('.mg-active-datapoint').length, 1, 'One active datapoint exists');
});

test('Rollovers exist', function() {
    var params = extend(histogram-defaults);
    MG.data_graphic(params);
    ok(document.querySelector('.mg-rollover-rect'), 'Rollovers exist');
});

test('We have only one set of rollovers', function() {
    var params = extend(histogram-defaults);
    MG.data_graphic(params);
    equal(document.querySelectorAll('.mg-rollover-rect').length, 1, 'One set of rollovers exists');
});

test('Linked chart has the required class set', function() {
    var params = extend(histogram_defaults);
    MG.data_graphic(params);
    var matches = document.querySelector(params.target + ' svg').getAttribute('class').match(/linked/);
    ok(matches, 'Linked chart has class `linked` set');
});

test('Histogram exists', function() {
    var params = extend(histogram_defaults);
    MG.data_graphic(params);
    ok(document.querySelector('.mg-histogram'), 'Histogram exists');
});

test('Triggers callbacks when provided', function() {
    var mouseoverCalled = false,
        mousemoveCalled = false,
        mouseoutCalled = false,
        clickCalled = false,

    var params = extend(histogram_defaults, {
        mouseover: function() {
            mouseoverCalled = true;
        },
        mousemove: function() {
            mousemoveCalled = true;
        },
        mouseout: function() {
            mouseoutCalled = true;
        },
        click: function() {
            clickCalled = true;
        }
    });

    MG.data_graphic(params);

    var element = document.getElementsByClassName('mg-rollover-rects')[0];

    element.dispatchEvent(generateMouseEvent('mouseover'));
    equal(mouseoverCalled, true, 'mouseover was called');

    element.dispatchEvent(generateMouseEvent('mousemove'));
    equal(mousemoveCalled, true, 'mousemove was called');

    element.dispatchEvent(generateMouseEvent('mouseout'));
    equal(mouseoutCalled, true, 'mouseout was called');

    element.dispatchEvent(generateMouseEvent('click'));
    equal(clickCalled, true, 'click was called');
});

