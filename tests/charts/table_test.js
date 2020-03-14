var target = '#qunit-fixture',
  defaults;

module('table', {
  setup: function() {
    defaults = {
      data: [{
        label: 'Bar 1',
        value: 100
      },{
        label: 'Bar 2',
        value: 200
      },{
        label: 'Bar 3',
        value: 300
      }],
      target: target,
      title: {accessor: 'point_name', align: 'left'},
      description: {accessor: 'description'},
      number: {accessor: ""}
    };
  }
});

test('Trivial check that the HTML element has been added', function() {
  var table = MG.data_table(defaults);
  table.display();
  ok(document.querySelector('.mg-data-table'), 'Data table exists');
});
