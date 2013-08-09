SCENARIO.Criteria = {
	"a Namespace of X.Y.Z" : function(){
		return new Jam.Namespace("X.Y.Z");
	},
	
	"it is imported" : function(scenario){
		function event(){
			if(scenario.Get("a web page").readyState == "complete"){
				scenario.Assert("it is loaded", true);
			}
		}
		var ns = scenario.Get("a Namespace of X.Y.Z");
		return false;
	}
}


SCENARIO("Check the default module is imported into it's namespace").
	GIVEN("a Namespace of X.Y.Z").
		WHEN("it is imported").
			THEN("X.Y.Z should be available").
END();


SCENARIO("Check an array of Namespace can be imported").
END();

SCENARIO("Check an array of Modules can be imported into one Namespace").
END();

SCENARIO("Check dependant modules are imported").
END();