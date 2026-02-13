var Series = (function() {
	function Series(_param_func = null, entwicklungspunkt = 0) {
		const paramFunc = _param_func || function(__n) { return 1;};
		this.param_func = paramFunc;
		this.entwicklungspunkt = entwicklungspunkt;
	}
	
    Series.prototype.getPolynomFunc = function(gradDesPolynom, _entwicklungspunkt = null) {
		if(_entwicklungspunkt !== null) {
			this.entwicklungspunkt = _entwicklungspunkt;
		}
		
		const paramFunc = this.param_func;
		const entwicklungspunkt = this.entwicklungspunkt;
		
        const polynomFunc = function(x) {
            let val = 0;
            for(let n = 0; n <= gradDesPolynom; ++n) {
                val += ( paramFunc(n) * (Math.pow( (x - entwicklungspunkt), n)) )
            }
            return val;
        }
        return polynomFunc;
    }

    return Series;
})();
