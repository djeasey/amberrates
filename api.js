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
		$(".rates").append(dailyCombined.toFixed(0));
		$(".rates").append("c/day<br>");
		$(".rates").append("<br>");

		$.each(response.data.variablePricesAndRenewables, function(index, value) {
			var endTimeWithZone = value.period + '.000+10:00'
			var endTimeAsNumber = Date.parse(endTimeWithZone);
			var endTime = new Date(endTimeAsNumber);
			var currentTime = new Date();

			var HoursDiff = (endTime - currentTime) / 36e5;
			if (HoursDiff >= 0 && HoursDiff < 6) {
				var startTime = new Date(endTime - 18e5);
				var startTimeString = startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
				var endTimeString = endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});

				var startDay = startTime.getDay();
				var startHour = startTime.getHours();
				var startMinutes = startTime.getMinutes();
				
				var timeOfUse;
				var fixedCost;

				if (startHour >= 22 || startHour <= 6) {
					timeOfUse = 'OffP';
					fixedCost = fixedCombined + fixedOffPeak;
				} else if (startDay >= 1 && startDay <= 5 && startHour >= 15 && startHour <= 20) {
					timeOfUse = 'Peak';
					fixedCost = fixedCombined + fixedPeak;
				} else {
					timeOfUse = 'Shou';
					fixedCost = fixedCombined + fixedShoulder;
				}

				$(".rates").append(startTimeString);
				$(".rates").append("-");
				$(".rates").append(endTimeString);
				$(".rates").append(" (");
				$(".rates").append(timeOfUse);
				$(".rates").append(") ");
				$(".rates").append(" - ");
				var cost = parseFloat(value.wholesaleKWHPrice) * lossFactor + fixedCost;
				$(".rates").append(cost.toFixed(0));
				$(".rates").append("c/kWh<br>");
			}

		});
	});
});