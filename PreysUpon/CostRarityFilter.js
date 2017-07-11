function CostRarityFilter(origin, updateCallback)
{
	rarities = ["Common", "Uncommon", "Rare", "Mythic Rare"];
	_rarities_filter = rarities;
	_cost_filter = [-99, 99];

	init();



	function init()
	{
		var checkboxDiv = origin.append("form");
	// var rarities_filter = rarities;
		var rarityCheckboxFilter = check(checkboxDiv,
			function(newFilters)
			{
				_rarities_filter = newFilters;
				updateCallback();
			});
		rarityCheckboxFilter.update(rarities);

		var costFilterDiv = origin.append("div");
			// .attr("class", "col-sm-6 offset-2");
		var costSliderFilter = CostFilter(costFilterDiv, function(range, isOnEdges)
			{
				_cost_filter[0] = isOnEdges[0]? -99 : range[0];
				_cost_filter[1] = isOnEdges[1]? 99 : range[1];

				updateCallback();
			}, [0, 10], true, "ex1");
	}

	function applyTo(cardQuery)
	{
		return cardQuery.getAllWithCostBetween(_cost_filter)
			.getAllInRarities(_rarities_filter);
	}


	return {
		rarities_filter: _rarities_filter,
		CostFilter: _cost_filter,
		applyTo: applyTo
	};
}