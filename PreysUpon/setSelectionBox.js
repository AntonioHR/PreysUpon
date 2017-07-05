function mtgSetsSelector(selector, listOrigin, allSets, updateCallback)
{

	var dataset = parseAllSets(allSets);
	var selections = [];

	var options = selector.selectAll("option").data(dataset).enter()
		.append("option")
		.text(function(d){return d.name;});



	selector.on("change", onSetSelected);
	draw();

	function onSetSelected()
	{
		var node = selector.node();

		var currentObj = node.options[node.selectedIndex].data;

		selections.push(dataset[node.selectedIndex]);
		draw();
		updateCallback();
	}

	function draw(){
		var elements = listOrigin.selectAll("li")
			.data(selections);
		elements.exit().remove();
		elements.selectAll("button").remove();
		var p = elements.enter();
		var newEls = p.append("li")
			.attr("class", "list-group-item");
		var total =newEls.merge(elements)
				.text(function(d){return d.name + "("+d.cards.length +")";});
		total.append("button")
				.attr("class", "close glyphicon glyphicon-remove float-right")
				.on("click", function(d)
					{
						selections.splice(selections.indexOf(d), 1);
						draw();
						updateCallback();
					});
	}

	function parseAllSets(AllSets, includeExtras)
	{
		var result = [];
		for(var key in AllSets)
		{
			if(includeExtras || AllSets[key].type == "core" || AllSets[key].type == "expansion")
				result.push(AllSets[key]);
		}
		return result;
	}
	function getSelectedCards()
	{
		result = [];
		for(var set in selections)
		{
			result = result.concat(selections[set].cards);
		}
		return result;
	}

	return {
		getSelectedCards:getSelectedCards
	};
}
function filterJustCreaturesFromAllSets(allSets)
{
    var creatureFilter = function(d)
        {
            if(!d.types)
            {
                return false;
            }
            return d.types.includes("Creature");
        };
	for(var key in allSets)
	{
		allSets[key].cards =
			allSets[key].cards.filter(creatureFilter);
	}
	return allSets;
}