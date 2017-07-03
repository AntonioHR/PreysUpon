function checkBoxFilter(origin, updateCallback, nameFunction)
{
	if(!nameFunction)
		nameFunction = function(d){return d;};
	var selections = [];
	init();

	function init()
	{
		selections = [];
	}

	function addSelection(element)
	{
		selections.push(element);
	}

	function removeSelection(element)
	{
		var index = selections.indexOf(element);
		if(index != -1)
			selections.splice(index, 1);
	}

	function update(newData, checked){
		if(!checked)
			selections = newData;
		else
			selections = checked;

		var elements = origin.selectAll("div")
			.data(newData);

		elements.exit().remove();

		var newElements = elements.enter()
			.append("label")
			.attr("class", "switch");

		var totalElements = newElements.merge(elements);

		newElements.append("input")
			.attr("type", "checkbox")
			.each(function(d)
			{
				setChecked(this, d);
				// if(c.indexOf(d) != -1)
				// 	d3.select(this).attr("checked", true);
			});
			// .attr("checked", function(d){return checked? (checked.indexOf(d) != -1?1:0) : 1;});
			// .attr("checked", 0);

		totalElements.selectAll("input")
			.datum(function(d){return d;})
			.attr("name", nameFunction)
			.on("change", function(d)
			{
				if(this.checked)
					addSelection(d);
				else
					removeSelection(d);
				updateCallback(selections);
			});

		newElements.append("div")
			.datum(function(d){return d;})
			.attr("class", function(d)
			{
				return "toggle_slider round " + d;
			});
	}


	function setChecked(obj, val)
	{

		if(selections.indexOf(val) != -1)
			d3.select(obj).attr("checked", true);
	}
	function getSelections()
	{
		return selections;
	}

	return {
		update:update,
		getSelections:getSelections
	};
}