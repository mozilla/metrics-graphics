module('button');

test('Test that a button is created', function() {
    var btn = MG.button_layout(document.createElement('div'));
    btn.data([1,2,3]);
    btn.display();
    ok(document.querySelector('button'), 'A button has been created');
});

/* BROKEN TEST
test('Test button callback', function() {
    var btn = MG.button_layout(document.createElement('div'));
    btn.data([1,2,3]);
    var called = false;
    btn.callback(function(feature, k) { called = true; });
    btn.display();
    document.querySelector('button').click();
    // var btnElem = document.querySelector('button');
    // btnElem.dispatchEvent(generateMouseEvent('mouseclick'));
    equal(called, true, 'The callback was called');
});
*/