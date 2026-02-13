var Graph2d = (function() {
	function Graph(f, min_x, max_x, step) {
		this.graph = [];
		this._min = []; // Minimum für x und y
		this._max = []; // Maximum für x und y
		
		let first = true;
		for(let x = min_x; x <= max_x; x += step) {
			let y = f(x);
			let point = [x, y];
			if(first) {
				this._min[0] = point[0];
				this._min[1] = point[1];
				this._max[0] = point[0];
				this._max[1] = point[1];
				first = false;
			} else {
				this._min[0] = Math.min(this._min[0], point[0]); // min x
				this._min[1] = Math.min(this._min[1], point[1]); // min y
				this._max[0] = Math.max(this._max[0], point[0]); // max x
				this._max[1] = Math.max(this._max[1], point[1]); // max y
			}
			this.graph.push(point);
		}
	}
	
	Graph.prototype.getGraph = function() {
		return this.graph;
	}
	
	// nth_element heisst wenn nth_element = 0 dann ist es die x Achse, wenn 1 die y Achse
	Graph.prototype.getMin = function(nth_element) {
		return this._min[nth_element];
	}
	
	Graph.prototype.getMax = function(nth_element) {
		return this._max[nth_element];
	}

	Graph.prototype.scale = function(new_min_x, new_max_x, new_min_y, new_max_y) {
		const graph = [];
		for(let i = 0; i < this.graph.length; ++i) {
			let point = this.graph[i];
			
			let old_x = point[0];
			let old_y = point[1];
			
			let old_range_x = this._max[0] - this._min[0];
			let old_range_y = this._max[1] - this._min[1];
			
			let new_range_x = new_max_x - new_min_x;
			let new_range_y = new_max_y - new_min_y;
			
			let new_x = (new_range_x / old_range_x) * old_x;
			let new_y = (new_range_y / old_range_y) * old_y;
			
			graph.push([new_x, new_y]);
		}
		this.graph = graph;
		return this;
	}
	
	return Graph;
})();

