function checkBoxFilter(origin, updateCallback, nameFunction)
{
	if(!nameFunction)
		nameFunction = function(d){return d;};
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

	function update(newData){
		selections = newData;
		var elements = origin.selectAll("div")
			.data(newData);

		elements.exit().remove();

		var newElements = elements.enter()
			.append("label")
			.attr("class", "switch");

		var totalElements = newElements.merge(elements);



		newElements.append("input")
			.attr("type", "checkbox")
			.attr("checked", true);

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

		// totalElements.selectAll("label")
		// 	.datum(function(d){return d;})
		// 	.attr("for", nameFunction)
		// 	.text(nameFunction);
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