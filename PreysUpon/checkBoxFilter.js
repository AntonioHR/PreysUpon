function checkBoxFilter(origin, updateCallback, nameFunction)
{
	if(!nameFunction)
		nameFunction = function(d){return d;};
	init();

	function init()
	{
		this.selections = [];
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
		var elements = origin.selectAll("d")
			.data(newData);

		elements.exit().remove();

		var newElements = elements.enter()
			.append("d");

		var totalElements = newElements.merge(elements);



		newElements.append("input")
			.attr("type", "checkbox");

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

		newElements.append("label");

		totalElements.selectAll("label")
			.datum(function(d){return d;})
			.attr("for", nameFunction)
			.text(nameFunction);
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