$(document).ready(function(){
	var settings = {
		"url": "https://api.amberelectric.com.au/prices/listprices",
		"method": "POST",
		"timeout": 0,
		"headers": {
		"Content-Type": "text/plain"
		},
		"data": "{ \"postcode\": \"3194\"}",
	};

	$.ajax(settings).done(function (response) {

		var lossFactor = parseFloat(response.data.staticPrices.E1.lossFactor);
		var fixedCarbonNeutral = 0.11;
		var fixedEnvCert = 2.6169;
		var fixedMarket = 0.2486;
		var fixedPriceProtection = 0.77;
		var fixedCombined = fixedCarbonNeutral + fixedEnvCert + fixedMarket + fixedPriceProtection;
		var fixedOffPeak = 3.773;
		var fixedPeak = 16.863;
		var fixedShoulder = 6.765;

		var dailyAmber = 32.8767;
		var dailyMetering = 15.3494;
		var dailyNetwork = 12.0450;
		var dailyNetworkPFIT = 5.9950;
		var dailyCombined = dailyAmber + dailyMetering + dailyNetwork + dailyNetworkPFIT;

		$(".rates").append("Daily Cost - ");
		$(".rates").append(dailyCombined.toFixed(2));
		$(".rates").append("<br>");
		$(".rates").append("<br>");

		$.each(response.data.variablePricesAndRenewables, function( index, value ) {
			var dateAsNumber = Date.parse(value.period + '.000+10:00');
			var date = new Date(dateAsNumber);
			var currentdate = new Date();
			var dayOfWeek = date.getUTCDay();
			var hour = date.getUTCHours();
			var minutes = date.getUTCMinutes();
			var dateString = date.toLocaleTimeString();;
			var timeOfUse;
			var fixedCost;
			if (hour == 12 && minutes == 30) {
				timeOfUse = 'offpeak';
			} else if (hour >= 13 && hour <= 20) {
				timeOfUse = 'offpeak';
			} else if (hour == 21 && minutes == 0) {
				timeOfUse = 'offpeak';
			} else if (dayOfWeek >= 1 && dayOfWeek <= 5) {
				if (hour == 5 && minutes == 30) {
					timeOfUse = 'peak';
				} else if (hour >= 6 && hour <= 10) {
					timeOfUse = 'peak';
				} else if (hour == 11 && minutes == 0) {
					timeOfUse = 'peak';
				} else {
					timeOfUse = 'shoulder';
				}
			} else {
				timeOfUse = 'shoulder';
			}

			if (timeOfUse == 'peak') {
				fixedCost = fixedCombined + fixedPeak;
			} else if (timeOfUse == 'shoulder') {
				fixedCost = fixedCombined + fixedShoulder;
			} else if (timeOfUse == 'offpeak') {
				fixedCost = fixedCombined + fixedOffPeak;
			}

			var hoursDiff = Math.abs(currentdate - date) / 36e5;
			if (hoursDiff < 4) {
				$(".rates").append(dateString);
				$(".rates").append(" (");
				$(".rates").append(timeOfUse);
				$(".rates").append(") ");
				$(".rates").append(" - ");
				var cost = parseFloat(value.wholesaleKWHPrice) * lossFactor + fixedCost;
				$(".rates").append(cost.toFixed(2));
				$(".rates").append("<br>");
			}

		});
	});
});