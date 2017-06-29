function CostFilter(origin, updateCallback, range, id)
{
	init();

	function init()
	{
		// <div class="col-sm-10 offset-2">
		// 		<input id="ex1" data-provide="slider" data-slider-id='ex1Slider' type="text" data-slider-min="0" data-slider-max="10" data-slider-step="1" data-slider-value="[0, 10]"/>
		// 	</div>
		selections = range;

		var div = origin.append("div").attr("claa", "row");
		div.append("b").text(range[0]).attr("class", "col-sm-2");
		var divChild = div.append("div");


		var sliderJQuery = $(divChild.node()).slider({ id: "slider12a", min: range[0], max: range[1], value: range });
		sliderJQuery.on("change", function(val)
		{
			Update(val.value.newValue)
		});
		divChild.remove();

		var slider = d3.select(sliderJQuery.get(0)).attr("class", "col-sm-6");
		div.append("b").text(range[1]+"+").attr("class", "col-sm-2");
	}
	function Update(filterRange)
	{
		var result = filterRange;
		console.log(result);
		var isOnEdges = [result [0] == range[0], result[1] == range[1]];
		updateCallback(result, isOnEdges);
	}
}