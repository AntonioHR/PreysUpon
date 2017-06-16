function powerToughnessSelector(selector, powerField, toughnessField, updateCallback)
{
	var values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

	powerField.selectAll("option").data(values).enter()
		.append("option")
		.text(function(d){return d;});
	toughnessField.selectAll("option").data(values).enter()
		.append("option")
		.text(function(d){return d;});

	selector.on("change", onChangeCeature);
	powerField.on("change", onChangePower);
	toughnessField.on("change", onChangeToughness);

	function updateData(data)
	{
		var options = selector.selectAll("option").data(data);
		options.exit().remove();
		var newOptions = options.enter().append("option");
		var total = newOptions.merge(options).text(function(d){return d.name;});		
	}

	function onChangeCeature()
	{
        var node = selector.node();
        var card = d3.select(node.options[node.selectedIndex]).data()[0];

        powerField.property("value", card.power);
        toughnessField.property("value", card.toughness);

        updateCallback();
	}

	function onChangePower()
	{
		updateCallback();
	}

	function onChangeToughness()
	{
		updateCallback();
	}

	function getPower()
	{
		var node = powerField.node();
        var number = d3.select(node.options[node.selectedIndex]).data();
		return +number;
	}

	function getToughness()
	{
		var node = toughnessField.node();
        var number = d3.select(node.options[node.selectedIndex]).data();
		return +number;
	}
	return {
		update:updateData,
		getPower:getPower,
		getToughness:getToughness,
	}
}